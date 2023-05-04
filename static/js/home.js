import api from './APIClient.js';

const URL_BASE = "/hw5";

//https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+ minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  return strTime;
}

//populate username and avatar at top right
let headerUserInfoSection = document.querySelector("#headerUserInfoSection");
let headerUsername = document.querySelector("#headerUsername");
let headerAvatar = document.querySelector("#headerAvatar");
api.getCurrentUser().then(user => {
  headerUsername.innerHTML = "@" + user.username;
  headerAvatar.src = user.avatar;
  //add link to user page
  headerUserInfoSection.href = URL_BASE + "/user?username=" + user.username;
  //fill feed
  fillFeed();
})
//no user signed in, so redirect to sign in page
.catch (error => {
  window.location.href = URL_BASE + "/login";
});


//create howl
let form = document.querySelector("form");
let textArea = document.querySelector("textarea");
form.addEventListener("submit", e => {
  e.preventDefault();
  api.sendHowl(form, "/howls");
  textArea.value = "";
  fillFeed();
});

//fill feed with howls
function fillFeed() {
  let howlsSection = document.querySelector("#howls");
  //clear howls if they exist
  howlsSection.innerHTML = "";
  //get the howls of the user and the people they follow
  api.getFeed().then(howls => {
    howls.forEach(howl => {
      howlsSection.appendChild(createHowlHTML(howl));
    });
  });
}


//create html for each howl
function createHowlHTML(howl) {
  const howlDiv = document.createElement('a');
  howlDiv.classList.add("card", "text-decoration-none", "mt-2");

  let userId = howl.userId;
  //get the user who howled that
  api.getUser(userId).then(user => {
    howlDiv.href = URL_BASE + "/user?username=" + user.username;

    const body = document.createElement('div');
    body.classList.add("card-body", "pt-0");
    howlDiv.appendChild(body);
  
    const header = document.createElement('div');
    header.classList.add("card-title", "d-flex", "justify-content-between", "align-items-baseline");
    body.appendChild(header);

    const nameSection = document.createElement('div');
    header.appendChild(nameSection);
  
    const avatar = document.createElement('img');
    avatar.src = user.avatar;
    nameSection.appendChild(avatar);

    const name = document.createElement('h5');
    name.classList.add("text-dark");
    name.innerHTML = user.first_name + " " + user.last_name;
    nameSection.appendChild(name);

    const date = document.createElement('h6');
    date.classList.add("text-dark");
    let sameDate = new Date(howl.datetime);
    // https://stackoverflow.com/questions/12246394/how-to-get-month-from-string-in-javascript
    let month = sameDate.toLocaleString("default", {month: "short"});
    let day = sameDate.getDate();

    date.innerHTML = month + " " + day + ", " + formatAMPM(sameDate);
    header.appendChild(date);
  
    const username = document.createElement('h6');
    username.classList.add("card-subtitle", "mb-1", "text-muted");
    username.innerHTML = "@" + user.username;
    body.appendChild(username);

    const message = document.createElement('p');
    message.classList.add("card-text", "text-dark");
    message.innerHTML = howl.text;
    body.appendChild(message);
  });

  return howlDiv;
}

