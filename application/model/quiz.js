var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

quizschema = new Schema({
    sequence_id: {
        type: String,
        
        lovercase: true,
        trim: true,
        required: true
    },
    quetion: {
        type: String,
    },
    answer1: {
        type: String,
    },
    answer2: {
        type: String,
    },
    answer3: {
        type: String,
    },
  
    correct: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    },
    marks:{
        type: Number,
        unique: false,
        trim: true,
        required: true
    },
    
    //help by grouping
    
    quiz_id: { type: Schema.Types.ObjectId,
       
        
    },

    create_date: {
        type: Date,
        default: Date.now
    }
});



quizschema.index({ create_date: 1 }, { background: true });

//Create a Schema method to compare password 

module.exports = mongoose.model('quiz', quizschema);