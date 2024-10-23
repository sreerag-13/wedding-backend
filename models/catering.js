const mongoose=require("mongoose")
const catschema=mongoose.Schema({
    "CName":{type:String,require:true},
    "Email":{type:String,require:true},
    "Password":{type:String,require:true},
    "Phone":{type:String,require:true},
    "Caddress":{type:String,require:true},
    "state":{type:String,require:true},
    "City":{type:String,require:true},
    "experience":{type:String,require:true},
    "Description":{type:String,require:true},
    "Cimage":{type:String,require:true}
})
var catsmodel=mongoose.model("catering",catschema)
module.exports={catsmodel}