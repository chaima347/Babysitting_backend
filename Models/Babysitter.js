// Import required modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

const babysitterAvatars = [
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
];

const BabysitterSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    age: {
        type: Number,
        required: [true, 'Age is required']
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required']
    },
    adresse: {
        type: String,
        required: [true, 'Address is required']
    },
    photo: {
        type: String,
        default: function() {
            const randomIndex = Math.floor(Math.random() * babysitterAvatars.length);
            return babysitterAvatars[randomIndex];
        }
    },
    tarif: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        default: 0
    },
    competances: [{
        type: String
    }],
    disponibilite: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Evaluations'
    }],
    certifications: [{
        name: String,
        date: Date,
        issuer: String
    }],
    languages: [{
        type: String
    }],
    availability: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    bio: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true,
    id: false,
    versionKey: false
});

BabysitterSchema.set('autoIndex', false);

BabysitterSchema.index({ 
    name: 'text', 
    adresse: 'text',
    competances: 'text' 
});

BabysitterSchema.index({ 
    adresse: 'text',
    name: 'text'
});

BabysitterSchema.statics.searchByAddress = function(address) {
    return this.find({
        $or: [
            { adresse: { $regex: address, $options: 'i' } },
            { adresse: { $text: { $search: address } } }
        ]
    });
};

const Babysitter = mongoose.model('BabySitters', BabysitterSchema);

module.exports = Babysitter;
 