const axios = require("axios");
const jwt = require("jsonwebtoken");

const isTokenExpired = token => {
  const decoded = jwt.decode(token, { complete: true });
  return decoded.payload.exp < Date.now() / 1000;
};

module.exports = (rootUri, username, password, session) => (req, res, next) => {
  if (!username || !password) {
    throw new Error("there must be username AND password to authenticate.");
  }

  // Expiration time of JWT token is 13hrs
  if (!session.token || isTokenExpired(session.token)) {
    axios({
      url: `${rootUri}/usermgmt/validate`,
      headers: {
        username,
        password
      }
    })
      .then(response => {
        const { data, status, statusText, headers, config } = response;
        session.token = data.accessToken;
        console.log("토큰발급 완료");
        next();
      })
      .catch(error => {
        console.error(error);
        // unauthorized
        res.status(401).send({
          message: error.message,
          code: error.code
        });
      })
      .catch(error => console.error(error));
  } else {
    console.log("토큰이 이미 있음");
    next();
  }
};
