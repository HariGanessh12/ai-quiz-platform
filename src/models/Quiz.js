import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a quiz title.'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: [true, 'Please provide a folder ID.'],
  },
  questions: {
    type: Array,
    default: [],
  },
  userId: {
    type: String,
    default: 'dummy_user_123', // Dummy user for now
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
