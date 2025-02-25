const mongoose = require('mongoose');

const taskVieweAdminSchema = new mongoose.Schema({
    submitedTaskUrl: {
        type: String,
        required: [true, 'Submited Task Url is required']
    },
    userId: {
        type: String,
        // required: true,
    },
    managerId: {
        type: String,
        // required: true,
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
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const TaskVieweAdmin = mongoose.model('TaskVieweAdmin', taskVieweAdminSchema);

module.exports = TaskVieweAdmin;
