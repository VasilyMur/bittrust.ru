const express = require('express');
const companyController = require('../controllers/companyController');
const router = express.Router();

// Главная Страница - Все Компании
router.get('/', companyController.getCompanies);

// Зашли в Раздел Добавить Компанию
router.get('/add', companyController.addCompany);

// Заполнили данные в разделе ADD и добавили Компанию
router.post('/add',
          companyController.upload,
          companyController.resize,
          companyController.createCompany
          );

// Зашли в раздел Edit существующей компании
router.get('/companies/:id/edit', companyController.editCompany);

// Сделали Submit обновленных данных по Компании из раздела Edit
router.post('/add/:id',
          companyController.upload,
          companyController.resize,
          companyController.updateCompany
          );

// Страница Компании
router.get('/companies/:slug', companyController.getCompanyBySlug);


// Страница Категории
router.get('/tags', companyController.getCompaniesByTag);
router.get('/tags/:tag', companyController.getCompaniesByTag);


// Страница Добавить: Submit a Company
router.get('/submit', companyController.submitForm);
router.post('/submit',
                companyController.upload,
                companyController.submitCompany);







module.exports = router;
