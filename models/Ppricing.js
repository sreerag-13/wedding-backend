const Mongoose = require("mongoose");

const priceschema = Mongoose.Schema({
    userId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "photo",  // Ensure it matches the correct model name ("photo")
        required: true,
    },
    packageName: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: String },  // Optional duration
});

const pricingmodel = Mongoose.model("ppricing", priceschema);

module.exports = { pricingmodel };
