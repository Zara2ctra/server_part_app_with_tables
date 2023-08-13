const sequelize = require("../db.js");
const {DataTypes} = require("sequelize");

const User = sequelize.define("user", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    registration_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    last_login_date: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "Active" },
    password: { type: DataTypes.STRING },
});

module.exports = User;