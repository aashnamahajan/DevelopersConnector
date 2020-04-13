const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const User = require("../../models/User");
const Profile = require("../../models/profile");

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Public
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.user.id).populate("user", [
      "name",
      "avatar",
    ]);
    //used populate to display name and avatar which are there in User model not profile model.

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error!!");
  }
});

module.exports = router;
