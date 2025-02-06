const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const response = require("../config/response");
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require("../services");

const register = catchAsync(async (req, res) => {
  const isUser = await userService.getUserByEmail(req.body.email);

  if (isUser) {
    return res.status(httpStatus.OK).json({
      message: "Email already Exist.",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  }

  if (isUser && isUser.isEmailVerified === false) {
    const user = await userService.isUpdateUser(isUser.id, req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json(
      response({
        message: "Thank you for registering. Please verify your email",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: {},
      })
    );
  } else if (isUser && isUser.isDeleted === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  } else if (isUser && isUser.isDeleted === true) {
    const user = await userService.isUpdateUser(isUser.id, req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).json(
      response({
        message: "Thank you for registering. Please verify your email",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: {},
      })
    );
  } else {
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);

    res.status(httpStatus.CREATED).json(
      response({
        message: "Thank you for registering. Please verify your email",
        status: "OK",
        statusCode: httpStatus.CREATED,
        data: {},
      })
    );
  }
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const isUser = await userService.getUserByEmail(email);
  // here we check if the user is in the database or not
  if (isUser?.isDeleted === true) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This Account is Deleted");
  }
  // if (isUser?.isEmailVerified === false) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Email not verified");
  // }
  if (!isUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  setTimeout(async () => {
    try {
      user.oneTimeCode = null;
      user.isResetPassword = false;
      await user.save();
      console.log("oneTimeCode reset to null after 3 minute");
    } catch (error) {
      ApiError;
      console.error("Error updating oneTimeCode:", error);
    }
  }, 180000); // 3 minute in milliseconds

  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).json(
    response({
      message: "Login Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user, tokens },
    })
  );
});

const logout = catchAsync(async (req, res) => {
  // await authService.logout(req.body.refreshToken);
  // res.status(httpStatus.OK).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  // const tokens = await authService.refreshAuth(req.body.refreshToken);
  // res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.body.email);
  if (!user) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No users found with this email"
    );
  }
  // if(user.oneTimeCode === 'verified'){
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "try 3 minute later"
  //   );
  // }
  // Generate OTC (One-Time Code)
  const oneTimeCode =
    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

  // Store the OTC and its expiration time in the database
  user.oneTimeCode = oneTimeCode;
  user.isResetPassword = true;
  await user.save();

  //console.log("oneTimeCode", user);
  await emailService.sendResetPasswordEmail(req.body.email, oneTimeCode);
  res.status(httpStatus.OK).json(
    response({
      message: "Email Sent",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.password, req.body.email);
  res.status(httpStatus.OK).json(
    response({
      message: "Password Reset Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Password Change Successful",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  // const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  // await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  // res.status(httpStatus.OK).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.body, req.query);

  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).json(
    response({
      message: "Email Verified",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user, tokens },
    })
  );
  // res.status(httpStatus.OK).send();
});

const deleteMe = catchAsync(async (req, res) => {
  const user = await authService.deleteMe(req.body.password, req.user);
  res.status(httpStatus.OK).json(
    response({
      message: "Account Deleted",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { user },
    })
  );
});

const getAllAdmins = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const result = await authService.getAllAdmins(page, limit);
  res.status(httpStatus.OK).json(
    response({
      message: "Admins retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {
        admins: result.admins,
        pagination: {
          totalAdmins: result.totalAdmins,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      },
    })
  );
});

const getAdmin = catchAsync(async (req, res) => {
  const result = await authService.getAdmin(req.params.id);
  res.status(httpStatus.OK).json(
    response({
      message: "Admin Get successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { admin: result },
    })
  );

})

const blockUser = catchAsync(async (req, res) => {
  const result = await authService.blockUser(req.params.id);
  res.status(httpStatus.OK).json(
    response({
      message: "User updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { result },
    })
  );
})


const editUser = catchAsync(async (req, res) => {
  const result = await authService.editUser(req.params.id, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "User updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { result },
    })
  );
})

const getAllBlockAdmins = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const result = await authService.getAllBlockAdmins(page, limit);
  res.status(httpStatus.OK).json(
    response({
      message: "Admins retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {
        admins: result.admins,
        pagination: {
          totalAdmins: result.totalAdmins,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      },
    })
  );
});


module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  deleteMe,
  changePassword,
  getAllAdmins,
  getAdmin,
  blockUser,
  editUser,
  getAllBlockAdmins
};
