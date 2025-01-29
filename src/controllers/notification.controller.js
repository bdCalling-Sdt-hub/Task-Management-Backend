const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { notificationService } = require("../services");

const getALLNotification = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const notifications = await notificationService.getALLNotification(filter, options,req.user.id);
  res.status(httpStatus.OK).json(response({ message:"Notifications", status: "OK", statusCode:httpStatus.OK , data: notifications}));
});

const getALLNotificationAdmin = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const notifications = await notificationService.getALLAdminNotification(filter, options);
  res.status(httpStatus.OK).json(response({ message:"Notifications", status: "OK", statusCode:httpStatus.OK , data: notifications}));
});


const deleteNotificationById = catchAsync (async(req,res) =>{
  const result = await notificationService.deleteNotificationById(req.params.id);
  res.status(httpStatus.OK).json(response({ message:"notification Delete successfully", status: "OK", statusCode:httpStatus.OK }));
})

const readNotification = catchAsync(async (req, res) => {
  const result = await notificationService.readNotification(req.params.id);
  res.status(httpStatus.OK).json(response({ message:"notification Read successfully", status: "OK", statusCode:httpStatus.OK }));
})

const readNotificationAdmin = catchAsync(async (req, res) => {
  const result = await notificationService.readNotificationAdmin();
  res.status(httpStatus.OK).json(response({ message:"notification Read successfully", status: "OK", statusCode:httpStatus.OK }));
})

module.exports = {
  getALLNotification,
  getALLNotificationAdmin,
  deleteNotificationById,
  readNotification,
  readNotificationAdmin
};
