const {  User } = require("../models");
const ApiError = require("../utils/ApiError"); // Custom error handling utility
const httpStatus = require("http-status");

// Create a new admin
const createAdmin = async (adminData) => {
    try {
        // Check if the admin with the given email already exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        if (existingAdmin) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Admin with this email already exists.");
        }

        // Create new admin
        const newAdmin = new Admin(adminData);
        await newAdmin.save();
        return newAdmin;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getAllAdmins = async (page = 1, limit = 10, role = "admin") => {
    try {
        const skip = (page - 1) * limit;

        // Filter admins by role
        const admins = await User.find({ role }).skip(skip).limit(limit);

        // Count only admins
        const totalAdmins = await Admin.countDocuments({ role });

        return {
            admins,
            totalAdmins,
            totalPages: Math.ceil(totalAdmins / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};


const updateAdmin = async (id, adminData) => {
    try {
        const admin = await Admin.findByIdAndUpdate(id, adminData, { new: true });
        if (!admin) {
            throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
        }
        return admin;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const blockAdmin = async (id) => {
    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
        }
        admin.isBlocked = !admin.isBlocked;
        await admin.save();
        return admin;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

// Get a single admin by email
const getAdminByEmail = async (email) => {
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            throw new ApiError(httpStatus.NOT_FOUND, "Admin not found.");
        }
        return admin;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    getAdminByEmail,
    updateAdmin,
    blockAdmin
};
