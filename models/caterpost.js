const mongoose=require("mongoose")
const catspostchema=mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"catering"
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
var catspostmodel=mongoose.model("cateringpost",catspostchema)
module.exports={catspostmodel}