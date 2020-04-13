const express = require("express");
const connectDB = require("./config/db");
const app = express();

//connect database
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));
// no need of body-parser anymore
//Express version 4.16+, their own body-parser implementation is now included in the default Express package so there is no need for you to download another dependency.
//express can be used to parse json bodies

app.get("/", (req, res) => res.send("API Running... "));

//define routes
app.use("/api/users", require("./routes/api/users")); //Registering the user
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile/me", require("./routes/api/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server started on PORT ${PORT}"));
