var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

transectionschema = new Schema({
    sequence_id: {
        type: String,
        lovercase: true,
        trim: true,
        required: true
    },
    sent: {
        type: String,
        required: true
    },
    received: {
        type: String,
        required: true
    },
    
    money: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    },


});



module.exports = mongoose.model('transection', transectionschema);