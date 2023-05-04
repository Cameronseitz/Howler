const express = require('express');
const frontendRouter = express.Router();


const html_dir = './templates/';

frontendRouter.get('/login', (req, res) => {
  res.sendFile('login.html', {root: html_dir});
});

frontendRouter.get('/', (req, res) => {
  res.sendFile('home.html', {root: html_dir});
});

frontendRouter.get('/user', (req, res) => {
  res.sendFile('user.html', {root: html_dir});
});


module.exports = frontendRouter;