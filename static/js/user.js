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
  headerUserInfoSection.href = URL_BASE + "/user?username=" + user.username;
})
//no user signed in, so redirect to sign in page
.catch (error => {
    window.location.href = URL_BASE + "/login";
});

// Get user from URL
const query = window.location.search;
let parameters = new URLSearchParams(query);
let username = parameters.get('username');

//create user info at top of page
let userInfoSection = document.querySelector("#userInfo");
let followsSection = document.querySelector("#collapseBody");
api.getUserWithUsername(username).then(user => {
    userInfoSection.appendChild(createUserInfoHTML(user));

    //follows 
    api.getUserFollowing(user.id).then (list => {
        //if their not following anyone
        if (list.length == 0) {
            let followsBtn = document.querySelector("#followsBtn");
            followsBtn.innerHTML = "Following no one";
            followsBtn.disabled = true;
        }
        list.forEach(followingId => {
            followsSection.appendChild(createFollowsHTML(followingId));
        });
    });
    
});

//get howls of user
let howlsSection = document.querySelector("#howlsSection");
api.getUserWithUsername(username).then(user => {
    api.getUserHowls(user.id).then(howls => {
        howls.forEach(howl => {
            howlsSection.appendChild(createHowlHTML(howl, user));
        });
    });
});

//folow or unfollow button
function followFunction(e) {

    if (e.target.innerHTML == "Unfollow") {
        api.getUserWithUsername(username).then(user => {
            api.unfollowUser(user);
        });
        e.target.innerHTML = "Follow";
    }
    else {
        api.getUserWithUsername(username).then(user => {
            api.followUser(user);
        });
        e.target.innerHTML = "Unfollow";
    }
    
}

function signOutFunction(e) {
    api.signOut();
}

// <div class="card text-decoration-none" href="#">
//     <div class="card-body">
//         <div class = "card-title d-flex justify-content-between">
//              <h5 class = "text-dark">Gra Duate</h5>
//              <h6 class = "text-dark">Oct 1</h6>
//         </div>
//         <h6 class="card-subtitle mb-2 text-muted">@something</h6>
//         <p class="card-text text-dark">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
//     </div>
// </div>
// https://getbootstrap.com/docs/4.0/components/card/
function createHowlHTML(howl, user) {
    const howlDiv = document.createElement('div');
    howlDiv.classList.add("card", "text-decoration-none", "mt-2");

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

    return howlDiv;
}

function createUserInfoHTML(user) {
    const userDiv = document.createElement('div');
    userDiv.classList.add("card", "text-decoration-none", "text-white", "bg-primary", "mt-2");

    const body = document.createElement('div');
    body.classList.add("card-body", "pt-0");
    userDiv.appendChild(body);
  
    const header = document.createElement('div');
    header.classList.add("card-title", "d-flex", "justify-content-between", "align-items-baseline");
    body.appendChild(header);

    const nameSection = document.createElement('div');
    header.appendChild(nameSection);
  
    const avatar = document.createElement('img');
    avatar.src = user.avatar;
    nameSection.appendChild(avatar);

    const name = document.createElement('h2');
    name.innerHTML = user.first_name + " " + user.last_name;
    nameSection.appendChild(name);

    const username = document.createElement('h5');
    username.classList.add("card-subtitle", "mb-1");
    username.innerHTML = "@" + user.username;
    body.appendChild(username);

    const followsBtn = document.createElement('button');
    followsBtn.id = "followsBtn";
    followsBtn.innerHTML = "Follows";
    followsBtn.classList.add("btn", "btn-secondary", "d-block", "mt-2");
    followsBtn.setAttribute("type", "button");
    followsBtn.setAttribute("data-bs-toggle", "collapse");
    followsBtn.setAttribute("data-bs-target", "#collapseBody");
    followsBtn.setAttribute("aria-expanded", "false");
    followsBtn.setAttribute("aria-controls", "collapseBody");
    body.appendChild(followsBtn);

    const followBtn = document.createElement('button');
    followBtn.classList.add("btn", "btn-light");
    followBtn.innerHTML = "Follow";
    followBtn.id = "followBtn";
    followBtn.addEventListener("click", followFunction);
    header.appendChild(followBtn);

    api.getCurrentUser().then(currentUser => {
        //make the button sign out if this is the current user's page
        if (currentUser.id == user.id) {
            //followBtn.disabled = true;
            followBtn.removeEventListener("click", followFunction);
            followBtn.addEventListener("click", signOutFunction);
            followBtn.innerHTML = "Sign Out";
        } else {
            //make it unfollow if already followings
            api.getUserFollowing(currentUser.id).then(list => {
                //already following this user
                if (list.includes(user.id)) {
                    followBtn.innerHTML = "Unfollow";
                }
            });
        }
    });

    return userDiv;
}

//creates one card for a user under the follows button
function createFollowsHTML(id) {
    const userDiv = document.createElement('a');
    userDiv.classList.add("card", "text-decoration-none", "mt-2");

    const body = document.createElement('div');
    body.classList.add("card-body", "p-0");
    userDiv.appendChild(body);
  
    const header = document.createElement('div');
    header.classList.add("card-title", "d-flex", "justify-content-between", "align-items-baseline");
    body.appendChild(header);

    const nameSection = document.createElement('div');
    header.appendChild(nameSection);
  
    const avatar = document.createElement('img');
    
    nameSection.appendChild(avatar);

    const name = document.createElement('h5');
    name.classList.add("text-dark");
    nameSection.appendChild(name);
  
    const username = document.createElement('h6');
    username.id = "followsUsername";
    username.classList.add("card-subtitle", "text-muted");
    nameSection.appendChild(username);

    api.getUser(id).then(user => {
        avatar.src = user.avatar;
        name.innerHTML = user.first_name + " " + user.last_name;
        username.innerHTML = "@" + user.username;
        userDiv.href = URL_BASE + "/user?username=" + user.username;
    });

    return userDiv;
}
