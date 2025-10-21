const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config({ override: false });

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      "http://tnbzt-sql01:3000",
      "http://localhost:3002",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
const { restoreTimersOnStartup } = require("./scheduleDemandeExpiration");
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/demande", require("./routes/demande.route"));
app.use("/api/trim", require("./routes/trim.routes"));
app.use("/api/cms", require("./routes/cms.routes"));
app.use("/api/stock", require("./routes/stock.routes"));
app.use("/api/rebuild", require("./routes/rebuild.routes"));

require("./services/demandeExpirationService");

// ====== SERVE REACT BUILD ======
// const buildPath = path.join(__dirname, "./build");
// app.use(express.static(buildPath));

// app.all("/{*any}", (req, res) => {
//   res.sendFile(path.join(buildPath, "index.html"));
// });
// ===============================

const HOST = process.env.HOST?.trim();
const PORT = process.env.PORT?.trim();

restoreTimersOnStartup();
app.listen(PORT, HOST, async () => {
  try {
    await sequelize.authenticate();

    console.log(
      "Connected to DB and server running on http://" + HOST + ":" + PORT
    );
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
});
