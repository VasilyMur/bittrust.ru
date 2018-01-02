const express = require('express');
const companyController = require('../controllers/companyController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

// Главная Страница - Все Компании
router.get('/', companyController.getCompanies);

// Зашли в Раздел Добавить Компанию
//router.get('/add', authController.isLoggedIn, companyController.addCompany);
router.get('/add', authController.isAdmin, companyController.addCompany);

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



// Login and Registration
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/register', userController.registerForm);

// 1 - Validate Registration Data
// 2 - Register the User - using .register method on User model - passportLocalMongoose plugin
// 3 - Log the User In! - using Paspport library
router.post('/register',
                userController.validateRegister,
                userController.register,
                authController.login
              );


router.get('/logout', authController.logout);

// Нажали на аватар после логина - личный кабинет
router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', userController.updateAccount);

//Нажали Восстановить пароль
router.post('/account/forgot', authController.forgot);
// Получили ссылку для восстановления
router.get('/account/reset/:token', authController.reset);
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  authController.update
);


/*
  API
*/

router.get('/api/search', companyController.searchCompanies);



module.exports = router;
