const { Submit } = require("../models");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const createTaskSubmission = async (data) => {
    try {
        const { customerId, managerId, taskId, taskName, title, description } = data;

        // Ensure all required fields are provided
        if (!customerId || !managerId || !taskId || !taskName || !title || !description) {
            throw new ApiError(400, "All fields are required");
        }

        // Remove only the specific taskName from the dailyTask array
        const user = await User.findById(customerId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        await User.findByIdAndUpdate(customerId, {
            $pull: { dailyTask: taskName }  // Remove taskName from dailyTask array
        });

        // Create task submission
        const submission = await Submit.create(data);
        return submission;


    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getTaskSubmissions = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        const submissions = await Submit.find()
            .skip(skip)
            .limit(limit)
            .populate("customerId managerId taskId");

        const totalSubmissions = await Submit.countDocuments();
        return {
            submissions,
            pagination: {
                totalSubmissions,
                totalPages: Math.ceil(totalSubmissions / limit),
                currentPage: page,
            },
        };
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const getTaskSubmissionById = async (id) => {
    try {
        const submission = await Submit.findById(id).populate("customerId managerId taskId");

        if (!submission) {
            throw new ApiError(404, "Task submission not found");
        }

        return submission;
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

module.exports = {
    createTaskSubmission,
    getTaskSubmissions,
    getTaskSubmissionById,
};
