const express = require("express");
const config = require("../../config/config");
const authRoute = require("./auth.routes");
const userRoute = require("./user.routes");
const memberRoute = require("./member.routes");
const taskRoute = require("./task.routes");
const analyticsRoute = require("./analytics.routes"); 
const privacyPolicyRoute = require("./privacyPolicy.routes");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/members",
    route: memberRoute,
  },
  {
    path: "/tasks",
    route: taskRoute,
  },
  {
    path: "/analytics",
    route: analyticsRoute,
  },
  {
    path: "/privacy-policy",
    route: privacyPolicyRoute,
  }

];

// const devRoutes = [
//   // routes available only in development mode
//   {
//     path: "/docs",
//     route: docsRoute,
//   },
// ];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
// if (config.env === "development") {
//   devRoutes.forEach((route) => {
//     router.use(route.path, route.route);
//   });
// }

module.exports = router;
