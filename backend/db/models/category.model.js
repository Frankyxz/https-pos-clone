const sequelize = require('../config/sequelize.config');
const { DataTypes } = require('sequelize');

const Category = sequelize.define('category', {
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category_image: {
    type: DataTypes.BLOB("long"),
    allowNull: true,
    get() {
      const value = this.getDataValue("category_image");
      return value ? value.toString("base64") : null;
    },
    set(value) {
      this.setDataValue("category_image", Buffer.from(value, "base64"));
    },
  }
  
});

module.exports = Category;