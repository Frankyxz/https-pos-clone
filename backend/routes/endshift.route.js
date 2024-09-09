const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  MasterList,
  Order_Transaction,
  Cart,
  UserLogin,
  Void_Transaction,
  CashierReport,
} = require("../db/models/associations");
const session = require("express-session");
const moment = require("moment-timezone");
router.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// router.route("/getCode").get(async (req, res) => {
//   try {
//     const currentDate = moment().tz("Asia/Manila").toDate();
//     const year = currentDate.getFullYear();
//     const month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     const currentMonth = `${year}-${month}`;

//     const lastPayCode = await UserLogin.findOne({
//       where: {
//         reference: {
//           [Op.like]: `${currentMonth}%`,
//         },
//       },
//       order: [["createdAt", "DESC"]],
//     });
//     let newRefCode;
//     if (lastPayCode && lastPayCode.reference) {
//       const latestRefCode = lastPayCode.reference;
//       const refCodeParts = latestRefCode.split("-");
//       if (refCodeParts.length === 4 && !isNaN(refCodeParts[3])) {
//         const latestSequence = parseInt(refCodeParts[3], 10);
//         const newSequence = String(latestSequence + 1).padStart(5, "0");
//         newRefCode = `${currentMonth}-${newSequence}`;
//       } else {
//         newRefCode = `${currentMonth}-00001`;
//       }
//     } else {
//       // console.log("No matching records found, initializing new sequence.");
//       newRefCode = `${currentMonth}-00001`;
//     }

//     res.json(newRefCode);
//   } catch (error) {
//     console.error("Error fetching last transaction_id:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.route("/getShift").get(async (req, res) => {
  try {
    const { userId } = req.query;

    const shiftRecords = await UserLogin.findOne({
      where: {
        masterlist_id: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (shiftRecords) {
      return res.status(200).json(shiftRecords);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/checkShift").post(async (req, res) => {
  try {
    const { userId } = req.query;

    const existingShift = await UserLogin.findOne({
      where: {
        masterlist_id: userId,
      },
      order: [["createdAt", "DESC"]],
    });

    if (existingShift) {
      if (existingShift.status === "Start") {
        return res.status(201).json();
      } else {
        return res.status(200).json();
      }
    } else {
      return res.status(200).json();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/insertStartShift").post(async (req, res) => {
  try {
    const { userId } = req.query;

    const currentDate = moment().tz("Asia/Manila").toDate();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const currentMonthDay = `${year}-${month}`;

    // Find the last order with the current date prefix
    const lastPayCode = await UserLogin.findOne({
      where: {
        reference: {
          [Op.like]: `${currentMonthDay}%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let newRefCode;
    if (lastPayCode && lastPayCode.reference) {
      const latestRefCode = lastPayCode.reference;
      const sequenceNumber = latestRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}-${newSequence}`;
    } else {
      newRefCode = `${currentMonthDay}-0001`;
    }

    // Check if the newly may existing order
    let checkOrderNumber = await UserLogin.findOne({
      where: {
        reference: newRefCode,
      },
    });

    // If it exists, increment again until a maging unique
    while (checkOrderNumber) {
      const sequenceNumber = newRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}${newSequence}`;

      checkOrderNumber = await UserLogin.findOne({
        where: {
          reference: newRefCode,
        },
      });
    }

    const InsertStart = await UserLogin.create({
      reference: newRefCode,
      masterlist_id: userId,
      status: "Start",
    });

    if (InsertStart) {
      return res.status(200).json();
    } else {
      return res.status(202).json();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/endShiftData").post(async (req, res) => {
  try {
    const { userId, reference } = req.query;

    const existingShift = await UserLogin.findOne({
      where: {
        masterlist_id: userId,
        reference: reference,
      },
    });

    const GetEmployee = await MasterList.findOne({
      where: {
        col_id: userId,
      },
    });

    const EmployeeName = GetEmployee.col_name;

    //get muna yung min and max createdAt para magamit sa where clause
    if (existingShift) {
      const minCreatedAt = await UserLogin.min("createdAt", {
        where: {
          masterlist_id: userId,
          reference: reference,
        },
      });

      let maxCreatedAt;
      if (existingShift.length > 1) {
        maxCreatedAt = await UserLogin.max("createdAt", {
          where: {
            masterlist_id: userId,
            reference: reference,
          },
        });
      } else {
        maxCreatedAt = new Date();
      }
      //get muna yung min and max createdAt para magamit sa where clause

      // Count rows ng Order Transaction
      const orderCount = await Order_Transaction.count({
        where: {
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: {
            [Op.between]: [minCreatedAt, maxCreatedAt],
          },
        },
      });

      // Sum lahat ng payable amount sa Order_Transaction para sa checkout
      const payableAmountSum = await Order_Transaction.sum("payable_amount", {
        where: {
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: {
            [Op.between]: [minCreatedAt, maxCreatedAt],
          },
        },
      });

      // Count rows ng Orde Transaction na "Void"
      const voidCount = await Order_Transaction.count({
        where: {
          masterlist_id: userId,
          status: "Void",
          date_checkout: {
            [Op.between]: [minCreatedAt, maxCreatedAt],
          },
        },
        include: [
          {
            model: Void_Transaction,
            required: true,
            where: {
              reason: {
                [Op.in]: ["Refund-OutofStock", "Refund-Others"],
              },
            },
          },
        ],
      });

      //Sum payable amount ng CASH
      const CashSum = await Order_Transaction.sum("payable_amount", {
        where: {
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: {
            [Op.between]: [minCreatedAt, maxCreatedAt],
          },
          payment_method: "CASH",
        },
      });

      //Sum payable amount ng CARD
      const CardSum = await Order_Transaction.sum("payable_amount", {
        where: {
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: {
            [Op.between]: [minCreatedAt, maxCreatedAt],
          },
          payment_method: "CARD",
        },
      });

      // Get order transaction IDs for the given criteria
      const orderTransactionIds = await Order_Transaction.findAll({
        where: {
          masterlist_id: userId,
          status: "Ordered",
          date_checkout: {
            [Op.between]: [minCreatedAt, maxCreatedAt],
          },
        },
        attributes: ["order_transaction_id"],
      });

      const orderTransactionIdsArray = orderTransactionIds.map(
        (order) => order.order_transaction_id
      );

      // Sum quantity in Cart
      const quantitySum = await Cart.sum("quantity", {
        where: {
          order_transaction_id: {
            [Op.in]: orderTransactionIdsArray,
          },
        },
      });

      // Calculate duration in milliseconds
      const durationInMilliseconds =
        new Date(maxCreatedAt) - new Date(minCreatedAt);

      // Convert duration to hours and minutes
      const durationInHours = Math.floor(
        durationInMilliseconds / (1000 * 60 * 60)
      );
      const durationInMinutes = Math.floor(
        (durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
      );

      // Create formatted duration string
      const formattedDuration = [
        durationInHours > 0
          ? `${durationInHours} hour${durationInHours > 1 ? "s" : ""}`
          : "",
        durationInMinutes > 0
          ? `${durationInMinutes} minute${durationInMinutes > 1 ? "s" : ""}`
          : "",
      ]
        .filter(Boolean)
        .join(" and ");

      // Format dates
      const formatDate = (date) => {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
      };

      res.status(200).json({
        minCreatedAt: formatDate(minCreatedAt),
        maxCreatedAt: formatDate(maxCreatedAt),
        orderCount: orderCount || 0,
        payableAmountSum: payableAmountSum || 0,
        voidCount: voidCount || 0,
        quantitySum: quantitySum || 0,
        duration: formattedDuration || "",
        cashTotal: CashSum || 0,
        cardTotal: CardSum || 0,
        employeeName: EmployeeName || "",
      });
    } else {
      res.status(204).json("No shift found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/insertEndShift").post(async (req, res) => {
  try {
    const {
      userId,
      userReference,
      startshiftDate,
      endshiftDate,
      totalCheckout,
      totalIncome,
      totalItemSold,
      totalRefund,
      totalCash,
      totalCard,
      employeeName,
      shiftDuration,
      amount,
      totalCashierSales,
    } = req.query;

    await UserLogin.create({
      masterlist_id: userId,
      status: "End",
      reference: userReference,
    });

    await CashierReport.create({
      start_shift: startshiftDate,
      end_shift: endshiftDate,
      total_checkout: totalCheckout,
      total_income: totalIncome,
      total_item_sold: totalItemSold,
      total_refund: totalRefund,
      total_cash: totalCash,
      total_card: totalCard,
      employee_name: employeeName,
      shift_duration: shiftDuration,
      cash_drawer: amount,
      loss: totalCashierSales,
    });

    res.status(200).json({ message: "Shift end successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});
module.exports = router;
