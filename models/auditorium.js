const mongoose=require("mongoose")
const audischema=mongoose.Schema({
    "aName":{type:String,require:true},
    "Email":{type:String,require:true},
    "Password":{type:String,require:true},
    "Phone":{type:String,require:true},
    "aaddress":{type:String,require:true},
    "state":{type:String,require:true},
    "City":{type:String,require:true},
    "experience":{type:String,require:true},
    "Description":{type:String,require:true},
    "aimage":{type:String,require:true}
})
var audimodel=mongoose.model("auditorium",audischema)
module.exports={audimodel}
