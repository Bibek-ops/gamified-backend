const mongoose = require("mongoose");

// enroll couse
const enrollCourse = new mongoose.Schema({
  course: [
    {
      title: {
        type: String,
      },
      description: {
        type: String,
      },

      complete: {
        type: Boolean,
        default: false,
      },
    },
  ],
  progress: {
    type: Number,
    default: 0,
  },

  title: {
    type: String,
  },
  price: {
    type: String,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Enroll = mongoose.model("enrollCourse", enrollCourse);
module.exports = Enroll;
