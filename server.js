const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://127.0.0.1:3001",
    credentials: true,
  })
);
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));


const PORT = 3000;
const HOST = "0.0.0.0"; /////////////////////////////////////////////////////////
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    // console.log("ACCESS TOKEN KEY:", process.env.JWT_SECRET_KEY);

    console.log(
      "Connected to DB and server running on http://"+ HOST +':'+ PORT
    );
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
});
