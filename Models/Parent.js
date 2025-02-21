// Import required modules
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ParentSchema = new Schema({
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
        default: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    favoris: [{
        type: Schema.Types.ObjectId,
        ref: 'BabySitters'
    }]
}, {
    timestamps: true,
    id: false
});


ParentSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

const Parent = mongoose.model('Parents', ParentSchema);

module.exports = Parent;
