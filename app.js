const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { photomodel } = require("./models/photographer");
const path = require("path"); // Required for serving static files

let app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Connect to MongoDB
mongoose.connect("mongodb+srv://sreerag:sreerag@cluster0.onuj57g.mongodb.net/weddingeventdb?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// API to handle photographer signup
app.post("/photosignup", async (req, res) => {
  const input = req.body;
  const hashedPassword = bcrypt.hashSync(req.body.Password, 10);
  req.body.Password = hashedPassword;

  try {
    const existingPhotographer = await photomodel.findOne({ Email: req.body.Email });
    if (existingPhotographer) {
      return res.json({ status: "email already exists" });
    }

    const newPhotographer = new photomodel(input);
    await newPhotographer.save();
    res.json({ status: "success done" });
  } catch (error) {
    console.error("Error saving photographer:", error);
    res.json({ status: "error", message: error.message });
  }
});

// API to view all photographers
app.get("/viewall", async (req, res) => {
    try {
      const photographers = await photomodel.find();
      res.json(photographers); // Should return an array of photographers
    } catch (error) {
      res.status(500).json({ status: "error", message: "Error fetching data" });
    }
  });
  

// Start the server
app.listen(8082, () => {
  console.log("Server started on port 8082");
});