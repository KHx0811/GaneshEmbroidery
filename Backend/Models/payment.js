import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  paymentMethod: {
    type: String,
    default: null
  },
  paymentMethodDetails: {
    type: Object,
    default: {}
  },
  userDetails: {
    email: String,
    contact: String,
    name: String
  },
  metadata: {
    type: Object,
    default: {}
  },
  notes: {
    type: Object,
    default: {}
  },
  receipt: {
    type: String,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  errorCode: {
    type: String,
    default: null
  },
  errorDescription: {
    type: String,
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

paymentSchema.index({ userId: 1, orderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });

const Payment = model('Payment', paymentSchema);
export default Payment;