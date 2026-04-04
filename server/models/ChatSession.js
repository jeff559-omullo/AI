import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['student', 'officer'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  department: {
    type: String,
    enum: ['admissions', 'finance', 'ict', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'closed'],
    default: 'pending'
  },
  messages: [messageSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Officer'  // you'll need to create an Officer model later
  }
});

export default mongoose.model('ChatSession', chatSessionSchema);