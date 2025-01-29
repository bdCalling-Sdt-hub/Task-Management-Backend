const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");
const { userService } = require("../services");
const unlinkImages = require("../common/unlinkImage");
const { User } = require("../models");

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "User Created",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: user,
    })
  );
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "role", "gender"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All Users",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getUser = catchAsync(async (req, res) => {
  let user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  res.status(httpStatus.OK).json(
    response({
      message: "User",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const updateUser = catchAsync(async (req, res) => {
  if (req.body.interest) {
    const parsedInterest = JSON.parse(req.body.interest);
    req.body.interest = parsedInterest;
  }
  const image = {};
  if (req.file) {
    image.url = "/uploads/users/" + req.file.filename;
    image.path = req.file.path;
  }
  if (req.file) {
    req.body.image = image;
  }

  const user = await userService.updateUserById(req.params.userId, req.body);

  res.status(httpStatus.OK).json(
    response({
      message: "User Updated",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.OK).json(
    response({
      message: "User Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const verifyNid = catchAsync(async (req, res) => {
  const user = await userService.verifyNid(req.user.id, req.body.nidNumber);
  res.status(httpStatus.OK).json(
    response({
      message: "User Verified",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const nidVerifyApproval = catchAsync(async (req, res) => {
  const user = await userService.nidVerifyApproval(req.query.id);
  res.status(httpStatus.OK).json(
    response({
      message: "User NID Verify Approved",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const nidVerifyReject = catchAsync(async (req, res) => {
  const user = await userService.nidVerifyReject(req.query.id);
  res.status(httpStatus.OK).json(
    response({
      message: "User NID Verify Rejected",
      status: "OK",
      statusCode: httpStatus.OK,
    })
  );
});

const nidVerifySubmitList = catchAsync(async (req, res) => {
  const user = await userService.nidVerifySubmitList();
  res.status(httpStatus.OK).json(
    response({
      message: "User NID Verify List",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const interestList = catchAsync(async (req, res) => {
  const user = await userService.interestList();
  res.status(httpStatus.OK).json(
    response({
      message: "User Interest List",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

const userRatioCount = catchAsync(async (req, res) => {
  const thisMonthClint = await User.countDocuments({
    createdAt: { $gte: new Date().setMonth(new Date().getMonth() - 1) },
    role: "client",
  });
  const thisMonthEmployee = await User.countDocuments({
    createdAt: { $gte: new Date().setMonth(new Date().getMonth() - 1) },
    role: "employee",
  });

  const ratio = [
    { name: "Client", value: thisMonthClint },
    { name: "Employee", value: thisMonthEmployee },
  ];

  res.status(httpStatus.OK).json(
    response({
      message: "User Ratio List",
      status: "OK",
      statusCode: httpStatus.OK,
      data: ratio,
    })
  );
});
const userInterestUpdate = catchAsync(async (req, res) => {
  const user = await userService.userInterestUpdate(req.user.id,req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "User Interest Update",
      status: "OK",
      statusCode: httpStatus.OK,
      data: user,
    })
  );
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  verifyNid,
  nidVerifyApproval,
  nidVerifyReject,
  nidVerifySubmitList,
  interestList,
  userRatioCount,
  userInterestUpdate
};
