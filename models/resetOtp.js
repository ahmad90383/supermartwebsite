const mongoose = require("mongoose");
// const conn = require("../config/db");
// let bcrypt = require("bcrypt");
// let jwt = require("jsonwebtoken");

const resetSchema = new mongoose.Schema(
  {
    email: String,
    code: String,
    expireIn: Number,
  },
  {
    timestamps: true,
  }
);

const ResetOtp = mongoose.model("resetSchema", resetSchema);
module.exports = ResetOtp;
