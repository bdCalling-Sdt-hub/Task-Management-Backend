const httpStatus = require('http-status');
const { customerService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const response = require("../config/response");

// Create or update a customer
const createCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.createOrUpdateCustomer(req.body);
    res.status(httpStatus.CREATED).json(response({
        message: "Customer Created successfully",
        status: "OK",
        statusCode: httpStatus.CREATED,
        // data: customer
    }));
});

// Get all customers
const getCustomers = catchAsync(async (req, res) => {
    const customers = await customerService.getAllCustomers();
    res.status(httpStatus.OK).json(response({
        message: "Customers retrieved successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: customers
    }));
});

// Get a single customer by ID
const getCustomerById = catchAsync(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    res.status(httpStatus.OK).json(response({
        message: "Customer retrieved successfully", 
        status: "OK",
        statusCode: httpStatus.OK,
        data: {
            user: customer
        }
    }));
});

// Update customer details
const updateCustomer = catchAsync(async (req, res) => {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.status(httpStatus.OK).json(response({
        message: "Customer Updated successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: {
            users: customer
        }
    }));
});

// Delete a customer
const deleteCustomer = catchAsync(async (req, res) => {
    await customerService.deleteCustomer(req.params.id);
    res.status(httpStatus.OK).json(response({
        message: "Customer deleted successfully",
        status: "OK",
        statusCode: httpStatus.OK
    }));
});

// Assign a manager to a customer
const assignManager = catchAsync(async (req, res) => {
    const { managerId } = req.body;
    const customer = await customerService.assignManager(req.params.id, managerId);
    res.status(httpStatus.OK).json(response({
        message: "Manager assigned successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: customer
    }));
});

// Get all customers with pagination
const getAllCustomers = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await customerService.getAllCustomers(page, limit, role = 'customer'); // Change 'manager' to 'customer'

    res.status(httpStatus.OK).json(response({
        message: "Customers retrieved successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: {
            users: result.customers, // Changed "user" to "users" for clarity
            pagination: {
                totalCustomers: result.totalCustomers,
                totalPages: result.totalPages,
                currentPage: result.currentPage
            }
        },
    }));
});

// Get all managers with pagination
const getAllMenager = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await customerService.getAllCustomers(page, limit, role = 'manager'); // Change 'manager' role here

    res.status(httpStatus.OK).json(response({
        message: "Managers retrieved successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: {
            users: result.customers, // Changed "user" to "users" for clarity
            pagination: {
                totalCustomers: result.totalCustomers,
                totalPages: result.totalPages,
                currentPage: result.currentPage
            }
        },
    }));
});

module.exports = {
    createCustomer,
    getCustomers,
    getCustomerById,
    getAllCustomers,
    getAllMenager,
    updateCustomer,
    deleteCustomer,
    assignManager
};
