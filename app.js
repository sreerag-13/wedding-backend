const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer"); // For handling image uploads
const path = require("path"); // Required for serving static files
const { photomodel } = require("./models/photographer");
const { photopostmodel } = require("./models/photographpost");

const fs = require('fs');
const { usermodel } = require("./models/user");
const { pricingmodel } = require("./models/Ppricing");

let app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'images' and 'uploads' directories
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // For serving uploaded images

// Connect to MongoDB
mongoose.connect("mongodb+srv://sreerag:sreerag@cluster0.onuj57g.mongodb.net/weddingeventdb?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Multer configuration for handling image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder to store images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Create a unique filename
    }
});
const upload = multer({ storage: storage });

// Existing API for photographer signup
app.post("/photosignup", async (req, res) => {
  const input = req.body;
  const fullPath = input.Pimage;
  const fileName = path.basename(fullPath); // Extract filename
  input.Pimage = fileName;

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



app.post("/usersignup", async (req, res) => {
  const input = req.body;

  try {
    // Hash the password
    const hashedPassword = bcrypt.hashSync(input.Password, 10);
    input.Password = hashedPassword;

    // Check if the email already exists
    const existingUser = await usermodel.findOne({ Email: input.Email });
    if (existingUser) {
      return res.json({ status: "email already exists" });
    }

    // Create and save the new user
    const newUser = new usermodel(input);
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ Email: input.Email }, "UserApp", { expiresIn: "1d" });

    // Log the token in the terminal
    console.log("JWT Token:", token);

    // Respond to the client
    res.json({ status: "success", token });
  } catch (error) {
    console.error("Error saving user:", error);
    res.json({ status: "error", message: error.message });
  }
});


app.post("/viewallp", async (req, res) => {
  try {
    // Fetch all photographers, excluding passwords for security
    const photographers = await photomodel.find().select('-Password');
    res.status(200).json(photographers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching photographers", error });
  }
});


// Existing photographer signin API with JWT
app.post("/photosignin", (req, res) => {
  let input = req.body;

  photomodel.findOne({ "Email": req.body.Email })
    .then((response) => {
      if (response) {
        const dpassword = bcrypt.compareSync(input.Password, response.Password);
        if (dpassword) {
          jwt.sign({ Email: input.Email }, "WeddingApp", { expiresIn: "1d" }, (error, token) => {
            if (error) {
              res.json({ "status": "error", "errorMessage": error });
            } else {
              res.json({
                "status": "success",
                "token": token,
                "userId": response._id,
                "Pimage": response.Pimage,
                "PName": response.PName
              });
            }
          });
        } else {
          res.json({ "status": "incorrect password" });
        }
      } else {
        res.json({ "status": "incorrect email" });
      }
    })
    .catch((error) => {
      res.json({ "status": "error", "message": error.message });
    });
});
// User Signin Route
// User Signin Route
app.post('/usersignin', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const user = await usermodel.findOne({ Email });
    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Incorrect email' });
    }

    const isPasswordValid = bcrypt.compareSync(Password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 'error', message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign({ Email }, 'WeddingApp', { expiresIn: '1d' }); // Use the same secret
    res.json({
      status: 'success',
      token,
      userId: user._id,
      UName: user.UName,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});





// Existing API to create a post with JWT authentication (without file upload)
/*app.post("/createphoto", async (req, res) => {
  let input = req.body;
  let token = req.headers.token;

  jwt.verify(token, "WeddingApp", async (error, decoded) => {
    if (decoded) {
      let result = new photopostmodel(input);
      await result.save();
      res.json({ "status": "status done" });
    } else {
      res.json({ "status": "invalid auth" });
    }
  });
});
*/
app.post("/create-post", upload.array('postImage', 3), async (req, res) => {
  console.log("Request received to create a new post");
  
  const token = req.body.token;
  console.log("Token:", token);
  
  // Verify the token
  jwt.verify(token, "WeddingApp", async (error, decoded) => {
    if (error || !decoded) {
      console.log("Error verifying token:", error);
      return res.status(401).json({ status: "invalid auth" });
    }

    console.log("Token verified successfully");

    // Get userId from the decoded token or request body
    const userId = req.body.userId;
    console.log("User  ID:", userId);

    if (!userId) {
      console.log("User  ID is required");
      return res.status(400).json({ message: "User  ID is required" });
    }

    // Ensure files are uploaded
    if (!req.files || req.files.length === 0) {
      console.log("No files uploaded");
      return res.status(400).json({ message: "At least one image is required" });
    }

    console.log("Files uploaded successfully");

    // Collect file paths from the uploaded files
    const postImages = req.files.map(file => file.filename);
    console.log("File paths:", postImages);

    try {
      // Create a new post with userId and postImage
      const newPost = new photopostmodel({
        userId: new mongoose.Types.ObjectId(userId), // Correct ObjectId instantiation
        postImage: postImages // Save the filenames (no need to modify)
      });

      console.log("New post created:", newPost);

      // Save the post to the database
      await newPost.save();
      console.log("Post saved successfully");

      // Respond with success and the newly created post
      res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Error creating post", error });
    }
  });
});


app.post("/create-pricing", async (req, res) => {
  console.log("Reached /create-pricing route");
  console.log("Request Body:", req.body);

  const { token } = req.headers;
  const { packageName, price, duration, userId } = req.body;

  if (!token || !packageName || !price || !userId) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
  }

  jwt.verify(token, "WeddingApp", async (error, decoded) => {
      if (error) {
          if (error.name === "TokenExpiredError") {
              console.log("Token expired. Generating a new token...");

              // Generate a new token with a 1-day expiration
              const newToken = jwt.sign({ userId }, "WeddingApp", { expiresIn: "1d" });

              res.setHeader("new-token", newToken); // Optional: Send the new token to the frontend
              console.log("New token issued:", newToken);

              // Proceed with creating the pricing entry
          } else {
              console.error("Invalid token:", error);
              return res.status(401).json({ message: "Invalid token" });
          }
      }

      try {
          // Create a new pricing entry
          const newPricing = new pricingmodel({
              userId: new mongoose.Types.ObjectId(userId),
              packageName,
              price,
              duration,
          });

          console.log("New pricing created:", newPricing);
          await newPricing.save();

          res.status(201).json({ message: "Pricing created successfully", pricing: newPricing });
      } catch (error) {
          console.error("Error creating pricing:", error);
          res.status(500).json({ message: "Error creating pricing", error });
      }
  });
});

app.post('/get-pricing', async (req, res) => {
  try {
    const pricingData = await pricingmodel.find();
    res.json(pricingData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pricing data', error });
  }
});


app.post("/view-my-posts", async (req, res) => {
  const { token, userId } = req.body;

  if (!token || !userId) {
    return res.status(401).json({ message: "Token and userId are required" });
  }

  jwt.verify(token, "WeddingApp", async (error, decoded) => {
    if (error || !decoded) {
      console.log("Error verifying token:", error);
      return res.status(401).json({ message: "Invalid authentication" });
    }

    try {
      const userPosts = await photopostmodel.find({ userId }).exec();
      console.log("User Posts:", userPosts); // Debug log

      if (userPosts.length === 0) {
        return res.status(404).json({ message: "No posts found for this user" });
      }

      res.status(200).json({ message: "Posts fetched successfully", posts: userPosts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Error fetching posts", error });
    }
  });
}); 

app.use(express.json()); // Middleware to parse JSON bodies

app.post("/view-photographer-posts", async (req, res) => {
    const { token, photographerId } = req.body;

    // Verify the token
    jwt.verify(token, "WeddingApp", async (error, decoded) => {
        if (error) {
            console.error("Token verification failed:", error.message); // Log error message
            return res.status(401).json({ message: "Invalid authentication", error: error.message });
        }

        try {
            const posts = await photopostmodel.find({ userId: photographerId }).exec();
            res.json({ posts });
        } catch (error) {
            console.error("Error fetching posts:", error);
            res.status(500).json({ message: "Error fetching posts", error });
        }
    });
});

app.post("/pricing", async (req, res) => {
  const { userId } = req.body; // Get userId from the request body

  if (!userId) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
  }

  try {
      // Fetch pricing details for the given user
      const pricingDetails = await pricingmodel
          .find({ userId })
          .populate("userId", "PName");

      if (!pricingDetails.length) {
          return res.status(404).json({ status: "error", message: "No pricing found for this photographer" });
      }

      res.status(200).json({
          status: "success",
          data: pricingDetails,
      });
  } catch (error) {
      res.status(500).json({ status: "error", message: error.message });
  }
});

// Existing API for photographer profile
app.post("/photoprofile", (req, res) => {
  let token = req.headers.token;

  jwt.verify(token, "WeddingApp", (error, decoded) => {
    if (decoded) {
      photomodel.findOne({ Email: decoded.Email })
        .populate('userId', 'PName Pimage Phone')
        .then((items) => {
          if (items) {
            res.json(items);
          } else {
            res.json({ "status": "no items found" });
          }
        })
        .catch((error) => {
          res.json({ "status": "error" });
        });
    } else {
      res.json({ "status": "invalid authentication" });
    }
  });
});

// Start the server
app.listen(8082, () => {
  console.log("Server started on port 8082");
});
