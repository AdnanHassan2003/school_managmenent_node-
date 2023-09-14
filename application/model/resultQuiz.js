var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

resultQuizschema = new Schema({
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
    correct: {
        type: Number,
        unique: false,
        trim: true,
        required: true
    },
    wrong: {
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
    student_id:{
        type: Schema.Types.ObjectId,
    },
    quiz_id:{
        type: Schema.Types.ObjectId,
    },
    class_id:{
        type: Schema.Types.ObjectId,
    },
    subject_id:{
        type: Schema.Types.ObjectId,
    },

    create_date: {
        type: Date,
        default: Date.now
    }
});



quizschema.index({ create_date: 1 }, { background: true });

//Create a Schema method to compare password 

module.exports = mongoose.model('resultQuiz', resultQuizschema);