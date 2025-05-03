const passport = require("passport");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { roleRights } = require("../config/roles");
const jwt = require("jsonwebtoken");
const { Activity } = require("../models");

const verifyCallback =
  (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
      console.log(err, info, user);
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized")
      );
    }
    req.user = user;

    const { authorization } = req.headers;

    let token;
    let decodedData;
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
      decodedData = jwt.decode(token);
      if (!decodedData) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, "Invalid token"));
      }
    }

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) || [];  // Ensure userRights is always an array
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights) =>
    async (req, res, next) => {
      if (!Array.isArray(requiredRights) || !requiredRights.length) {
        return next(new ApiError(httpStatus.BAD_REQUEST, "Invalid rights"));
      }

      return new Promise((resolve, reject) => {
        passport.authenticate(
          "jwt",
          { session: false },
          verifyCallback(req, resolve, reject, requiredRights)
        )(req, res, next);
      })
        .then(() => next())
        .catch((err) => next(err));
    };

module.exports = auth;
