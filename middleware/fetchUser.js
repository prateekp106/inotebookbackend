var jwt = require("jsonwebtoken"); //import jwt token from api mine auth.js
const JWT_SECRET = "Prateekisagoodb$oy";

const fetchuser = (req, res, next) => {
  //get the user from jwt token  and add id to req object

  const token = req.header("authtoken");
  if (!token) {
    res.status(401).send({errors : "please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({errors : "please authenticate using a valid token" });
  }
};

module.exports = fetchuser;
