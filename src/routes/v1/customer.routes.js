const express = require('express');
const customerController = require('../../controllers/customer.controller');
const auth = require('../../middlewares/auth');
// const auth = require('../../middlewares/auth');

const router = express.Router();

router
    .route('/add-customer')
    .post(auth('admin'), customerController.createCustomer) // Create or update customer (Admin only)

router
    .route('/:id')
    .get(auth('common'), customerController.getCustomerById) // Get customer by ID (Any authenticated user)
    .patch(auth('common'), customerController.updateCustomer) // Update customer (Admin only)
// .delete(auth('admin'), customerController.deleteCustomer); // Delete customer (Admin only)


router.
    route('/')
    .get(auth('admin'), customerController.getAllCustomers)


//============ manager ==========

router
    .route('/manager/all-manager')
    .get(auth('admin'), customerController.getAllMenager)


module.exports = router;
