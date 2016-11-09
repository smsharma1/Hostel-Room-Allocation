var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
    name: String,
    password: String,
    hall: Number,
    username: String,
    prevRoom: String,
    friendPriority: Array,
    roomPriority: Array,
    finalRoom: String,
    roomie: String,
    noise: Number,
    light: Number
});

var adminSchema = new mongoose.Schema({
    password: String,
    username: String
});

mongoose.model("Users",userSchema);
mongoose.model("Admins",adminSchema);