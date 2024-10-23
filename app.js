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
const { bookingModel } = require("./models/booking");
const { adminmodel } = require("./models/admin");
const { audimodel } = require("./models/auditorium");
const { amodel } = require("./models/auditoriumpost");
const { audipmodel } = require("./models/Apricing");
const { catsmodel } = require("./models/catering");
const { sendEmail } = require("./models/email");
const { catpmodel } = require("./models/Caterp");
const { catspostmodel } = require("./models/caterpost");
require('dotenv').config();
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
+



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


app.post('/admin/signup', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    // Check if the email already exists
    const existingAdmin = await adminmodel.findOne({ Email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create a new admin
    const newAdmin = new adminmodel({
      Email,
      Password: hashedPassword,
    });

    // Save the admin to the database
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully.' });
  } catch (error) {
    console.error('Error during admin signup:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/audisignup', upload.single('aimage'), async (req, res) => {
  const input = req.body;

  // Trim whitespace from the input fields
  Object.keys(input).forEach((key) => {
    if (typeof input[key] === 'string') {
      input[key] = input[key].trim();
    }
  });

  // Handle the image path
  const fileName = req.file ? req.file.filename : null; // Get the filename from multer
  console.log(fileName);
  input.aimage = fileName; // Store only the filename in the database
  console.log(input.aimage);

  // Hash the password
  const hashedPassword = bcrypt.hashSync(input.Password, 10);
  input.Password = hashedPassword;

  try {
    // Check if the email already exists
    const existingAuditorium = await audimodel.findOne({ Email: input.Email });
    if (existingAuditorium) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    // Save the new auditorium
    const newAuditorium = new audimodel(input);
    await newAuditorium.save();

    res.json({ status: 'success', message: 'Auditorium registered successfully' });
  } catch (error) {
    console.error('Error saving auditorium:', error);
    res.status(500).json({ status: 'error', message: 'An error occurred. Please try again.' });
  }
});

app.post('/catering-signup', upload.single('Cimage'), async (req, res) => {
  const input = req.body;

  // Trim whitespace from the input fields
  Object.keys(input).forEach((key) => {
    if (typeof input[key] === 'string') {
      input[key] = input[key].trim();
    }
  });

  // Handle the image path
  const fileName = req.file ? req.file.filename : null; // Get the filename from multer
  input.Cimage = fileName; // Store only the filename in the database

  // Hash the password
  const hashedPassword = bcrypt.hashSync(input.Password, 10);
  input.Password = hashedPassword;

  try {
    // Check if the email already exists
    const existingCatering = await catsmodel.findOne({ Email: input.Email });
    if (existingCatering) {
      return res.status(400).json({ status: 'error', message: 'Email already exists' });
    }

    // Save the new catering service
    const newCatering = new catsmodel(input);
    await newCatering.save();

    res.status(201).json({ status: 'success', message: 'Catering registered successfully!' });
  } catch (error) {
    console.error('Error in catering signup:', error);
    res.status(500).json({ status: 'error', message: 'Error registering catering service' });
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

app.post("/viewallA", async (req, res) => {
  try {
    // Fetch all photographers, excluding passwords for security
    const auditorium = await audimodel.find().select('-Password');
    console.log(auditorium)
    res.status(200).json(auditorium);
  } catch (error) {
    res.status(500).json({ message: "Error fetching photographers", error });
  }
});
app.post("/viewallC", async (req, res) => {
  try {
    // Fetch all caterers, excluding the Password field for security
    const caterers = await catsmodel.find().select('-Password'); 
    console.log(caterers);
    res.status(200).json(caterers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching caterers", error });
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

app.post("/auditorium/signin", async (req, res) => {
  const input = req.body;

  try {
    const response = await audimodel.findOne({ Email: input.Email });

    if (response) {
      const passwordMatch = bcrypt.compareSync(input.Password, response.Password);
      if (passwordMatch) {
        // Generate JWT token
        jwt.sign({ Email: input.Email }, "WeddingApp", { expiresIn: "1d" }, (error, token) => {
          if (error) {
            return res.json({ status: "error", errorMessage: error.message });
          }
          res.json({
            status: "success",
            token: token,
            auditoriumId: response._id,
            aName: response.aName,
            aimage: response.aimage
          });
        });
      } else {
        res.json({ status: "error", message: "Incorrect password" });
      }
    } else {
      res.json({ status: "error", message: "Incorrect email" });
    }
  } catch (error) {
    console.error("Error during auditorium sign-in:", error);
    res.json({ status: "error", message: error.message });
  }
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

app.post('/admin/signin', async (req, res) => {
  const { Email, Password } = req.body;

  try {
    // Check if the admin exists
    const admin = await adminmodel.findOne({ Email });
    if (!admin) {
      return res.status(400).json({ status: 'error', message: 'Incorrect email' });
    }

    // Validate password
    const isPasswordValid = bcrypt.compareSync(Password, admin.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ status: 'error', message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign({ Email, role: 'admin' }, 'WeddingApp', { expiresIn: '1d' });

    res.json({
      status: 'success',
      token,
      adminId: admin._id,
      Email: admin.Email,
    });
  } catch (error) {
    console.error('Error during admin signin:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

app.post("/catering/signin", async (req, res) => {
  const input = req.body;

  try {
    const response = await catsmodel.findOne({ Email: input.Email });

    if (response) {
      const passwordMatch = bcrypt.compareSync(input.Password, response.Password);
      if (passwordMatch) {
        // Generate JWT token
        jwt.sign({ Email: input.Email }, "WeddingApp", { expiresIn: "1d" }, (error, token) => {
          if (error) {
            return res.json({ status: "error", errorMessage: error.message });
          }
          res.json({
            status: "success",
            token: token,
            cateringId: response._id,
            CName: response.CName,
            Cimage: response.Cimage
          });
        });
      } else {
        res.json({ status: "error", message: "Incorrect password" });
      }
    } else {
      res.json({ status: "error", message: "Incorrect email" });
    }
  } catch (error) {
    console.error("Error during catering sign-in:", error);
    res.json({ status: "error", message: error.message });
  }
})

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

app.post("/create-auditorium-post", upload.array("postImage", 3), async (req, res) => {
  console.log("Request received to create a new auditorium post");

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
    console.log("User ID:", userId);

    if (!userId) {
      console.log("User ID is required");
      return res.status(400).json({ message: "User ID is required" });
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
      // Create a new auditorium post with userId and postImage
      const newPost = new amodel({
        userId: new mongoose.Types.ObjectId(userId), // Correct ObjectId instantiation
        postImage: postImages, // Save the filenames (no need to modify)
      });

      console.log("New auditorium post created:", newPost);

      // Save the post to the database
      await newPost.save();
      console.log("Auditorium post saved successfully");

      // Respond with success and the newly created post
      res.status(201).json({ message: "Auditorium post created successfully", post: newPost });
    } catch (error) {
      console.error("Error creating auditorium post:", error);
      res.status(500).json({ message: "Error creating auditorium post", error });
    }
  });
});

app.post("/create-catering-post", upload.array("postImage", 4), async (req, res) => {
  console.log("Request received to create a new catering post");

  const token = req.body.token; // Get token from request body
  console.log("Token:", token);

  // Verify the token
  jwt.verify(token, "WeddingApp", async (error, decoded) => {
    if (error || !decoded) {
      console.log("Error verifying token:", error);
      return res.status(401).json({ status: "invalid auth" });
    }

    console.log("Token verified successfully");

    // Get userId from the decoded token or request body
    const userId = decoded.userId || req.body.userId;
    console.log("User ID:", userId);

    if (!userId) {
      console.log("User ID is required");
      return res.status(400).json({ message: "User ID is required" });
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
      // Create a new catering post with userId and postImage
      const newCateringPost = new catspostmodel({
        userId: new mongoose.Types.ObjectId(userId), // Correct ObjectId instantiation
        postImage: postImages, // Save the filenames
      });

      console.log("New catering post created:", newCateringPost);

      // Save the post to the database
      await newCateringPost.save();
      console.log("Catering post saved successfully");

      // Respond with success and the newly created post
      res.status(201).json({ message: "Catering post created successfully", post: newCateringPost });
    } catch (error) {
      console.error("Error creating catering post:", error);
      res.status(500).json({ message: "Error creating catering post", error });
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

app.post("/create-auditorium-pricing", async (req, res) => {
  console.log("Reached /create-auditorium-pricing route");
  console.log("Request Body:", req.body);

  const { userId, Capacity, price, type, duration } = req.body;

  // Check for required fields in the request body
  if (!userId || !Capacity || !price) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
  }

  try {
      // Create a new auditorium pricing entry
      const newPricing = new audipmodel({
          userId: new mongoose.Types.ObjectId(userId),
          Capacity,
          price,
          type,
          duration, // Include duration
      });

      console.log("New auditorium pricing created:", newPricing);
      await newPricing.save();

      res.status(201).json({ message: "Auditorium pricing created successfully", pricing: newPricing });
  } catch (error) {
      console.error("Error creating auditorium pricing:", error);
      res.status(500).json({ message: "Error creating auditorium pricing", error });
  }
});

app.post("/create-catering-pricing", async (req, res) => {
  console.log("Reached /create-catering-pricing route");
  console.log("Request Body:", req.body);

  const { userId, foodType, foodItems, foodPrice, Quantity, Package } = req.body;

  // Check for required fields in the request body
  if (!userId || !foodType || !foodItems || !foodPrice || !Quantity || !Package) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "All fields are required" });
  }

  try {
      // Create a new catering pricing entry
      const newPricing = new catpmodel({
          userId: new mongoose.Types.ObjectId(userId),
          foodType,
          foodItems,
          foodPrice,
          Quantity,
          Package
      });

      console.log("New catering pricing created:", newPricing);
      await newPricing.save();

      res.status(201).json({ message: "Catering pricing created successfully", pricing: newPricing });
  } catch (error) {
      console.error("Error creating catering pricing:", error);
      res.status(500).json({ message: "Error creating catering pricing", error });
  }
});

// GET API: Fetch confirmed bookings with user name and entity details
app.get("/confirmed-bookings", async (req, res) => {
  try {
    const bookings = await bookingModel
      .find({ status: "confirmed" }) // Only confirmed bookings
      .populate("userId", "UName Email") // Ensure you request UName and Email from User model
      .lean(); // Convert Mongoose objects to plain JavaScript objects

    console.log(bookings); // Debugging: Log retrieved bookings

    // Fetching entity names based on entityType and entityId
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        let entity;

        if (booking.entityType === "auditorium") {
          entity = await audimodel.findById(booking.entityId).select("aName");
        } else if (booking.entityType === "photographer") {
          entity = await photomodel.findById(booking.entityId).select("PName");
        }

        return {
          ...booking,
          entityName: entity ? entity.aName || entity.PName : "Unknown", // Attach entity name
          userId: booking.userId ? booking.userId : null, // Attach entire user object
        };
      })
    );

    res.status(200).json(enrichedBookings);
  } catch (error) {
    console.error("Error fetching confirmed bookings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post('/send-email', async (req, res) => {
  const { email, subject, body } = req.body;

  try {
    await sendEmail(email, subject, body);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email');
  }
});


app.get("/get-auditorium-pricing", async (req, res) => {
  const { auditoriumId } = req.query; // Extract auditoriumId from query parameters

  try {
      // Find pricing details for the specified auditorium
      const pricingList = await audipmodel.find({ userId: auditoriumId }).populate('userId');

      if (pricingList.length === 0) {
          return res.status(404).json({ message: "No pricing details found for this auditorium." });
      }

      res.status(200).json(pricingList);
  } catch (error) {
      console.error("Error fetching auditorium pricing data:", error);
      res.status(500).json({ message: "Error fetching auditorium pricing data", error });
  }
});

app.get('/get-pricing', async (req, res) => {
  const token = req.headers.token; // Assuming you're using token for authorization

  // Validate token here
  if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const pricingPackages = await pricingmodel.find(); // Fetch all pricing packages
      res.json(pricingPackages); // Send the data back to the client
  } catch (error) {
      console.error('Error fetching pricing:', error);
      res.status(500).json({ message: 'Error fetching pricing data' });
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

app.post("/view-my-auditorium-posts", async (req, res) => {
  const { userId } = req.body; // Extract userId

  console.log("Received userId:", userId); // Log received userId

  // Check if userId is provided
  if (!userId) {
    return res.status(401).json({ message: "userId is required" });
  }

  try {
    // Fetch posts related to the specific userId
    const auditoriumPosts = await amodel.find({ userId: new mongoose.Types.ObjectId(userId) }).exec();
    console.log("Fetched auditorium posts:", auditoriumPosts); // Log fetched posts

    // Check if any posts were found

    if (auditoriumPosts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json({ message: "Auditorium posts fetched successfully", posts: auditoriumPosts });
  } catch (error) {
    console.error("Error fetching auditorium posts:", error);
    res.status(500).json({ message: "Error fetching auditorium posts", error });
  }
});

app.post("/view-my-catering-posts", async (req, res) => {
  const { userId } = req.body; // Extract userId

  console.log("Received userId:", userId); // Log received userId

  // Check if userId is provided
  if (!userId) {
    return res.status(401).json({ message: "userId is required" });
  }

  try {
    // Fetch posts related to the specific userId
    const cateringPosts = await catspostmodel.find({ userId: new mongoose.Types.ObjectId(userId) }).exec();
    console.log("Fetched catering posts:", cateringPosts); // Log fetched posts

    // Check if any posts were found
    if (cateringPosts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json({ message: "Catering posts fetched successfully", posts: cateringPosts });
  } catch (error) {
    console.error("Error fetching catering posts:", error);
    res.status(500).json({ message: "Error fetching catering posts", error });
  }
});

app.post('/api/bookings/fetch', async (req, res) => {
  const { photographerId } = req.body;

  if (!photographerId) {
    return res.status(400).json({ message: 'Photographer ID is required.' });
  }

  try {
    // Fetch all bookings related to the photographer
    const bookings = await bookingModel.find({ entityId: photographerId });

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this photographer.' });
    }

    // Enrich bookings with user details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const user = await usermodel.findById(booking.userId).select('UName Email');
          if (!user) {
            console.log(`User not found for booking ID: ${booking._id}`);
            return { ...booking.toObject(), userName: 'N/A', userEmail: 'N/A' };
          }
          return {
            ...booking.toObject(),
            userName: user.UName,
            userEmail: user.Email,
          };
        } catch (err) {
          console.error(`Error fetching user for booking ID: ${booking._id}`, err);
          return { ...booking.toObject(), userName: 'N/A', userEmail: 'N/A' };
        }
      })
    );

    res.status(200).json({
      message: 'Bookings retrieved successfully.',
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Unable to retrieve bookings. Please try again later.' });
  }
});



app.post('/api/bookings/fetch/auditorium', async (req, res) => {
  const { auditoriumId } = req.body;

  if (!auditoriumId) {
    return res.status(400).json({ message: 'Auditorium ID is required.' });
  }

  try {
    // Fetch all bookings related to the auditorium
    const bookings = await bookingModel.find({ entityId: auditoriumId, entityType: 'auditorium' });

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this auditorium.' });
    }

    // Enrich bookings with user details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const user = await usermodel.findById(booking.userId).select('UName Email');
          if (!user) {
            console.log(`User not found for booking ID: ${booking._id}`);
            return { ...booking.toObject(), userName: 'N/A', userEmail: 'N/A' };
          }
          return {
            ...booking.toObject(),
            userName: user.UName,
            userEmail: user.Email,
          };
        } catch (err) {
          console.error(`Error fetching user for booking ID: ${booking._id}`, err);
          return { ...booking.toObject(), userName: 'N/A', userEmail: 'N/A' };
        }
      })
    );

    res.status(200).json({
      message: 'Bookings retrieved successfully.',
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Unable to retrieve bookings. Please try again later.' });
  }
});



module.exports = app;

app.post('/api/user/billing', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    // Fetch photographer bookings
    const photographerBookings = await bookingModel.find({
      userId: userId,
      entityType: 'photographer'
    });

    // Fetch auditorium bookings
    const auditoriumBookings = await bookingModel.find({
      userId: userId,
      entityType: 'auditorium'
    });

    // Initialize billing summary
    const billingSummary = {};

    // Process photographer bookings
    photographerBookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!billingSummary[bookingDate]) {
        billingSummary[bookingDate] = { auditorium: 0, photographer: 0, totalCost: 0 };
      }
      billingSummary[bookingDate].photographer += booking.totalCost; // Assuming totalCost is the total for this booking
      billingSummary[bookingDate].totalCost += booking.totalCost;
    });

    // Process auditorium bookings
    auditoriumBookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0]; // Format: YYYY-MM-DD
      if (!billingSummary[bookingDate]) {
        billingSummary[bookingDate] = { auditorium: 0, photographer: 0, totalCost: 0 };
      }
      billingSummary[bookingDate].auditorium += booking.totalCost; // Assuming totalCost is the total for this booking
      billingSummary[bookingDate].totalCost += booking.totalCost;
    });

    res.status(200).json({
      billingSummary,
    });
  } catch (error) {
    console.error('Error fetching billing summary:', error);
    res.status(500).json({ message: 'Unable to retrieve billing summary. Please try again later.' });
  }
});


//i will use it later code for pricingpage view and update
// GET User Details by ID
/*app.get('/:userId', async (req, res) => {
  try {
    const user = await usermodel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});

// PUT Update User Details
app.put('/:userId', async (req, res) => {
  try {
    const { UName, Email, Phone, Gender, uaddress, state, City } = req.body;
    const user = await usermodel.findByIdAndUpdate(
      req.params.userId,
      { UName, Email, Phone, Gender, uaddress, state, City },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
}); */




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

app.post("/auditorium-pricing", async (req, res) => {
  const { userId } = req.body; // Get userId from request body

  if (!userId) {
    return res.status(400).json({ status: "error", message: "User ID is required" });
  }

  try {
    // Fetch pricing details for the given auditorium user ID
    const pricingDetails = await audipmodel
      .find({ userId })
      .populate("userId", "aName aaddress");

    if (!pricingDetails.length) {
      return res.status(404).json({ status: "error", message: "No pricing found for this auditorium" });
    }

    res.status(200).json({
      status: "success",
      data: pricingDetails,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.post("/catering-pricing", async (req, res) => {
  const { userId } = req.body; // Get userId from request body

  // Check if userId is provided
  if (!userId) {
    return res.status(400).json({ status: "error", message: "User ID is required" });
  }

  console.log('Received userId:', userId); // Debugging log

  try {
    // Fetch pricing details for the given catering user ID
    const pricingDetails = await catpmodel
      .find({ userId })
      .populate("userId", "CName Caddress");

    console.log('Fetched pricingDetails:', pricingDetails); // Debugging log

    if (!pricingDetails.length) {
      return res.status(404).json({ status: "error", message: "No pricing found for this caterer" });
    }

    // Send successful response with data
    res.status(200).json({
      status: "success",
      data: pricingDetails,
    });
  } catch (error) {
    console.error('Error fetching pricing details:', error.message); // Log the error
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

// Route to update booking status
app.put('/api/bookings/status/:id', async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body; // Receive new status in the request body

  try {
    // Validate the status value
    if (!["pending", "confirmed"].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    // Find the booking by ID and update the status
    const updatedBooking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({ message: 'Booking status updated.', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/user/bookings', async (req, res) => {
  console.log('Received request for user bookings:', req.body);
  const { userId } = req.body;

  if (!userId) {
    console.log('User ID is required.');
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const bookings = await bookingModel.find({ userId });

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'No bookings found for this user.' });
    }

    // Enrich bookings with photographer, auditorium, or catering details
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          let entityDetails;
          // Check if the entityId corresponds to a photographer
          const photographer = await photomodel.findById(booking.entityId).select('PName Email');
          if (photographer) {
            entityDetails = {
              name: photographer.PName,
              email: photographer.Email,
              type: 'photographer',
            };
          } 
          // Check if the entityId corresponds to an auditorium
          else {
            const auditorium = await audimodel.findById(booking.entityId).select('aName Email');
            if (auditorium) {
              entityDetails = {
                name: auditorium.aName,
                email: auditorium.Email,
                type: 'auditorium',
              };
            }
            // Check if the entityId corresponds to a caterer
            else {
              const caterer = await catsmodel.findById(booking.entityId).select('CName Email');
              if (caterer) {
                entityDetails = {
                  name: caterer.CName,
                  email: caterer.Email,
                  type: 'caterer',
                };
              }
            }
          }

          // If no entity details were found, return 'N/A'
          if (!entityDetails) {
            console.log(`Entity not found for booking ID: ${booking._id}`);
            return { ...booking.toObject(), entityName: 'N/A', entityEmail: 'N/A', entityType: 'N/A' };
          }

          return {
            ...booking.toObject(),
            entityName: entityDetails.name,
            entityEmail: entityDetails.email,
            entityType: entityDetails.type,
          };
        } catch (err) {
          console.error(`Error fetching entity for booking ID: ${booking._id}`, err);
          return { ...booking.toObject(), entityName: 'N/A', entityEmail: 'N/A', entityType: 'N/A' };
        }
      })
    );

    res.status(200).json({
      message: 'Bookings retrieved successfully.',
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Unable to retrieve bookings. Please try again later.' });
  }
});


app.post('/api/book', async (req, res) => {
  const { userId, entityId, entityType, bookingItems, totalCost, bookingDates } = req.body;

  try {
    // Ensure all required fields are present
    if (!userId || !entityId || !entityType || !bookingItems || !totalCost || !bookingDates) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Convert bookingDates to an array of ISO strings for accurate comparison
    const bookingDatesArray = bookingDates.map(date => new Date(date).toISOString());

    // Check if any booking exists with the same entity and date
    const existingBooking = await bookingModel.findOne({
      entityId,
      bookingDates: { $in: bookingDatesArray }, // Check for any matching dates
    });

    if (existingBooking) {
      return res.status(409).json({ message: 'This slot is already booked for the selected date.' });
    }

    // Fetch user details
    const user = await usermodel.findById(userId).select('name email'); // Only select name and email

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create a new booking if no conflict found
    const newBooking = new bookingModel({
      userId,
      entityId,
      entityType,
      bookingItems,
      totalCost,
      bookingDates: bookingDatesArray, // Store booking dates as ISO strings
    });

    await newBooking.save();

    res.status(201).json({
      message: 'Booking successful!',
      booking: {
        ...newBooking.toObject(), // Convert booking to plain object
        userName: user.name, // Include user name
        userEmail: user.email, // Include user email
      },
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = app;
// Start the server
app.listen(8082, () => {
  console.log("Server started on port 8082");
});
