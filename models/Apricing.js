const mongoose=require("mongoose")
const audipschema=mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "auditorium",  // Ensure it matches the correct model name ("photo")
        required: true,
    },
    Capacity: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String },
    duration: { type: String }
})
var audipmodel=mongoose.model("pauditorium",audipschema)
module.exports={audipmodel}