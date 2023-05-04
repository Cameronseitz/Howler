// code based off jwt lecture
const crypto = require('crypto');
const base64url = require('base64url');

//same header for all users
const header = {
  "alg": "HS256",
  "typ": "JWT"
}

//make sure the token is correct and send back decoded payload
function verify(token, API_SECRET) {
  let segments = token.split('.');
  if (segments.length != 3) {
    throw new Error('Token not in correct format.');
  } else {
    const header = segments[0];
    const payload = segments[1];
    const signature = segments[2];

    const headerPayload = header + "." + payload;
    const signatureToCheck = crypto.createHmac('sha256', API_SECRET)
                      .update(headerPayload).digest('base64url');
    if (signatureToCheck !== signature) {
      throw new Error('Signatures do not match.');

    //signature matches, check date
    } else {
      const currentTime = Math.floor(Date.now() / 1000);
      const decodedPayload = JSON.parse(base64url.decode(payload));
      const exp = decodedPayload.exp;
      
      if (currentTime >= exp) {
        throw new Error('Token expired.');
      }

      return decodedPayload;
    }
  }
}

const TOKEN_COOKIE_NAME = "HowlerToken";
// In a real application, you will never hard-code this secret and you will
// definitely never commit it to version control, ever
const API_SECRET = "60d0954e20eaa0c02b382171c33c53bc18522cc6d4805eaa02e182b0";

exports.TokenMiddleware = (req, res, next) => {
  // We will look for the token in two places:
  // 1. A cookie in case of a browser
  // 2. The Authorization header in case of a different client
  let token = null;
  if(!req.cookies[TOKEN_COOKIE_NAME]) {
    //No cookie, so let's check Authorization header
    const authHeader = req.get('Authorization');
    if(authHeader && authHeader.startsWith("Bearer ")) {
      //Format should be "Bearer token" but we only need the token
      token = authHeader.split(" ")[1];
    }
  }
  else { //We do have a cookie with a token
    token = req.cookies[TOKEN_COOKIE_NAME]; //Get session Id from cookie
  }

  if(!token) { // If we don't have a token
    res.status(401).json({error: 'Not authenticated'});
    return;
  }

  //If we've made it this far, we have a token. We need to validate it

  try {
    const decoded = verify(token, API_SECRET);
    req.user = decoded.user;
    next(); //Make sure we call the next middleware
  }
  catch(err) { //Token is invalid
    res.status(401).json({error: 'Not authenticated'});
    return;
  }
}

exports.generateToken = (req, res, user) => {

  let data = {
    user: user,
    // Use the exp registered claim to expire token in 1 hour
    exp: Math.floor(Date.now() / 1000) + (60 * 60)
  }

  //create token as Header.Payload.Signature
  const header_encoded = base64url.encode(JSON.stringify(header));
  const payload_encoded = base64url.encode(JSON.stringify(data));
  const signature = header_encoded + "." + payload_encoded;
  const signature_encoded = crypto.createHmac('sha256', API_SECRET).update(signature).digest('base64url');
  const token = header_encoded + "." + payload_encoded + "." + signature_encoded;

  //send token in cookie to client
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    maxAge: 5 * 60 * 1000 //This session expires in 5 minutes.. but token expires in 1 hour!
  });
};

exports.removeToken = (req, res) => {
  //send session ID in cookie to client
  res.cookie(TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    maxAge: -360000 //A date in the past
  });

}
