const API_BASE = '/hw5/api';

//from lecture
const handleError = (res) => {
  if(!res.ok) {
    if(res.status == 401) {
      throw new Error("Authentication error");
    }
    else {
      throw new Error("Error")
    }
  }
  return res;
};

//from lecture
const HTTPClient = {
  get: (url) => {
    return fetch(url, {
      headers: {
      }
    }).then(handleError).then(res => {
      return res.json();
    });
  },

  post: (url, data) => {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(handleError).then(res => {
      return res.json();
    });
  },

  put: (url, data) => {
    return fetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      }
    }).then(handleError).then(res => {
      return res.json();
    });

  },

  delete: (url) => {
    return fetch(url, {
      method: 'DELETE',
      headers: {
      }
    }).then(handleError).then(res => {
      return res.json();
    });
  },
};



export default {
  getFeed: () => {
    return HTTPClient.get(API_BASE+'/users/authenticated/howls');
  },

  getUser: (userId) => {
    return HTTPClient.get(API_BASE+"/users/" + userId);
  },

  getCurrentUser: () => {
    return HTTPClient.get(API_BASE+"/users/authenticated");
  },

  getUserWithUsername: (username) => {
    return HTTPClient.get(API_BASE+"/users/username/" + username);
  },

  getUserHowls: (id) => {
    return HTTPClient.get(API_BASE+"/users/" + id + "/howls");
  },

  getUserFollowing: (id) => {
    return HTTPClient.get(API_BASE+"/users/" + id + "/following");
  },

  signOut: () => {
    window.location.href = "/hw5/login";
    return HTTPClient.post(API_BASE+"/users/authenticated/signOut", {});
  },

  followUser: (user) => {
    return HTTPClient.put(API_BASE+"/users/authenticated/follow", user);
  },

  unfollowUser: (user) => {
    return HTTPClient.put(API_BASE+"/users/authenticated/unfollow", user);
  },

  login: (form, url) => {
    let formData = new FormData(form);
    const plainFormData = Object.fromEntries(formData.entries());
	  const formDataJsonString = JSON.stringify(plainFormData);
    fetch(API_BASE + url, 
    {
      method: "post", 
      headers: {
        'Content-Type': 'application/json'
      },
      body: formDataJsonString,
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok.');
      }
      return res;
    })
    .then (res => {
      console.log("Response: ", res);
      //redirect to homepage upon signing in correctly
      window.location.href = "/hw5/";
    })
    .catch (error => {
      console.log("Error: ", error);
      alert("User not found. Try again.")
    });
  },

  sendHowl: (form, url) => {
    let formData = new FormData(form);
    const plainFormData = Object.fromEntries(formData.entries());
    return HTTPClient.post(API_BASE+url, plainFormData);
  },
};

