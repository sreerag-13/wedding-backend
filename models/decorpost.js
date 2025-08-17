const mongoose=require("mongoose")
const decpostchema=mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"decoration"
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
var Decpostmodel=mongoose.model("decorationpost",decpostchema)
module.exports={Decpostmodel}