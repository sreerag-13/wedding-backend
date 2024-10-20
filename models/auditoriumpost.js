const mongoose=require("mongoose")
const aschema=mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"auditorium"
    }
    ,postImage: [
        {
          type: String,
          required: true
        }
      ],
      date: {
        type: Date,
        default: Date.now
      }
})
var amodel=mongoose.model("auditoriumpost",aschema)
module.exports={amodel}