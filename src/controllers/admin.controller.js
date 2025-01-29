const httpStatus = require("http-status");
const adminService = require("../services/admin.service");
const catchAsync = require("../utils/catchAsync");
const response = require("../config/response");

// Create a new admin
const createAdmin = catchAsync(async (req, res) => {
    const { name, email, password, role, message } = req.body;

    const adminData = {
        name,
        email,
        password,
        role,
        message,
    };

    const newAdmin = await adminService.createAdmin(adminData);
    res.status(httpStatus.CREATED).json(
        response({
            message: "Admin created successfully",
            status: "OK",
            statusCode: httpStatus.CREATED,
            data: {
                users: newAdmin
            },
        })
    );
});


const getAllAdmins = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await adminService.getAllAdmins(page, limit, "admin");

    res.status(httpStatus.OK).json(
        response({
            message: "Admins retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: {
                admins: result.admins,
                pagination: {
                    totalAdmins: result.totalAdmins,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                },
            },
        })
    );
});

// Get all admins with pagination
const updateAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const admin = await adminService.updateAdmin(id, req.body);
    res.status(httpStatus.OK).json(
        response({
            message: "Admin updated successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: {
                admin,
            },
        })
    );
})


const blockAdmin = catchAsync(async (req, res) => {
    const { id } = req.params;
    const admin = await adminService.blockAdmin(id);
    res.status(httpStatus.OK).json(
        response({
            message: "Admin updated successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: {
                admin,
            },
        })
    );
})

// Get admin by email
const getAdminByEmail = catchAsync(async (req, res) => {
    const { email } = req.params;

    const admin = await adminService.getAdminByEmail(email);

    res.status(httpStatus.OK).json(
        response({
            message: "Admin retrieved successfully",
            status: "OK",
            statusCode: httpStatus.OK,
            data: {
                admin
            },
        })
    );
});

module.exports = {
    createAdmin,
    getAllAdmins,
    getAdminByEmail,
    updateAdmin,
    blockAdmin
};
