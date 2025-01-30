const catchAsync = require("../utils/catchAsync");
const { submitService } = require("../services");
const ApiError = require("../utils/ApiError");

const createTaskSubmission = catchAsync(async (req, res, next) => {
    const submission = await submitService.createTaskSubmission(req.body);

    res.status(201).json({
        message: "Task submitted successfully",
        status: "OK",
        statusCode: 201,
        submission,
    });
});

const getTaskSubmissions = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await submitService.getTaskSubmissions(page, limit);

    res.status(200).json({
        message: "Task submissions retrieved successfully",
        status: "OK",
        statusCode: 200,
        submissions: result.submissions,
        pagination: result.pagination,
    });
});

const getTaskSubmissionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;


    const submission = await submitService.getTaskSubmissionById(id);

    res.status(200).json({
        message: "Task submission retrieved successfully",
        status: "OK",
        statusCode: 200,
        submission,
    });
});

module.exports = { createTaskSubmission, getTaskSubmissions, getTaskSubmissionById };
