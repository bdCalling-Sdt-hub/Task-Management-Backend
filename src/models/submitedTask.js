const mongoose = require("mongoose");

const submitedTaskSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    managerId: {
        type: String,
    },
    taskId: {
        type: String
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    submitedDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    taskType: {
        type: String,
        enum: ["Daily", "Weekly"],
        required: true,
    },
    resiveAdmin: {
        type: Boolean,
        default: false
    }

})

module.exports = mongoose.model("SubmitedTask", submitedTaskSchema);