const mongoose=require("mongoose")
const decschema=mongoose.Schema({
    "dName":{type:String,require:true},
    "Email":{type:String,require:true},
    "Password":{type:String,require:true},
    "Phone":{type:String,require:true},
    "daddress":{type:String,require:true},
    "state":{type:String,require:true},
    "City":{type:String,require:true},
    "experience":{type:String,require:true},
    "Description":{type:String,require:true},
    "dimage":{type:String,require:true}
})
var decmodel=mongoose.model("decoration",decschema)
module.exports={decmodel}