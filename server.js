const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const cors = require('cors')





const app = express();
app.use(bodyParser.json());

let corsOptions = {
   origin : ['http://127.0.0.1:3001'],
}

app.use(cors(corsOptions))

const cookieParser = require("cookie-parser");
app.use(cookieParser());



app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/ref", require("./routes/refresh.route"));

const PORT = 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB and server running on http://localhost:" + PORT);
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
});