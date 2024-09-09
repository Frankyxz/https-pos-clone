const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Load_Transaction,
  Student_Balance,
  Student,
  Order_Transaction,
  Cart,
  Checkout_Transaction,
  Product_Inventory,
  Product,
  Category,
  Category_Product,
  Receiving_Stock_Inventory,
  Product_Inventory_Accumulate,
  Inventory_Receiving_Transaction,
  Outbound_Stock_Inventory,
  Inventory_Outbound_Transaction,
  Product_Inventory_Outbound,
  Stock_Counting_Inventory,
  Inventory_Stock_Counting_Transaction,
  Product_Inventory_Counting,
  Bulk_Load_Transaction,
  Bulk_Load,
  Bulk_Load_Student,
  Activity_Log,
  RawInventory,
  RawMaterial,
  Store_Status_History,
  MasterList,
  Raw_Inventory_Receiving_Transaction,
  Raw_Inventory_Accumulate,
  Raw_Inventory_Outbound_Transaction,
  Raw_Inventory_Outbound,
  Raw_Inventory_Counting_Transaction,
  Raw_Inventory_Counting,
  Cart_Specification_Variant,
  Specification_Variant,
} = require("../db/models/associations");

//RFID REPORTS MODULE
router.route("/fetchRFIDtransactions").get(async (req, res) => {
  try {
    const data = await Load_Transaction.findAll({
      include: [
        {
          model: Student_Balance,
          required: true,
          include: [
            {
              model: Student,
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//POS REPORTS MODULE
router.route("/fetchPOStransactions").get(async (req, res) => {
  try {
    const data = await Cart.findAll({
      include: [
        {
          model: Order_Transaction,
          required: true,
        },
        {
          model: Product_Inventory,
          required: true,
          include: [
            {
              model: Product,
              required: true,
            },
          ],
        },
        {
          model: Cart_Specification_Variant,
          required: false,
          include: [
            {
              model: Specification_Variant,
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Customer Reports
router.route("/fetchStudentReports").get(async (req, res) => {
  try {
    const data = await Order_Transaction.findAll({
      include: [
        {
          model: Student,
          required: true,
        },
        {
          model: Cart,
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/searchStudent").get(async (req, res) => {
  try {
    const { search } = req.query;
    const data = await Order_Transaction.findAll({
      include: [
        {
          model: Student,
          where: {
            [Op.or]: [
              { first_name: { [Op.like]: `%${search}%` } },
              { last_name: { [Op.like]: `%${search}%` } },
              { category: { [Op.like]: `%${search}%` } },
              { rfid: { [Op.like]: `%${search}%` } },
            ],
          },
          required: true,
        },
        {
          model: Cart,
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//route sa pag-export
router.route("/fetchDataForExport").get(async (req, res) => {
  try {
    const data = await Cart.findAll({
      include: [
        {
          model: Order_Transaction,
          required: true,
          include: [
            {
              model: Student,
              required: true,
              include: [
                {
                  model: Student_Balance,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: Product_Inventory,
          required: true,
          include: [
            {
              model: Product,
              required: true,
            },
          ],
        },
        {
          model: Cart_Specification_Variant,
          required: false,
          include: [
            {
              model: Specification_Variant,
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Specific Customer Reports
router.route("/fetchSpecificStudentReport/:id").get(async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Order_Transaction.findAll({
      include: [
        {
          model: Cart,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
              ],
            },
            {
              model: Cart_Specification_Variant,
              required: false,
              include: [
                {
                  model: Specification_Variant,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: Student,
          required: true,
        },
      ],
      where: {
        order_transaction_id: id,
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Received Reports
router.route("/getReceiveData").get(async (req, res) => {
  try {
    const data = await Inventory_Receiving_Transaction.findAll({
      include: [
        {
          model: Receiving_Stock_Inventory,
          required: true,
        },
        {
          model: Product_Inventory_Accumulate,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
                // {
                //   model: Category_Product,
                //   required: true,
                //   include: [
                //     {
                //       model: Product,
                //       required: true,
                //     },
                //     {
                //       model: Category,
                //       required: true,
                //     },
                //   ],
                // },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Raw Mats Received
router.route("/getReceiveRawData").get(async (req, res) => {
  try {
    const data = await Raw_Inventory_Receiving_Transaction.findAll({
      include: [
        {
          model: Receiving_Stock_Inventory,
          required: true,
        },
        {
          model: Raw_Inventory_Accumulate,
          required: true,
          include: [
            {
              model: RawInventory,
              required: true,
              include: [
                {
                  model: RawMaterial,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getOutboundRawData").get(async (req, res) => {
  try {
    const data = await Raw_Inventory_Outbound_Transaction.findAll({
      include: [
        {
          model: Outbound_Stock_Inventory,
          required: true,
        },
        {
          model: Raw_Inventory_Outbound,
          required: true,
          include: [
            {
              model: RawInventory,
              required: true,
              include: [
                {
                  model: RawMaterial,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getCountRawData").get(async (req, res) => {
  try {
    const data = await Raw_Inventory_Counting_Transaction.findAll({
      include: [
        {
          model: Stock_Counting_Inventory,
          required: true,
        },
        {
          model: Raw_Inventory_Counting,
          required: true,
          include: [
            {
              model: RawInventory,
              required: true,
              include: [
                {
                  model: RawMaterial,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Outbound Reports
router.route("/getOutboundData").get(async (req, res) => {
  try {
    const data = await Inventory_Outbound_Transaction.findAll({
      include: [
        {
          model: Outbound_Stock_Inventory,
          required: true,
        },
        {
          model: Product_Inventory_Outbound,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Outbound Reports
router.route("/getCountingData").get(async (req, res) => {
  try {
    const data = await Inventory_Stock_Counting_Transaction.findAll({
      include: [
        {
          model: Stock_Counting_Inventory,
          required: true,
        },
        {
          model: Product_Inventory_Counting,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
                // {
                //   model: Category_Product,
                //   required: true,
                //   include: [
                //     {
                //       model: Product,
                //       required: true,
                //     },
                //     {
                //       model: Category,
                //       required: true,
                //     },
                //   ],
                // },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getBulkHistory").get(async (req, res) => {
  try {
    const data = await Bulk_Load.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: MasterList,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getBulkTransaction").get(async (req, res) => {
  try {
    const { bulkID } = req.query;

    const data = await Bulk_Load_Transaction.findAll({
      include: [
        {
          model: Bulk_Load,
          required: true,
        },
        {
          model: Load_Transaction,
          required: true,
          include: [
            {
              model: Student_Balance,
              required: true,
              include: [
                {
                  model: Student,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      where: {
        bulk_load_id: bulkID,
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/raw-mats-report").get(async (req, res) => {
  try {
    const data = await RawInventory.findAll({
      include: [
        {
          model: RawMaterial,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/operate-report").get(async (req, res) => {
  try {
    const data = await Store_Status_History.findAll({
      include: [
        {
          model: MasterList,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//route if si user clinick yung export button sa Inventory Reports
router.route("/exportReports").post(async (req, res) => {
  try {
    const { selectedPage, format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for ${selectedPage} reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//for pos reports logs
router.route("/posReportsLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for POS reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//for RFID report logs
router.route("/rfidReportsLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for RFID reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//for Raw Materials report logs
router.route("/rawMatsReportLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for Raw Materials reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//customer report excel logs
router.route("/customerExcelReportsLog").post(async (req, res) => {
  try {
    const { userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export excel file for Customer reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//customer report pdf logs
router.route("/customerPDFReportsLog").post(async (req, res) => {
  try {
    const { userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export pdf file for Customer reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

// Fetch Bulk Data for Export
router.route("/fetchBulkData").get(async (req, res) => {
  try {
    const data = await Bulk_Load_Transaction.findAll({
      include: [
        {
          model: Bulk_Load,
          required: true,
          include: [
            {
              model: MasterList,
              required: true,
            },
          ],
        },
        {
          model: Load_Transaction,
          required: true,
          include: [
            {
              model: Student_Balance,
              required: true,
              include: [
                {
                  model: Student,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    console.log("sssssssssssssssssssss", data);
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/bulkLog").post(async (req, res) => {
  try {
    const { userId, type } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${type} file for Bulk Load reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

module.exports = router;
