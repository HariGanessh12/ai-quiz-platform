import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length === 4,
        message: "Each question must have exactly four options.",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const QuizSchema = new mongoose.Schema(
  {
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
