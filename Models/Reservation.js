// Import required modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReservationSchema = new Schema({
    babysitter: { 
        type: Schema.Types.ObjectId, 
        ref: 'BabySitters', 
        required: true 
    },
    parent: { 
        type: Schema.Types.ObjectId, 
        ref: 'Parents', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    duration: { 
        type: Number, 
        required: true,
        min: 1,
        max: 12
    },
    totale: { 
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    description: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Add error handling middleware
ReservationSchema.post('save', function(error, doc, next) {
    if (error.name === 'ValidationError') {
        console.error('Validation Error:', error);
    }
    next(error);
});

const Reservation = mongoose.model('Reservations', ReservationSchema);

module.exports = Reservation;

