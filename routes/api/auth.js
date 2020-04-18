const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// @route    GET api/auth
// @desc     Test route
// @access   Public

//router.get("/", auth, (req, res) => res.send("auth route"));
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    // .select('-password') is used since we do not want to display the password
    res.json(user); // user json can be seen on postman
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error!!");
  }
});

// @route    POST api/auth
// @desc     Authenticate user and get token while logging in
// @access   Public
router.post(
  "/",
  [
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //see if the user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      //encrypt password
      const isMatch = await bcrypt.compareSync(password, user.password); //works
      //const isMatch = password == user.password; //works
      //password is what user entered which we got from req.body
      //user.password is the password we get from the user's set password in db

      //console.log(password, user.password, isMatch); //to test values

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      //return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtToken"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
