import {Schema, model} from 'mongoose';

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    products: [{
        productId: {
            type: String,
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        machine_type: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        designFiles: {
            dst: {
                type: String,
                required: false
            },
            pes: {
                type: String,
                required: false
            }
        },
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Sending Email', 'Payment Failed', 'Mail Sent', 'Cancelled'],
        default: 'Pending'
    },
    paymentId: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    customerNotes: {
        type: String,
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    emailSentAt: {
        type: Date,
        default: null
    },
    emailStatus: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    emailError: {
        type: String,
        default: null
    },
    designFilesEmailSent: {
        type: Boolean,
        default: false
    },
    designFilesEmailSentAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const Order = model('Order', orderSchema);

export default Order;
