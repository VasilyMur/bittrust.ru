const nodemailer = require('nodemailer');
const pug = require('pug');
// inlines css
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  //host: 'smtp.mailgun.org',
  //port: process.env.MAIL_PORT,
  auth: {
    // user: process.env.MAIL_USER,
    user: process.env.MAIL_USER,
    // pass: process.env.MAIL_PASS
    pass: process.env.MAIL_PASS
  }
});


const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

exports.send = async (options) => {
 try{
   const html = generateHTML(options.filename, options);
   const text = htmlToText.fromString(html);
   const mailOptions = {
       from: `Команда Bittrust <noreply@bittrust.ru>`,
       to: options.user.email,
       subject: options.subject,
       html: html,
       text: text
   };

   const sendMail = promisify(transport.sendMail, transport);
   return sendMail(mailOptions);
 } catch (e) {
   res.render('error', {message:'Something went wrong'});
 }

};
