const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    memberName: {
        type: String,
        required: [true, 'Please add a name']
    },
    profileImage: {
        type: String,
        default: 'uploads/members/user.png'
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    isVisible: {
        type: Boolean,
        default: true
    }, // For profile visibility]
    isViewed: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        unique: [true, 'Email already exists'],
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    role: {
        type: String,
        enum: ['customer', 'manager'],
        default: 'customer'
    }, // Role field
    assignedManager: {
        type: mongoose.Schema.Types.ObjectId, // ✅ Changed to ObjectId
        ref: 'Member', // Assuming you have a Manager model
    },
    myTasks: {
        type: [], // Store task IDs
        ref: 'Task',
        default: []
    },
    myDailyTasks: { // ✅ Added myDailyTasks
        type: [],
        ref: 'SubTask',
        default: []
    },
    myWeeklyTasks: { // ✅ Added myWeeklyTasks
        type: [],
        ref: 'SubTask',
        default: []
    },
    mainTaskId: {
        type: String,
        default: "",
    },
    dailyMainTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: "",
    },
    weeklyMainTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: "",
    },
    dailyTitle: {
        type: String,
        default: ""
    },
    dailyDescription: {
        type: String,
        default: ""
    },
    weeklyTitle: {
        type: String,
        default: ""
    },
    weeklyDescription: {
        type: String,
        default: ""
    },
    userActivity: {
        type: Boolean,
        // required: [true, 'Please add a user activity'],
        default: true
    } // Additional activity tracking
    ,
    totalAssignedCustomer: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Member = mongoose.model('Member', memberSchema);



memberSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const member = await this.findOne({ email, _id: { $ne: excludeUserId } });
    return !!member;
};

module.exports = Member;
