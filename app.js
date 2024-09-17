const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken")
const { photomodel } = require("./models/photographer");
const path = require("path"); // Required for serving static files
const { photopostmodel } = require("./models/photographpost");

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
  console.log(input)
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
  

  app.post("/photosignin",(req,res)=>{
    let input=req.body
    console.log(input)
    photomodel.find({"Email":req.body.Email}).then((response)=>{
      if(response.length>0)
        {
           const dpassword=bcrypt.compareSync(input.Password,response[0].Password)
            if(dpassword)
                {
                    jwt.sign({Email:input.Email},"WeddingApp",{expiresIn:"1d"},(error,token)=>{
                        if(error)
                        {
                            res.json({"status":"eroor","errorMessage":error}) 
                        }
                        else{
                            res.json({"status":"success","token":token,"userid":response[0]._id})
                        }
                    })
                   
                }
                else{
                    res.json({"status":"incorrect password"})
                }
            }
        else{
            res.json({"status":"incorrect email"})
        }
    }
    )
    .catch()
    }
    )
 
   app.post("/createphoto", async(req,res) => {
      let input =req.body;
      let token =req.headers.token;
      console.log(input)
      console.log(token)
    
      jwt.verify(token,"WeddingApp",async(error,decoded) => {
        console.log(decoded)
        if (decoded) {
          let result =new photopostmodel(input);
          console.log(result)
          await result.save();
          res.json({ "status": "status done" });
        } else {
          res.json({ "status": "invalid auth" });
        }
      });
    }); 

   /* app.post("/createphoto", async (req, res) => {
      try {
        const token = req.headers.token;
    
        // Verify JWT token
        jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
          if (error) {
            return res.status(401).json({ "status": "invalid auth" });
          }
    
          if (!decoded) {
            return res.status(401).json({ "status": "invalid auth" });
          }
    
          // Create new photopostmodel instance
          const result = new photopostmodel(req.body);
    
          // Save the result
          try {
            result.save();
            res.json({ "status": "status done" });
          } catch (error) {
            console.error(error);
            res.status(500).json({ "status": "internal server error" });
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ "status": "internal server error" });
      }
    }); */

// Start the server
app.listen(8082, () => {
  console.log("Server started on port 8082");
});