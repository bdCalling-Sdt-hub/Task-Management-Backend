const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const logger = require("../config/logger");
const { userService } = require("./user.service");
const { Payment } = require("../models");
const createPayment  = async (bodyData) => {
  const payment = await Payment.create(bodyData);
  return payment;
};

const getPayments = async (filter, options) => {
  options.populate="tasksId,userId fullName image";
  const payments = await Payment.paginate(filter, options);
  return payments;
};
const getPaymentById = async (id) => {
  const payment = await Payment.findById(id).populate("tasksId userId");
  return payment;
};


module.exports = {
    createPayment ,
    getPayments,
    getPaymentById
};
