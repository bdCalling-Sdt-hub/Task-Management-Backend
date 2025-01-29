const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { tasksService, paymentService } = require("../services");
const { Service, User, Payment, Tasks } = require("../models");
const crypto = require("crypto");
const axios = require("axios");

const generateSignature = (data, passPhrase) => {
  let pfOutput = dataToString(data);
  if (passPhrase !== null) {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(
      /%20/g,
      "+"
    )}`;
  }
  return crypto.createHash("md5").update(pfOutput).digest("hex");
};

const dataToString = (data) => {
  let pfParamString = "";
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      pfParamString += `${key}=${encodeURIComponent(data[key].trim()).replace(
        /%20/g,
        "+"
      )}&`;
    }
  }
  return pfParamString.slice(0, -1);
};

const getPaymentId = async (paymentData) => {
  const result = await axios.post(
    "https://www.payfast.co.za/onsite/process",
    paymentData
  );
  return result.data;
};

const processPayment = catchAsync(async (req, res) => {
  const { merchantId, merchantKey, emailAddress, amount, itemName } = req.body;
  const phrase = "youknow1Ksdfksdj";
  console.log(req.body);

  const paymentData = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    email_address: emailAddress,
    amount: amount,
    item_name: itemName,
  };

  const signature = generateSignature(paymentData, phrase);
  paymentData.signature = signature;

  try {
    const paymentId = await getPaymentId(paymentData);
    // console.log(paymentId);
    res.json({ paymentId });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

const getPayments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role", "gender"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const payments = await paymentService.getPayments(filter, options);
  res.send(payments);
});

const getPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.paymentId);
  res.send(payment);
});

const allStatus = async (req, res) => {
  const totalUser = await User.countDocuments({ role: { $ne: "admin" } });
  const totalClient = await User.countDocuments({ role: "client" });
  const totalEmployee = await User.countDocuments({ role: "employee" });
  const totalIncome = await Payment.aggregate([
    {
      $group: {
        _id: 0,
        totalIncome: { $sum: "$price" },
      },
    },
  ]);

  const totalTasks = await Tasks.countDocuments({ status: "pending" });

  res.send(
    response({
      message: "All Status",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {
        totalUser,
        totalClient,
        totalEmployee,
        totalIncome,
        totalTasks,
      },
    })
  );
};

const paymentChart = catchAsync(async (req, res) => {
    let { year } = req.query;
  
    if (!year) {
      const currentDate = new Date();
      year = currentDate.getFullYear().toString();
    }
  
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59.999`);
  
    const data = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
    ]);
  
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(year, i, 1).toLocaleString("en-us", {
        month: "short",
      });
      const total = data.reduce((acc, payment) => {
        const paymentMonth = payment.createdAt.getMonth();
        if (paymentMonth === i) {
          return acc + payment.price;
        }
        return acc;
      }, 0);
      return { name: month, total };
    });
  
    res.status(200).json({ data: monthlyData });
  });
module.exports = {
  processPayment,
  getPayments,
  getPayment,
  allStatus,
  paymentChart
};
