const Mongoose=require("mongoose")
const priceschema=Mongoose.Schema({
    userId:{type:Mongoose.Schema.Types.ObjectId,
        ref:"photographer",
        require:true
    },  
    packageName: { type: String, required: true },    // Name of the pricing package
    price: { type: Number, required: true },          // Price for the package
    duration: { type: String }                    // Duration of the package (e.g., 2 hours, full da
})
var pricingmodel=Mongoose.model("ppricing",priceschema);
module.exports={pricingmodel}

