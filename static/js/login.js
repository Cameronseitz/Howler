import api from './APIClient.js';

let form = document.querySelector("form");
form.addEventListener("submit", e => {
  e.preventDefault();
  api.login(form, "/users/authenticated");
});