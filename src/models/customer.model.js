const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true,
        },
        isProfileVisible: {
            type: Boolean,
            default: true, // 'true' for 'Visible', 'false' for 'Hide'
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        assignedManager: {
            type: [String],
            default: [],
        },
        assignedCustomers: {
            type: [String], // Array of customer names or IDs assigned to this customer
            default: [],
        },
        dailyTasks: {
            type: [String], // Array of daily task names
            default: [],
        },
        weeklyTasks: {
            type: [String], // Array of weekly task names
            default: [],
        },
        activity: {
            type: String,
        },
    },
    { timestamps: true }
);

//  Virtual Fields to Automatically Calculate Task Totals
CustomerSchema.virtual("dailyTaskTotal").get(function () {
    return this.dailyTasks.length;
});

CustomerSchema.virtual("weeklyTaskTotal").get(function () {
    return this.weeklyTasks.length;
});

// Virtual field to calculate the total number of assigned customers
CustomerSchema.virtual("totalAssignedCustomers").get(function () {
    return this.assignedCustomers.length;
});

// Ensure virtual fields are included in JSON response
CustomerSchema.set("toJSON", { virtuals: true });
CustomerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Customer", CustomerSchema);