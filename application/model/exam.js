var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

examschema = new Schema({
    sequence_id: {
        type: String,
        
        lovercase: true,
        trim: true,
        required: true
    },

    subject_id: {
        type: Schema.Types.ObjectId,
    },

    student_id: {
        type: Schema.Types.ObjectId,
    },
   
    marks: {
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




examschema.index({ create_date: 1 }, { background: true });

//Create a Schema method to compare password 

module.exports = mongoose.model('exam', examschema);