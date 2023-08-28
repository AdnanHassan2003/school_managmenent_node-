mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = function () {
    var DB_URL;
    if (process.env.NODE_ENV == 'development') {
        console.log("development")
        // DB_URL = `mongodb://localhost:27017/sample_db?authSource=admin`;
        DB_URL=`mongodb://127.0.0.1:27017/sample_db`
    } else if (process.env.NODE_ENV == 'production') {
        const DB_USER = 'root';
        const PASSWORD = encodeURIComponent('root');
        DB_URL = `mongodb://${DB_USER}:${PASSWORD}@127.0.0.1):27017/sample_db?authSource=admin`;
    }
    var db = mongoose.connect(DB_URL, {useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
    require("../application/model/admin");   
    require("../application/model/users");  
    require("../application/model/student");  
    require("../application/model/class"); 
    require("../application/model/subject"); 
    require("../application/model/exam"); 
    require("../application/model/fee"); 
    require("../application/model/setting");
    require("../application/model/message");
    
    return db;
};