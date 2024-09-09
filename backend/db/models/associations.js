const UserRole = require("./userRole.model");
const MasterList = require("./masterlist.model");

const Student = require("./student.model");

const Student_Balance = require("./student_balance.model");

const UserLogin = require("./userlogin.model.js");

UserRole.hasMany(MasterList, { foreignKey: "col_roleID" });
MasterList.belongsTo(UserRole, { foreignKey: "col_roleID" });

Student.hasMany(Student_Balance, { foreignKey: "student_id" });
Student_Balance.belongsTo(Student, { foreignKey: "student_id" });

MasterList.hasMany(UserLogin, { foreignKey: "masterlist_id" });
UserLogin.belongsTo(MasterList, { foreignKey: "masterlist_id" });

module.exports = {
  MasterList,
  UserRole,
  Student_Balance,
  Student,

  UserLogin,
};
