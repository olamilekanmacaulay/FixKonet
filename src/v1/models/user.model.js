const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+?[1-9]\d{1,14}$/.test(v); 
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    role: {
        type: String,
        enum: ['client', 'artisan'],
        default: 'client',
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
}, { timestamps: true });

//userSchema.index({ phoneNumber: 1 });
//userSchema.index({ email: 1 });
userSchema.index({ role: 1 });


// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
    return this;
};

// Static method to find by phone
userSchema.statics.findByPhone = function(phoneNumber) {
    return this.findOne({ phoneNumber });
};

module.exports = mongoose.model('User', userSchema);