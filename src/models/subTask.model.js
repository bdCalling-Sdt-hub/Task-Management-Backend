const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
    subTaskName: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        // required: true,
    },
    userEmail: {
        type: String,
        // required: true,
        default: "",
    },
    taskType: {
        type: String,
        enum: ['Daily', 'Weekly']
    },
    managerId: {
        type: String,
    },
    taskSubmissionDate: {
        type: Date
    },
    title: {
        type: String,
        default: "",
        // required: true,
    },
    description: {
        type: String,
        default: "",
        // required: true,
    },
    resiveAdmin: {
        type: Boolean,
        default: false,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const SubTask = mongoose.model('SubTask', subTaskSchema);

module.exports = SubTask;
