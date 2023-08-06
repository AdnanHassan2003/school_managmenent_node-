var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

classschema = new Schema({
    sequence_id: {
        type: String,
        unique: true,
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



classschema.index({ create_date: 1 }, { background: true });


module.exports = mongoose.model('class', classschema);