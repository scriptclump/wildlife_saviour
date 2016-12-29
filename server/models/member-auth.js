var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    profileRef: {
        type: Schema.Types.ObjectId,
        ref: 'Member'
                //default: ''
    }
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
UserSchema.pre('findOneAndUpdate', function (next, done) {
    var user = this;
    if (this._update.password) {
        var pwd = this._update.password;
        console.log('modified function called',pwd);
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(pwd, salt, function (err, hash) {
                if (err) {
                    return next(err);
                } else {
                    console.log('pwd value inside bcrypt',user._update.password);
                    user._update.password=hash;
                }
                next();
            });
        });
    } else {
        return next();
    }
})


UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);