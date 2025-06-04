import dotenv from "dotenv";
import express from "express";
import connectToDb from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
}); // Load environment variables

connectToDb()
  .then(() => {
    app.on("error", (err) => {
      console.error(`Server error: ${err.message}`);
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MONGO DB connection failed:", err);
  });

// IIFE to connect to MongoDB
/*(async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables.");
    }

    await mongoose.connect(mongoURI);

    console.log("✅ Successfully connected to MongoDB!");

    app.on("error", () => { console.log(`🚀 Server is now offline!`)})

    const PORT = process.env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error connecting to the database:", error);
    process.exit(1); // Exit process on failure
  }
})();
*/
