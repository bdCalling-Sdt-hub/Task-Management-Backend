const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Admin name is required"],
        },
        profileImage: {
            type: String,
        },
        email: {
            type: String,
            required: [true, "Admin email is required"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Admin password is required"],
        },
        role: {
            type: String,
            required: [true, "Admin role is required"],
            enum: ['admin'], // You can add other roles if necessary
        },
        message: {
            type: String,
            required: [true, "Message is required for the new admin"],
        },
        isProfileVisible: {
            type: Boolean,
            default: true, // 'true' for 'Visible', 'false' for 'Hidden'
        },
        isBlocked: {
            type: Boolean,
            default: false, // 'true' for 'Blocked', 'false' for 'Unblocked'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
