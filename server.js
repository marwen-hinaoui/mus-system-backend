const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(bodyParser.json());

// app.use(
//   cors({
//     // origin: "http://10.70.26.254:3001",
//     origin: "http://127.0.0.1:3001",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: ["http://127.0.0.1:3001", "http://10.70.26.254:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/demande", require("./routes/demande.route"));
app.use("/api/trim", require("./routes/trim.routes"));
app.use("/api/stock", require("./routes/stock.routes"));

const PORT = 3000;
const HOST = "127.0.0.1"; /////////////////////////////////////////////////////////
app.listen(PORT, HOST, async () => {
  try {
    await sequelize.authenticate();
    // console.log("ACCESS TOKEN KEY:", process.env.JWT_SECRET_KEY);

    console.log(
      "Connected to DB and server running on http://" + HOST + ":" + PORT
    );
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
});
