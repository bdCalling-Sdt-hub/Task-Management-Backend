const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
    {
        taskType: {
            type: String,
            // required: true,
            enum: ["daily", "weekly"], // Can be extended if needed
        },
        taskClassName: {
            type: String,
            // required: true,
        },
        taskName: {
            type: String,
            // required: true,
        },
        tasks: {
            type: [String],
        },
        assignTaskManager: {
            type: Array,
            default: [],
        },
        assignCustomer: {
            type: Array,
            default: [],
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
