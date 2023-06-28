var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

feeschema = new Schema({
    sequence_id: {
        type: String,
        
        lovercase: true,
        trim: true,
        required: true
    },

    student_id: {
        type: Schema.Types.ObjectId,
    },

    class_id: {
        type: Schema.Types.ObjectId,
    },
   
    payment: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    },
   
    status: {
        type: Number,
        default: 0
    },
   
  
    create_date: {
        type: Date,
        default: Date.now
    }
});




feeschema.index({ create_date: 1 }, { background: true });

//Create a Schema method to compare password 

module.exports = mongoose.model('fee', feeschema);