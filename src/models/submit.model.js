
const mongoose = require("mongoose");

const taskSubmissionSchema = new mongoose.Schema(
    {
        customerId: {
            type: String,
            ref: "User",
            required: true,
        },
        managerId: {
            type: String,
            ref: "User",
            required: true,
        },
        taskId: {
            type: String,
            ref: "Task",
            required: true,
        },
        taskName: {
            type: Array,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema);

