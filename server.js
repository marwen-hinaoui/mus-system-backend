require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.API_PORT || 3000;

async function startServer() {
  await connectDB(); // Connect to the database first
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access API at http://localhost:${PORT}/api/demandes`);
  });
}

startServer();
