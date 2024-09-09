const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Student,
  Student_Balance,
  Activity_Log,
} = require("../db/models/associations");
const multer = require("multer");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");

const upload = multer({ dest: "uploads/" });

// Fetch Student
router.route("/getStudents").get(async (req, res) => {
  try {
    const data = await Student.findAll({
      include: [
        {
          model: Student_Balance,
          required: true,
        },
      ],
    });

    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//Create Student
router.route("/create").post(async (req, res) => {
  try {
    const existinStudent = await Student.findOne({
      where: {
        rfid: req.body.rfid,
      },
    });

    const existingEmail = await Student.findOne({
      where: {
        email: req.body.email,
      },
    });

    const existID = await Student.findOne({
      where: {
        student_number: req.body.studentNumber,
        category: "Student",
      },
    });

    const formattedValidity = new Date(req.body.validity);

    if (existinStudent) {
      res.status(201).send("Exist");
    } else if (existID) {
      res.status(202).send("Exist");
    } else if (existingEmail) {
      res.status(203).send("Exist");
    } else {
      const newData = await Student.create({
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        contact_number: req.body.contactNumber,
        address: req.body.address,
        rfid: req.body.rfid,
        status: "Active",
        validity: formattedValidity,
        category: req.body.category,
        student_number: req.body.studentNumber,
        student_pin: req.body.pin,
      });

      const studentId = newData.student_id;

      await Student_Balance.create({
        student_id: studentId,
        balance: "0",
      });

      const customerName = req.body.firstName + " " + req.body.lastName;
      await Activity_Log.create({
        masterlist_id: req.body.userId,
        action_taken: `Customer: Create a new customer named ${customerName}`,
      });

      res.status(200).json(newData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

//Update Student
router.route("/update/:param_id").put(async (req, res) => {
  try {
    const email = req.body.email;
    const studentId = req.params.param_id;

    console.log("BODYYYY", req.body);

    const existingData = await Student.findOne({
      where: {
        email: email,
        student_id: { [Op.ne]: studentId },
      },
    });

    const existID = await Student.findOne({
      where: {
        student_number: req.body.studentNumber,
        category: "Student",
        student_id: { [Op.ne]: studentId },
      },
    });

    if (existingData) {
      res.status(202).send("Exist");
    } else if (existID) {
      res.status(203).send("Exist");
    } else {
      const getData = await Student.findOne({
        where: {
          student_id: studentId,
        },
      });

      const affectedRows = await Student.update(
        {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          email: req.body.email,
          contact_number: req.body.contactNumber,
          address: req.body.address,
          status: req.body.status,
          validity: req.body.validity,
          student_number: req.body.studentNumber,
          category: req.body.category,
          student_pin: req.body.student_pin,
        },
        {
          where: { student_id: studentId },
        }
      );

      if (affectedRows) {
        const act_log = await Activity_Log.create({
          masterlist_id: req.body.userId,
          action_taken: `Customer: Updated information to: \n      
'${getData.first_name}' to '${req.body.firstName}',
'${getData.last_name}' to '${req.body.lastName}',
'${getData.email}' to '${req.body.email}',
'${getData.contact_number}' to '${req.body.contactNumber}',
'${getData.address}' to '${req.body.address}',
'${getData.status}' to '${req.body.status}',
'${getData.validity}' to '${req.body.validity}',
'${getData.student_number}' to '${req.body.studentNumber}',
'${getData.category}' to '${req.body.category}',
'${getData.student_pin}' to '${req.body.student_pin}',`,
        });

        if (act_log) {
          res
            .status(200)
            .json({ message: "Data updated successfully", affectedRows });
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

router.route("/searchStudentInfo").get(async (req, res) => {
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
          { category: { [Op.like]: `%${searchValue}%` } },
        ],
      };
    }
    const data = await Student.findAll({ where: whereCondition });
    if (data) {
      const formattedData = data.map((student) => ({
        ...student.toJSON(),
        validity: student.validity.toISOString().split("T")[0],
      }));
      return res.json(formattedData);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchStudentDropdown").get(async (req, res) => {
  try {
    const data = await Student.findAll();
    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/checkBalance").get(async (req, res) => {
  try {
    const { rfidNum, subtotal } = req.query;

    const studentData = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          required: true,
          where: { rfid: rfidNum },
        },
      ],
    });

    if (!studentData) {
      return res.status(204).json({ message: "No student Found" });
      // console.log("wwwwwwwwwwwwwwwwwwww not foudn");
    }

    const studentBalance = studentData.balance;
    const Idstudent = studentData.student_id;

    if (studentBalance < subtotal) {
      console.log(`Balance not enough ${rfidNum}`);
      res.status(201).json({ message: "Insufficient balance" });
    } else {
      console.log(`Balance is enough: ${rfidNum}`);
      res.status(200).json(studentData);
    }
  } catch (err) {
    console.error("Error fetching student data:", err);
    return res.status(500).json({ message: "Error" });
  }
});

router.route("/checkpin").post(async (req, res) => {
  try {
    const { IdStudent, studentPin } = req.body;
    const checkPIN = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          required: true,
        },
      ],
      where: {
        student_id: IdStudent,
      },
    });

    const studentPINdata = checkPIN.student.student_pin;

    if (studentPin !== studentPINdata) {
      res.status(201).json({ message: "Wrong PIN" });
    } else if (studentPin === studentPINdata) {
      const balance = checkPIN.balance;
      res.status(200).json({ message: "Correct PIN with balance", balance });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

router.route("/checkpinKiosk").post(async (req, res) => {
  try {
    const { rfidNum, pin } = req.body;
    const checkPIN = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          required: true,
          where: { rfid: rfidNum },
        },
      ],
    });

    const studentPINdata = checkPIN.student.student_pin;

    if (pin !== studentPINdata) {
      res.status(201).json({ message: "Wrong PIN" });
    } else if (pin === studentPINdata) {
      const balance = checkPIN.balance;
      res.status(200).json({ message: "Correct PIN with balance", balance });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

router.route("/checkBalanceKiosk").get(async (req, res) => {
  try {
    const { rfidNum, subtotal } = req.query;

    const studentData = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          where: { rfid: rfidNum },
        },
      ],
    });

    const studentBalance = studentData.balance;

    if (studentBalance < subtotal) {
      res.status(201).json({ message: "Insufficient balance" });
    } else if (studentBalance >= subtotal) {
      res.status(200).json(studentData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

router.route("/checkStudBalance").get(async (req, res) => {
  try {
    const { rfidNum } = req.query;

    const studentData = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          where: { rfid: rfidNum },
        },
      ],
    });

    if (!studentData) {
      return res.status(204).json({ message: "No student Found" });
    }

    const studentBalance = studentData.balance;

    if (studentBalance <= 0) {
      res.status(201).json({ message: "Insufficient balance" });
    } else if (studentBalance > 0) {
      res.status(200).json(studentData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

// router.route("/filterStudent/:filter").get(async (req, res) => {
//   try {
//     const { filter } = req.params;

//     const data = await Student.findAll({
//       include: [
//         {
//           model: Student_Balance,
//           required: true,
//         },
//       ],
//       where: {
//         status: filter
//       }
//     });

//     console.log(data);

//     if (data.length > 0) {
//       return res.json(data);
//     } else {
//       return res.status(400);
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500);
//   }
// });

router.route("/statusupdate").put(async (req, res) => {
  try {
    const { studentIds, status } = req.body;

    const updateData = { status: status };

    for (const studIds of studentIds) {
      const studentData = await Student.findOne({
        where: { student_id: studIds },
      });

      const updateStatus = await Student.update(updateData, {
        where: { student_id: studIds },
      });
    }

    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.route("/bulk-user").post(upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // const data = xlsx.utils.sheet_to_json(sheet);

    // Exlude the first row for sample data
    const data = xlsx.utils.sheet_to_json(sheet).slice(1);

    console.log("DDDDD", data);

    const expectedHeader = [
      "CATEGORY",
      "STUDENT #",
      "RFID #",
      "VALIDITY",
      "FIRST NAME",
      "LAST NAME",
      "CONTACT",
      "EMAIL ADDRESS",
      "HOME ADDRESS",
      "STUDENT PIN",
    ];

    const actualHeader = Object.keys(data[0]);

    // if (
    //   actualHeader.length !== expectedHeader.length ||
    //   !actualHeader.every((value, index) => value === expectedHeader[index])
    // ) {
    //   return res.status(201).send({ message: "Invalid format." });
    // }

    // To continue even the RFID is blank
    const cleanedExpectedHeader = expectedHeader.filter(
      (header) => header !== "RFID #"
    );
    const cleanedActualHeader = actualHeader.filter(
      (header) => header !== "RFID #"
    );

    function excelDateToJSDate(excelDate) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(excelEpoch.getTime() + excelDate * 86400000);
    }

    if (
      cleanedActualHeader.length !== cleanedExpectedHeader.length ||
      !cleanedActualHeader.every(
        (value, index) => value === cleanedExpectedHeader[index]
      )
    ) {
      return res.status(201).send({ message: "Invalid format." });
    }

    for (row of data) {
      const category = row["CATEGORY"];
      const studentNum = row["STUDENT #"];
      const rfidNum = row["RFID #"];
      const validity = row["VALIDITY"];
      const firstName = row["FIRST NAME"];
      const lastName = row["LAST NAME"];
      const contact = row["CONTACT"];
      const email = row["EMAIL ADDRESS"];
      const address = row["HOME ADDRESS"];
      const studentPin = row["STUDENT PIN"];

      const existinStudent = await Student.findOne({
        where: {
          student_number: studentNum,
          // rfid: rfidNum,
        },
      });

      if (!existinStudent) {
        const newStudent = await Student.create({
          first_name: firstName,
          last_name: lastName,
          email: email,
          contact_number: contact,
          address: address,
          rfid: rfidNum || null,
          status: "Active",
          validity: excelDateToJSDate(validity),
          category: category,
          student_number: studentNum,
          student_pin: studentPin,
        });

        if (newStudent) {
          const studID = newStudent.student_id;

          await Student_Balance.create({
            student_id: studID,
            balance: "0",
          });
        }
      }
    }

    res.status(200).send({ message: "Bulk data" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error processing bulk data");
  }
});

router.route("/generate-template").post(async (req, res) => {
  try {
    const headers = [
      "CATEGORY",
      "STUDENT #",
      "RFID #",
      "VALIDITY",
      "FIRST NAME",
      "LAST NAME",
      "CONTACT",
      "EMAIL ADDRESS",
      "HOME ADDRESS",
      "STUDENT PIN",
    ];

    const sampleData = [
      "Sample Category",
      "1234567890",
      "987654321",
      "2024/06/08",
      "John",
      "Doe",
      "09123456789",
      "studentemail@example.com",
      "123 Ohio Street",
      "7890",
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    worksheet.addRow(headers);

    const sampleDataRow = worksheet.addRow(sampleData);

    // Apply style to the sample data row
    sampleDataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" }, // Yellow color
      };
    });

    worksheet.getRow(1).eachCell({ includeEmpty: true }, (cell) => {
      cell.protection = { locked: true };
    });
    sampleDataRow.eachCell({ includeEmpty: true }, (cell) => {
      cell.protection = { locked: true };
    });

    // Write to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=template_user.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// router.route("/generate-template").post(async (req, res) => {
//   try {
//     const headers = [
//       "CATEGORY",
//       "STUDENT #",
//       "RFID #",
//       "VALIDITY",
//       "FIRST NAME",
//       "LAST NAME",
//       "CONTACT",
//       "EMAIL ADDRESS",
//       "HOME ADDRESS",
//       "STUDENT PIN",
//     ];

//     const sampleData = [
//       "Sample Category",
//       "1234567890",
//       "987654321",
//       "2024/06/08",
//       "John",
//       "Doe",
//       "09123456789",
//       "studentemail@example.com",
//       "123 Ohio Street",
//       "7890",
//     ];

//     // Create a new workbook and a worksheet
//     const workbook = xlsx.utils.book_new();
//     const wsData = [headers, sampleData];
//     const worksheet = xlsx.utils.aoa_to_sheet(wsData);

//     // Define the style for the cells
//     const highlightStyle = {
//       fill: {
//         fgColor: { rgb: "FFFF00" }, // Yellow fill color
//       },
//     };

//     for (let col = 0; col < sampleData.length; col++) {
//       const cellAddress = xlsx.utils.encode_cell({ r: 1, c: col });
//       if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
//       worksheet[cellAddress].s = highlightStyle;
//     }

//     xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

//     const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

//     res.setHeader(
//       "Content-Disposition",
//       "attachment; filename=template_user.xlsx"
//     );
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.send(buffer);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json("Error");
//   }
// });

router.route("/searchCustomer/:search").get(async (req, res) => {
  try {
    const { search } = req.params;

    const data = await Student.findAll({
      where: {
        [Op.or]: [
          {
            first_name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            last_name: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            student_number: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            rfid: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      include: [
        {
          model: Student_Balance,
          required: true,
        },
      ],
    });

    console.log("Data", data);

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

module.exports = router;
