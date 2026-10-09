import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['consumer', 'farmer', 'seller', 'buyer', 'admin'],
      default: 'consumer',
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: 'Hyderabad' },
      state: { type: String, default: 'Telangana' },
      district: { type: String, default: 'Hyderabad' },
      pincode: { type: String, default: '500001' },
      lat: { type: Number, default: 17.3850 },
      lng: { type: Number, default: 78.4867 },
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
