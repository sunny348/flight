import app from "./app.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const PORT = process.env.PORT || 5000; // Default to 5001 if PORT not in .env

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
