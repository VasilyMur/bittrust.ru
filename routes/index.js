const express = require('express');
const companyController = require('../controllers/companyController');
const router = express.Router();


router.get('/', companyController.getCompanies);


router.get('/add', companyController.addCompany);

// Заполнили данные в разделе ADD и добавили Компанию
router.post('/add', companyController.createCompany);

// Зашли в раздел Edit существующей компании
router.get('/companies/:id/edit', companyController.editCompany);

// Сделали Submit обновленных данных по Компании из раздела Edit
router.post('/add/:id', companyController.updateCompany);















module.exports = router;
