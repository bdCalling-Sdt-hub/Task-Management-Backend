const { analyticsService } = require("../services");
const catchAsync = require("../utils/catchAsync");

const getTasksAnalyticsWeeklyAndMonthly = catchAsync(async (req, res) => {

    const email = req.user.email;
    const week = req.query.week ? parseInt(req.query.week) : 1; // Default to Week 1

    if (!email) {
        return res.status(400).json({
            message: "Email is required",
            status: "ERROR",
            statusCode: 400,
        });
    }

    const { analytics,
        totalMyTasks,
        dueTasks,
        thisMonthName,

    } = await analyticsService.getTasksAnalyticsWeeklyAndMonthly(email, week);

    res.status(200).json({
        status: "OK",
        statusCode: 200,
        message: "Tasks analytics retrieved successfully",
        data: { analytics, totalMyTasks, dueTasks, thisMonthName },
    });
});

module.exports = { getTasksAnalyticsWeeklyAndMonthly };
