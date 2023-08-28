var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

studentschema = new Schema({
    sequence_id: {
        type: String,
        
        lovercase: true,
        trim: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    token: {
        type: String
    },
    email: {
        type: String,
    },
    user_name: {
        type: String,
    },
    phone: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: String,
    PassWord:String,
    status: {
        type: Number,
        default: 1
    },
    //help by grouping
    textstatus: {
        type: String,
        default: "Active"
        
        
    },
    
    class_id: {
        type: Schema.Types.ObjectId,
    },
    
    last_login: {
        type: Date,
        default: null
    },
    extra_detail: {
        type: String,
    },
    type: {
        type: Number,
        default: 0
    },
    allowed_urls: { type: Array, default: [] },
    picture: String,
    create_date: {
        type: Date,
        default: Date.now
    }
});


studentschema.index({ email: 1 }, { background: true });
studentschema.index({ phone: 1 }, { background: true });
studentschema.index({ create_date: 1 }, { background: true });

//Create a Schema method to compare password 
studentschema.methods.comparePassword = function (passwords) {
    return bcrypt.compareSync(passwords, this.password);
}
module.exports = mongoose.model('student', studentschema);