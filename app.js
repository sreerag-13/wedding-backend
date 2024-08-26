const express=require("express")
const cors=require("cors")
const mongoose=require("mongoose")
const bcrypt=require("bcrypt")
const { photomodel } = require("./models/photographer")
let app=express()
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb+srv://sreerag:sreerag@cluster0.onuj57g.mongodb.net/weddingeventdb?retryWrites=true&w=majority&appName=Cluster0")
app.post("/photosignup",async(req,res)=>{
const input=req.body
const hashedpassword=bcrypt.hashSync(req.body.Password,10)
req.body.Password=hashedpassword
const result=new photomodel(input)
photomodel.find({Email:req.body.Email}).then((items)=>{
    console.log(items)
    if (items.length>0) {
        res.json({"status":"email is already exit"})
        
    } else {
        const result=new photomodel(input)
        console.log(result)
        result.save()
        res.json({"status":"success done"})
    }
})

})
app.listen("8082",()=>{
console.log("server start")
})