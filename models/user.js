const Mongoose=require("mongoose")
const uschema=Mongoose.Schema({
    "UName":{type:String,require:true},
    "Email":{type:String,require:true},
    "Gender":{type:String,require:true},
    "Password":{type:String,require:true},
    "Phone":{type:String,require:true},
    "uaddress":{type:String,require:true},
    "state":{type:String,require:true},
    "City":{type:String,require:true},
   
})
var usermodel=Mongoose.model("user",uschema);
module.exports={usermodel}

