var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

typesquizschema = new Schema({
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
        default: 1
    },
    class_id: {
        type: Schema.Types.ObjectId,
    },
    subject_id: {
        type: Schema.Types.ObjectId,
    },
   
    create_date: {
        type: Date,
        default: Date.now
    }
});



typesquizschema.index({ create_date: 1 }, { background: true });

//Create a Schema method to compare password 

module.exports = mongoose.model('typequiz', typesquizschema);