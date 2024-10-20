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
    res.status(200).json(auditorium);
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

module.exports = app;



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

    // Enrich bookings with photographer details (entityId references a photographer)
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        try {
          const photographer = await photomodel // Change here to photomodel
            .findById(booking.entityId) // Assuming entityId is the ID of the photographer
            .select('PName Email'); // Select the required fields

          if (!photographer) {
            console.log(`Photographer not found for booking ID: ${booking._id}`);
            return { ...booking.toObject(), photographerName: 'N/A', photographerEmail: 'N/A' };
          }

          return {
            ...booking.toObject(),
            photographerName: photographer.PName, // Change to PName
            photographerEmail: photographer.Email,
          };
        } catch (err) {
          console.error(`Error fetching photographer for booking ID: ${booking._id}`, err);
          return { ...booking.toObject(), photographerName: 'N/A', photographerEmail: 'N/A' };
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
})



module.exports = app;
// Start the server
app.listen(8082, () => {
  console.log("Server started on port 8082");
});
