const mongoose = require('mongoose');
const Company = mongoose.model('Company');


exports.addCompany = (req, res) => {
  res.render('editCompany', {title: 'Добавить Компанию'});
};

exports.createCompany = async (req, res) => {
  try {
    const company = await (new Company(req.body)).save();
    req.flash('success', `Компания ${company.name} сохранена! <a href="/companies/${company.slug}">Посмотреть компанию</a>`);
    res.redirect(`/companies/${company.slug}`);
  } catch(err) {
      if (err.name == 'ValidationError') {
        const errorKeys = Object.keys(err.errors);
        errorKeys.forEach(key => req.flash('error', err.errors[key].message));
        res.redirect('back');
      } else {
        res.render('error', {message:'Something went wrong'});
      }
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.render('companies', {title: 'Все Компании', companies});
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

exports.editCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id });
    res.render('editCompany', { title: `Редактировать данные ${company.name}`, company });
  } catch(e) {
    res.render('error', {message:'Something went wrong'});
  }
};

exports.updateCompany = async (req, res) => {
  try {
    //Set the location data to be a point (dissapears after school update)
    req.body.location.type = 'Point';
    
    const company = await Company.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true }).exec();
    req.flash('success', `Информация о компании <strong>${company.name}</strong> обнавлена! <a href="/companies/${company.slug}">Посмотреть компанию</a>`);
    res.redirect(`/companies/${company._id}/edit`);
  } catch(err) {
      if (err.name == 'ValidationError') {
        const errorKeys = Object.keys(err.errors);
        errorKeys.forEach(key => req.flash('error', err.errors[key].message));
        res.redirect('back');
      } else {
        res.render('error', {message:'Something went wrong'});
      }
  }
};
