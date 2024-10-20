const Mongoose=require("mongoose")
const aschema=Mongoose.Schema({
    "Email":{type:String,require:true},
    "Password":{type:String,require:true}
})
var adminmodel=Mongoose.model("admin",aschema);
module.exports={adminmodel}