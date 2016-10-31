var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    password: String,
    hall: Number,
    login: String,
    prevRoom: String,
    priority: Array,
    finalRoom: String
});

mongoose.model("Users",userSchema);