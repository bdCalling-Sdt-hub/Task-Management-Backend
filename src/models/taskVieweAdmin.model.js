const mongoose = require('mongoose');

const taskVieweAdminSchema = new mongoose.Schema({
    allTaskId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
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
