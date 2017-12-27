const mongoose = require('mongoose');



exports.main = (req, res) => {
    res.render('index', {title: 'Бизнес'});
};
