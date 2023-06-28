var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

subjectschema = new Schema({
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
  
    status: {
        type: Number,
        default: 0
    },
 
    create_date: {
        type: Date,
        default: Date.now
    }
});




subjectschema.index({ create_date: 1 }, { background: true });



module.exports = mongoose.model('subject', subjectschema);