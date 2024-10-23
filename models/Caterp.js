const mongoose=require("mongoose")
const pcatschema=mongoose.Schema({
    
        userId:{type:mongoose.Schema.Types.ObjectId,
            ref:"catering"
        },
    foodType: { type: String, required: true, enum: ['Vegetarian', 'Non-Vegetarian'] }, 
    foodItems: [{ type: String }],    // Array of non-vegetarian food items
    foodPrice: { type: Number, required: true },
    Quantity:{ type:String , required: true },
    Package:{ type:String , required: true }// Food package price
})
var catpmodel=mongoose.model("pcatering",pcatschema)
module.exports={catpmodel}