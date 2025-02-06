const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskType: {
        type: String,
        enum: ['Daily', 'Weekly'],
        required: true,
    },
    userID: {
        type: String,
        // required: true,
    },

    taskClassName: {
        type: String,
        required: true,
    },
    taskName: {
        type: String,
        required: true,
    },
    taskDescription: {
        type: String,
        required: true,
    },
    totalAssignedCustomer: {
        type: Number,
        default: 0
    },
    subTasks: [{
        type: String,
        required: false,
    }],
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
