const express = require('express');
const router = express.Router();

const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../src/Views/index.html'));
});

// Add more routes as needed for privacy policy
// Example route for getting specific privacy policy details

module.exports = router;