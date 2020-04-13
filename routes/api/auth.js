const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
// @route    GET api/auth
// @desc     Test route
// @access   Public

//router.get("/", auth, (req, res) => res.send("auth route"));
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    // .select('-password') is used since we do not want to display the password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error!!");
  }
});

module.exports = router;
