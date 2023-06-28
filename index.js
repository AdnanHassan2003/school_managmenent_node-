//process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
// Setup server port
var port = process.env.PORT || 7000;
//console.log("process.env.NODE_ENV",process.env.NODE_ENV)
var mongoose = require("./config/mongoose");
express = require("./config/express"),
    db = mongoose(),
    app = express();

app.get('*', function (req, res) {
    res.render("404");
});

app.listen(port);
module.exports = app;
console.log('Server on ' + port);



