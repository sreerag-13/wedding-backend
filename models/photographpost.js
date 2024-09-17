const Mongoose=require("mongoose")
const pschema=Mongoose.Schema({
    userId:{type:Mongoose.Schema.Types.ObjectId,
        ref:"photographer"
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
var photopostmodel=Mongoose.model("photopost",pschema)
module.exports={photopostmodel}