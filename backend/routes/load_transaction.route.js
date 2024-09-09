const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const multer = require("multer");
const xlsx = require("xlsx");
const {
  Load_Transaction,
  Student_Balance,
  Student,
  Bulk_Load,
  Bulk_Load_Transaction,
  Activity_Log,
} = require("../db/models/associations");

const upload = multer({ dest: "uploads/" });

// Fetch
router.route("/getLoadTransaction").get(async (req, res) => {
  try {
    const data = await Load_Transaction.findAll({
      include: [
        {
          model: Student_Balance,
          include: [
            {
              model: Student,
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

router.get("/getStudentByTopUpCard", async (req, res) => {
  try {
    const { topUpCardNumber } = req.query;

    // Query the database to find the student with the given Top Up Card #
    const studentData = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          where: { rfid: topUpCardNumber },
        },
      ],
    });

    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If student found, send the student data as response
    res.json(studentData);
  } catch (error) {
    console.error("Error fetching student data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/getCustomerList", async (req, res) => {
  try {
    const customerData = await Student_Balance.findAll({
      include: [
        {
          model: Student,
          where: {
            status: "Active",
          },
        },
      ],
    });

    if (customerData) {
      return res.json(customerData);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

router.post("/addTopUp", async (req, res) => {
  try {
    const { student_balance_id, topUpAmount, userId } = req.body;
    const studentBalance = await Student_Balance.findOne({
      where: { student_balance_id },
      include: [
        {
          model: Student,
          required: true,
        },
      ],
    });

    const customerName =
      studentBalance.student.first_name +
      " " +
      studentBalance.student.last_name;

    const updateBalance = studentBalance.balance + parseInt(topUpAmount);
    await studentBalance.update({
      balance: updateBalance,
    });

    const newBalance = studentBalance.balance;
    const oldBalance = studentBalance.balance - topUpAmount;
    await Load_Transaction.create({
      student_balance_id: student_balance_id,
      load_amount: topUpAmount,
      old_balance: oldBalance,
      new_balance: newBalance,
    });

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Top Up Load: Customer ${customerName} load ${topUpAmount} old balance ${oldBalance}, new balance ${newBalance}`,
    });

    res.status(200).send("Top-up saved successfully");
  } catch (error) {
    console.error("Error saving top-up:", error);
    res.status(500).send("An error occurred while saving top-up");
  }
});

router.post("/multiple-load", async (req, res) => {
  try {
    const { studentIDs, topUpAmount, userId } = req.body;

    // Fetch all student balances in a single query
    const studentBalances = await Student_Balance.findAll({
      where: { student_id: studentIDs },
      include: [
        {
          model: Student,
          required: true,
        },
      ],
    });

    const customerNames = studentBalances
      .map(
        (balance) =>
          `${balance.student.first_name} ${balance.student.last_name}`
      )
      .join(", ");

    await Promise.all(
      studentBalances.map(async (studentBalance) => {
        if (studentBalance) {
          const updateBalance = studentBalance.balance + parseInt(topUpAmount);
          const newBalance = studentBalance.balance + parseInt(topUpAmount);
          const oldBalance = studentBalance.balance;

          await studentBalance.update({ balance: updateBalance });

          await Load_Transaction.bulkCreate([
            {
              student_balance_id: studentBalance.student_id,
              load_amount: topUpAmount,
              old_balance: oldBalance,
              new_balance: newBalance,
            },
          ]);
        }
      })
    );

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Bulk Load: Customers ${customerNames} load ${topUpAmount}`,
    });

    // for (const studentID of studentIDs) {
    //   const studentBalance = await Student_Balance.findOne({
    //     where: { student_id: studentID },
    //   });

    //   if (studentBalance) {
    //     const updateBalance = studentBalance.balance + parseInt(topUpAmount);
    //     await studentBalance.update({
    //       balance: updateBalance,
    //     });

    //     const newBalance = studentBalance.balance;
    //     const oldBalance = studentBalance.balance - topUpAmount;
    //     await Load_Transaction.create({
    //       student_balance_id: studentID,
    //       load_amount: topUpAmount,
    //       old_balance: oldBalance,
    //       new_balance: newBalance,
    //     });
    //   }
    // }

    res.status(200).send("Multiple Load");
  } catch (error) {
    console.error("Error saving top-up:", error);
    res.status(500).send("An error occurred while saving top-up");
  }
});
//Search

//activity log sa pagclick ng download template
router.post("/downloadTemplate", async (req, res) => {
  try {
    const { userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Top up load: Download the template for bulk load`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error saving top-up:", error);
    res.status(500).send("An error occurred while saving top-up");
  }
});

router.route("/searchStudent").get(async (req, res) => {
  try {
    const searchValue = req.query.search;
    let whereCondition = {};
    if (searchValue) {
      whereCondition = {
        [Op.or]: [
          { rfid: { [Op.like]: `%${searchValue}%` } },
          { first_name: { [Op.like]: `%${searchValue}%` } },
          { last_name: { [Op.like]: `%${searchValue}%` } },
          { student_number: { [Op.like]: `%${searchValue}%` } },
        ],
      };
    }

    const customerData = await Student_Balance.findAll({
      include: [
        {
          model: Student,
          where: whereCondition,
        },
      ],
    });

    if (customerData) {
      return res.json(customerData);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/searchTransaction").get(async (req, res) => {
  try {
    const searchValue = req.query.search;
    let whereCondition = {};
    if (searchValue) {
      whereCondition = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${searchValue}%` } },
          { last_name: { [Op.like]: `%${searchValue}%` } },
        ],
      };
    }
    const data = await Load_Transaction.findAll({
      include: [
        {
          model: Student_Balance,
          include: [
            {
              model: Student,
              where: whereCondition,
            },
          ],
        },
      ],
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

router.route("/getSearchLoadTransac").get(async (req, res) => {
  try {
    const { search } = req.query;

    const data = await Load_Transaction.findAll({
      include: [
        {
          model: Student_Balance,
          required: true,
          include: [
            {
              model: Student,
              where: {
                [Op.or]: [
                  { first_name: { [Op.like]: `%${search}%` } },
                  { last_name: { [Op.like]: `%${search}%` } },
                  { rfid: { [Op.like]: `%${search}%` } },
                ],
              },
              required: true,
            },
          ],
        },
      ],
    });

    console.log("ssssssssss", data);
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

router.route("/bulk").post(upload.single("file"), async (req, res) => {
  try {
    const { transactionNumber, userId } = req.body;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const expectedHeaders = [
      [
        "STUDENT NUMBER",
        "FIRST NAME",
        "LAST NAME",
        "RFID NUMBER",
        "TOP UP AMOUNT",
        "CATEGORY",
      ],
      [
        "DEPARTMENT NAME",
        "FIRST NAME",
        "LAST NAME",
        "RFID NUMBER",
        "TOP UP AMOUNT",
        "CATEGORY",
      ],
      [
        "STUDENT NUMBER/DEPARTMENT NAME",
        "FIRST NAME",
        "LAST NAME",
        "RFID NUMBER",
        "TOP UP AMOUNT",
        "CATEGORY",
      ],
    ];

    const actualHeader = Object.keys(data[0]);

    const isValidHeader = expectedHeaders.some(
      (expectedHeader) =>
        actualHeader.length === expectedHeader.length &&
        actualHeader.every((value, index) => value === expectedHeader[index])
    );

    const matchingIndex = expectedHeaders.findIndex(
      (expectedHeader) =>
        expectedHeader.length === actualHeader.length &&
        expectedHeader.every(
          (value, index) => value.trim() === actualHeader[index]
        )
    );

    if (!isValidHeader) {
      return res.status(202).send({ message: "Invalid format." });
    }

    const bulkTransac = await Bulk_Load.create({
      transaction_number_id: transactionNumber,
      masterlist_id: userId,
    });

    const rfidNumbers = data.map((row) => row["RFID NUMBER"]);

    // Find customers based on RFID numbers
    const findCustomers = await Student.findAll({
      where: { rfid: rfidNumbers },
    });

    // Map customers by RFID number
    const customerMap = {};
    findCustomers.forEach((cust) => {
      customerMap[cust.rfid] = `${cust.first_name} ${cust.last_name}`;
    });

    const customerLogs = [];

    for (row of data) {
      const studentNum =
        matchingIndex == 0
          ? row["STUDENT NUMBER"]
          : matchingIndex == 1
          ? row["DEPARTMENT NAME"]
          : row["STUDENT NUMBER/DEPARTMENT NAME"];
      const rfidNum = row["RFID NUMBER"];
      const topUp = row["TOP UP AMOUNT"] || 0;

      const topUpAmount =
        topUp === undefined || topUp === "" ? 0 : parseFloat(topUp);

      console.log("dddddddddddddd", topUpAmount);
      console.log("ddddddddddddds", topUp);

      const existingRecord = await Student.findOne({
        where: { student_number: studentNum, rfid: rfidNum },
      });

      if (existingRecord && topUpAmount > 0) {
        const student = await Student_Balance.findOne({
          where: {
            student_id: existingRecord.student_id,
          },
        });

        if (student) {
          await student.update({
            balance: student.balance + topUpAmount,
          });

          const loadTransac = await Load_Transaction.create({
            student_balance_id: student.student_balance_id,
            load_amount: topUpAmount,
            old_balance: student.balance - topUpAmount,
            new_balance: student.balance,
          });

          if (loadTransac) {
            await Bulk_Load_Transaction.create({
              bulk_load_id: bulkTransac.bulk_load_id,
              load_transaction_id: loadTransac.load_transaction_id,
            });
          }
          customerLogs.push(`${customerMap[rfidNum]} amount of ${topUpAmount}`);
        } else {
          console.log("Invalid");
        }
      } else {
        console.log("Top Up is not valid");
      }
    }

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Bulk Load: Import excel file in bulk load for ${customerLogs.join(
        ", "
      )}`,
    });
    res.status(200).send({ message: "Bulk data" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error processing bulk data");
  }
});

router.route("/template").get(async (req, res) => {
  try {
    const { category } = req.query;

    if (category != "all") {
      const data = await Student.findAll({
        where: {
          category: category,
          status: "Active",
        },
      });

      if (data) {
        res.status(200).send(data);
      } else {
        res.status(201).json("No data found");
      }
    } else {
      const data = await Student.findAll({
        where: {
          status: "Active",
        },
      });

      if (data) {
        res.status(200).send(data);
      } else {
        res.status(400).json("No data found");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
