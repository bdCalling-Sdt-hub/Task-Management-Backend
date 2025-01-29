const httpStatus = require('http-status');
const Customer = require('../models/customer.model');
const ApiError = require('../utils/ApiError');

// Create or Update a Customer
const createOrUpdateCustomer = async (customerData) => {
    try {

        let customer = await Customer.findOne({ email: customerData.email });
        if (customer) {
            // Update existing customer
            throw new ApiError(httpStatus.BAD_REQUEST, 'Customer Email Already exists');
            Object.assign(customer, customerData);
            await customer.save();
        } else {
            // Create new customer
            customer = await Customer.create(customerData);
        }
        return customer;

    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

// Get all customers with pagination
const getAllCustomers = async (page = 1, limit = 10, role) => {
    const skip = (page - 1) * limit;

    // Filter customers based on role and paginate
    const customers = await Customer.find({ role }).skip(skip).limit(limit);
    const totalCustomers = await Customer.countDocuments({ role });

    return {
        customers,
        totalCustomers,
        totalPages: Math.ceil(totalCustomers / limit),
        currentPage: page
    };
}



// Get a single customer by ID
const getCustomerById = async (customerId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    return customer;
};

// Update a customer's details
const updateCustomer = async (customerId, updateData) => {
    const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!updatedCustomer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    return updatedCustomer;
};

// Delete a customer
const deleteCustomer = async (customerId) => {
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);
    if (!deletedCustomer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    return deletedCustomer;
};

// Assign Customer to a Manager
const assignManager = async (customerId, managerId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
    customer.assignedManager = managerId;
    await customer.save();
    return customer;
};

module.exports = {
    createOrUpdateCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    assignManager
};
