const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchUser");

//secret key for jWT TOKEN
const JWT_SECRET = "Prateekisagoodb$oy";
//secret key for jWT TOKEN

//Route 1 : creation  of user using: post "/api/auth/createuser".doesn't require Auth ..
router.post(
  "/createuser",
  [
    body("Name", "Enter a valiud Name").isLength({ min: 3 }), //validation
    body("Email", "Enter a valid Email").isEmail(), //validation
    body("Password", "Enter a valid password").isLength({ min: 5 }), //validation
  ],
  async (req, res) => {
    let success = false;
    //if there is any error, return Bad request and the errors
    const errors = validationResult(req); //Error code
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    } //Error code

    //check weather the user wuth this email exists already
    try {
      let user = await User.findOne({ Email: req.body.Email });
      if (user) {
        return res.status(400).json({success, errors: "Sorry a user with this email is already exists" });
      }
      //hasing password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.Password, salt);
      //hasing password n
      //creating a user
      user = await User.create({
        Name: req.body.Name,
        Email: req.body.Email,
        Password: secPass,
      });
      //creating data for JWT tokencode
      const data = {
        user: {
          id: user.id,
        },
      };

      const auth_token = jwt.sign(data, JWT_SECRET);
      //console.log(jwtdata);
      //creating data for JWT tokencode
      //res.json(user)
      success = true;
      res.json({success, auth_token }); //here we are sending email or user id password to the user . We are passing JTW_token
    } catch (errors) {
      console.error(errors);
      res.status(500).json({ errors: "server Error" });
    }
  }
);

//Route 2 : Authentication a user using: post "/api/auth/login".

router.post(
  "/login",
  [
    body("Email", "Enter a valid Email").isEmail(), //validation
    body("Password", "Password canot be blank ").exists(), //validation
  ],
  async (req, res) => {
    let success = false;
    //if there is any error, return Bad request and the errors
    const errors = validationResult(req); //Error code
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { Email, Password } = req.body; //check whether the user is exist or not ?
    try {
      let user = await User.findOne({ Email }); // pull the user from database
      if (!User) {
        success = false;
        return res.status(400).json({ errors: "Please try to login with correct cerdentials " });
      }

      const passwordcompare = await bcrypt.compare(Password, user.Password); //here we are comparing password of the user .
      if (!passwordcompare) {
        success = false;
        return res.status(400).json({success , errors: "Please try to login with correct cerdentials " });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const auth_token = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({success , auth_token });
    } catch (errors) {
      console.error(errors);
      res.status(500).json({ errors: "server Error" });
    }
  }
);

//Route 3 : Get loggedin user deatils  using: post "/api/auth/getuser". login required ..

router.post("/getuser",fetchuser, async (req, res) => {  //fetchuser is middleware that we have created for decoding user 
    try {
      userid = req.user.id;
      const user = await User.findById(userid).select("-Password");//(-Password means we have to select all fields except the password)
      res.send(user);
    } catch (error) {
      console.error(errors);
      res.status(500).json({ errors: "server Error" });
    }

  }
)





module.exports = router;
