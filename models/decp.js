const mongoose=require("mongoose")
const decspschema=mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,
        ref:"decoration"
    },
decorationType: { type: String, required: true, enum: ['Interior Decoration', 'Outdoor Decoration','Banquet Decoration'] }, 
Duration: [{ type: String }],    // Array of non-vegetarian food items
Description: { type: String , required: true },
DecPrice: { type: Number, required: true }

})
var decpmodel=mongoose.model("decorationp",decspschema)
module.exports={decpmodel}