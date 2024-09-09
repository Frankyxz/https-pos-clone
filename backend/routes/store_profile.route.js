const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Store_Profile,
  Store_Status,
  Store_Status_History,
  Order_Transaction,
  Cart,
  Product_Inventory_Accumulate,
  Raw_Inventory_Accumulate,
  Activity_Log,
} = require("../db/models/associations");

router.route("/save_profile").put(async (req, res) => {
  try {
    const {
      userId,
      storeCode,
      storeName,
      storeCountry,
      storeImage,
      ipPrinter,
    } = req.body;

    const data = await Store_Profile.findOne();

    if (data) {
      const isUpdate = await Store_Profile.update(
        {
          store_code: storeCode,
          store_name: storeName,
          store_country: storeCountry,
          store_ip: ipPrinter,
          image: storeImage || null,
        },
        {
          where: { store_profile_id: data.store_profile_id },
        }
      );

      if (isUpdate) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Updated the information of store profile`,
        });

        if (act_log) {
          res.status(200).send({ message: "true" });
        }
      }
    } else {
      const isCreate = await Store_Profile.create({
        store_code: storeCode,
        store_name: storeName,
        store_country: storeCountry,
        ipPrinter: ipPrinter,
        image: storeImage || null,
      });

      if (isCreate) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Created new information of store profile`,
        });

        if (act_log) {
          res.status(200).send({ message: "true" });
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchProfile").get(async (req, res) => {
  try {
    const data = await Store_Profile.findOne();

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(202).json({ message: "Profile not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchStatus").get(async (req, res) => {
  try {
    let data = await Store_Status.findByPk(1);

    if (!data) {
      data = await Store_Status.create({
        store_status_id: 1,
        status: 0,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/update_status").put(async (req, res) => {
  try {
    const { storeStatus, userId } = req.body;

    const status = await Store_Status.findByPk(1);

    await status.update({ status: storeStatus });

    await Store_Status_History.create({
      store_status_id: status.store_status_id,
      status: storeStatus,
      masterlist_id: userId,
    });

    const isStoreOpen = storeStatus === 1 || storeStatus === true;
    const actionTaken = isStoreOpen
      ? "Dashboard: User opened the store"
      : "Dashboard: User closed the store";

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: actionTaken,
    });

    res.status(200).send({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/DashboardData").get(async (req, res) => {
  try {
    // Get the store status
    const storeStatus = await Store_Status.findOne({
      where: { store_status_id: 1 },
      attributes: ["updatedAt"],
    });

    if (!storeStatus) {
      return res.status(201).json("Store status not found");
    }

    const updatedAtDate = new Date(storeStatus.updatedAt);
    const formattedDate = updatedAtDate.toISOString().split("T")[0];

    // Get minCreatedAt and maxCreatedAt galing Store_Status_History
    const minMaxCreatedAt = await Store_Status_History.findAll({
      attributes: [
        [
          sequelize.fn(
            "DATE_FORMAT",
            sequelize.fn("MIN", sequelize.col("createdAt")),
            "%Y-%m-%d %H:%i:%s"
          ),
          "minCreatedAt",
        ],
        [
          sequelize.fn(
            "DATE_FORMAT",
            sequelize.fn("MAX", sequelize.col("createdAt")),
            "%Y-%m-%d %H:%i:%s"
          ),
          "maxCreatedAt",
        ],
      ],
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("createdAt")),
        "=",
        formattedDate
      ),
    });

    if (minMaxCreatedAt.length === 0) {
      return res.status(202).json("No status history found for the given date");
    }

    const { minCreatedAt, maxCreatedAt } = minMaxCreatedAt[0].dataValues;

    // Get the status ng maxCreatedAt
    const statusHistory = await Store_Status_History.findOne({
      where: {
        createdAt: maxCreatedAt,
      },
      attributes: ["status"],
    });

    if (!statusHistory) {
      return res.status(204).json("No status found for the given maxCreatedAt");
    }

    const status = statusHistory.status ? 1 : 0;

    // Sum the payable amount
    let sumCondition;
    if (status === 1) {
      sumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
        status: "Ordered",
      };
    } else {
      sumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
        status: "Ordered",
      };
    }

    const sumResult = await Order_Transaction.sum("payable_amount", {
      where: sumCondition,
    });

    // Count ng mga Order Transaction na ang status is 'Ordered'
    const countOrdered = await Order_Transaction.count({
      where: sumCondition,
    });

    // Sum conditions for Product Inventory Accumulate
    let inventorySumCondition;
    if (status === 1) {
      inventorySumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      };
    } else {
      inventorySumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
      };
    }

    // Sum the total price from Product_Inventory_Accumulate
    const inventorySumResult = await Product_Inventory_Accumulate.sum(
      "total_price",
      {
        where: inventorySumCondition,
      }
    );

    //Sum conditions for Raw Inventory Accumulate
    let rawInventorySumCondition;
    if (status === 1) {
      rawInventorySumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      };
    } else {
      rawInventorySumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
      };
    }

    //Sum the total price from Raw Inventory Accumulate
    const rawInventorySumResult = await Raw_Inventory_Accumulate.sum(
      "total_price",
      {
        where: rawInventorySumCondition,
      }
    );

    //Sum condition para sa cart quantity
    let CartQTYSumCondition;
    if (status === 1) {
      CartQTYSumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      };
    } else {
      CartQTYSumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
      };
    }

    //Sum the number of quantity sa cart para mabilang yung item na nasold
    const cartQTYSumResult = await Cart.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantity"],
      ],
      where: CartQTYSumCondition,
      include: [
        {
          model: Order_Transaction,
          required: true,
          attributes: [],
          where: {
            status: "Ordered",
          },
        },
      ],
      raw: true,
    });

    const totalProductSold = cartQTYSumResult
      ? cartQTYSumResult.totalQuantity
      : 0;

    res.json({
      totalPayableAmount: sumResult || 0,
      totalInventoryPrice: inventorySumResult || 0,
      totalRawInventoryPrice: rawInventorySumResult || 0,
      totalOrder: countOrdered || 0,
      totalProductSold: totalProductSold,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
