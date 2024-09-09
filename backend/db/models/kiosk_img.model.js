const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Kiosk_Img = sequelize.define("kiosk_img", {
  kiosk_img_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  kiosk_img: {
    type: DataTypes.BLOB("long"),
    allowNull: true,
    get() {
      const value = this.getDataValue("kiosk_img");
      return value ? value.toString("base64") : null;
    },
    set(value) {
      this.setDataValue("kiosk_img", Buffer.from(value, "base64"));
    },
  },
  img_screen_loc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Kiosk_Img;
