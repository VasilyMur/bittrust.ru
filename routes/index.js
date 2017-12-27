const express = require('express');
const companyController = require('../controllers/companyController');
const router = express.Router();


router.get('/', companyController.main);














module.exports = router;
