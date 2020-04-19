const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const User = require("../../models/User");
const Profile = require("../../models/profile");
const { check, validationResult } = require("express-validator");

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get("/me", auth, async (req, res) => {
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

// @route    POST api/profile
// @desc     create or update user's profile
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "status id required").not().isEmpty(),
      check("skills", "skills are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;
    if (website) profileFields.website = website;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skills) => skills.trim());
      //since skills is a string with commas, we split it
      //since there can be spaces around the commas we use the map on the list to trim it
    }

    // build social object
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //update the profile, when the profile already exists
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id }, // find the profile by user id
          { $set: profileFields }, //set the profile fields
          { new: true }
        );
        return res.json(profile);
      }

      //create a profile when the profile doesn't exist
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }

    //response when everything works fine
    res.send("hello.");
  }
);

// @route    GET api/profile
// @desc     Get all profile
// @access   Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("users", ["name", "avatar"]);

    res.json(profiles);
  } catch (error) {
    assert.isNotOk(error, "Promise error"); // added to resolve 'UnhandledPromiseRejectionWarning: E' error
    done(); // added to resolve 'UnhandledPromiseRejectionWarning: E' error
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user id
// @access   Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (error) {
    console.log(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("server error");
  }
});

// @route    DELETE api/profile
// @desc     Delete profile,user,posts
// @access   Private
router.delete("/", auth, async (req, res) => {
  try {
    //todo -remove users posts

    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      res.status(400).json({ errors: errors.array() });
    }

    //getting values from req.body
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    //creating an object with the data that user submits
    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);
      //unshift pushes the entry to the beginning. so the most recent can be seen first

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete an experience from the profile
// @access   Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get index of the item to be removed
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    //using splice to take something out (here taking an experience out)
    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required").not().isEmpty(),
      check("degree", "Degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      res.status(400).json({ errors: errors.array() });
    }

    //getting values from req.body
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    //creating an object with the data that user submits
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);
      //unshift pushes the entry to the beginning. so the most recent can be seen first

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete an education from the profile
// @access   Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //get index of the item to be removed
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    //using splice to take something out (here taking an experience out)
    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
