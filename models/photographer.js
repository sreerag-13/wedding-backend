const mongoose=require("mongoose")
let schema=mongoose.Schema({
    "PName":{type:String,require:true},
    "Email":{type:String,require:true},
    "Password":{type:String,require:true},
    "Phone":{type:String,require:true},
    "Paddress":{type:String,require:true},
    "state":{type:String,require:true},
    "City":{type:String,require:true},
    "experience":{type:String,require:true},
    "Description":{type:String,require:true},
    "Pimage":{type:String,require:true}


})
let photomodel=mongoose.model("photo",schema)
module.exports={photomodel}