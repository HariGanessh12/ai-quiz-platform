import mongoose from 'mongoose';

const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a folder name.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  userId: {
    type: String,
    default: 'dummy_user_123', // Dummy user for now
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters'],
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

export default mongoose.models.Folder || mongoose.model('Folder', FolderSchema);
