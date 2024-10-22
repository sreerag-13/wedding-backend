const Mongoose = require("mongoose");

const bookSchema = new Mongoose.Schema({
  userId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: "user", // Reference to the user who made the booking
    required: true,
  },
  entityId: {
    type: String, // ID of the booked service (photographer, auditorium, etc.)
    required: true,
  },
  entityType: {
    type: String, // Type of service
    required: true,
    enum: ["photographer", "auditorium", "catering"],
  },
  bookingItems: [
    {
      packageName: String,
      price: Number,
    },
  ],
  totalCost: {
    type: Number,
    required: true,
  },
  bookingDates: [
    {
      type: Date,
      required: true,
    },
  ],
  status: {
    type: String,
    default: "pending", // Default status is "pending"
    enum: ["pending", "confirmed"], // Valid statuses
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const bookingModel = Mongoose.model("Booking", bookSchema);
module.exports = { bookingModel };
