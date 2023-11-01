// app.js
const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const app = express();
require("dotenv").config();



const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: "Gmail",
  
    auth: {
      user: process.env.EMAIL_ACCOUNT,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

// Express settings and middleware

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public')); // For Bootstrap or CSS files

// Routes and controllers go here
// Define routes to handle CRUD operations
app.get('/', (req, res) => {
    db.query('SELECT * FROM orderscj', (err, results) => {
      if (err) throw err;
      res.render('dashboard', { orders: results });
    });
  });
  
  app.post('/updateStatus/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    db.query('UPDATE orderscj SET OrderStatus = ? WHERE OrderID = ?', [status, id], (err, result) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
  
  app.post('/updateTracking/:id', (req, res) => {
    const { id } = req.params;
    const { tracking } = req.body;
  
    db.query('UPDATE orderscj SET OrderTrackingNumber = ? WHERE OrderID = ?', [tracking, id], (err, result) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
  
  app.post('/sendEmail/:id', (req, res) => {
    const { id } = req.params;
    console.log(id)
  
    db.query('SELECT * FROM orderscj WHERE OrderID = ?', [id], (err, results) => {
      if (err) throw err;
  
      const order = results[0];
  
      const mailOptions = {
        from: `${process.env.EMAIL_ACCOUNT}`,
        to: order.OrderEmail,
        subject: 'Order Update',
        html: `
        
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;600&display=swap");
              .button {
                background-color: #000;
                color: #ffffff;
                padding: 12px 24px;
                text-decoration: none;
                font-family: 'Montserrat', sans-serif;
                cursor: pointer;
              }
              p {
                font-size: 16px;
                font-family: 'Montserrat', sans-serif;
                color: #000000;
              }
              html {
                max-width: 700px;
                font-family: 'Montserrat', sans-serif;
              }
            </style>
          </head>
          <body>
            <p style="font-size: 24px; font-weight: bold">
              Arriving between 24/10/23 and 26/10/23
            </p>
        
            <p style=" font-weight: bold">Hi ${order.FirstName},</p>
        
            <p style="font-size: 14px">Your order status is: ${order.OrderStatus}</p>
            <p style="font-size: 12px">The tracking number is: ${order.OrderTrackingNumber}</p>
            <a href="http://localhost:3000/track" class="button">Track your parcel</a>
        
            <p style="color: grey; font-size: 12px;font-weight: 200">
              Tracking not available? Sometimes it can take up to 24 hours, so check
              again in a little while.
            </p>
        
            <div style="float: left; width: 50%">
              <p style="font-weight: bold">Delivery address</p>
              <p>${order.FirstName} ${order.LastName}</p>
              <p>${order.OrderCity}, ${order.OrderAddress}, ${order.OrderZIP}</p>
            </div>
        
            <div style="float: right; width: 50%">
              <p style="font-weight: bold">Estimated delivery</p>
              <p>between 24/10/23 and 26/10/23</p>
            </div>
          </body>
        </html>`,
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
        console.log('Email sent: ' + info.response);
        res.redirect('/');
      });
    });
  });
  

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
