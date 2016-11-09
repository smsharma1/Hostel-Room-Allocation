var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');
var User = mongoose.model('Users');
var Admin = mongoose.model('Admins');

module.exports = function (passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function (user, done) {
        console.log('serializing user:', user.username);
        //return the unique id for the user
        return done(null, user._id);
    });

    //Desieralize user will call with the unique id provided by serializeuser
    passport.deserializeUser(function (id, done) {

        if(id == "582316f2dd99765ef87e6b90"){
            Admin.findById(id, function (err, admin) {
                console.log('deserializing user:', admin.username);
                done(err, admin);
            });
        }
        else {
            User.findById(id, function (err, user) {
                console.log('deserializing user:', user.username);
                done(err, user);
            });
        }
    });

    passport.use('login', new LocalStrategy({ passReqToCallback: true },
        function (req, username, password, done) {
            if (username == "admin") {
                Admin.findOne({ 'username': username },
                    function (err, admin) {
                        // In case of any error, return using the done method
                        if (err)
                            return done(err);
                        // Username does not exist, log the error and redirect back
                        if (!admin) {
                            console.log('User Not Found with username ' + username);
                            return done(null, false);
                        }
                        // User exists but wrong password, log the error 
                        if (!isValidPassword(admin, password)) {
                            console.log('Invalid Password');
                            return done(null, false); // redirect back to login page
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success
                        return done(null, admin);
                    }
                );
            }
            else {
                User.findOne({ 'username': username },
                    function (err, user) {
                        // In case of any error, return using the done method
                        if (err)
                            return done(err);
                        // Username does not exist, log the error and redirect back
                        if (!user) {
                            console.log('User Not Found with username ' + username);
                            return done(null, false);
                        }
                        // User exists but wrong password, log the error 
                        if (!isValidPassword(user, password)) {
                            console.log('Invalid Password');
                            return done(null, false); // redirect back to login page
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success
                        return done(null, user);
                    }
                );
            }
        }
    ));

    passport.use('signup', new LocalStrategy({
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, username, password, done) {

            if (username == "admin") {
                Admin.findOne({ 'username': username }, function (err, admin) {
                    // In case of any error, return using the done method
                    if (err) {
                        console.log('Error in SignUp: ' + err);
                        return done(err);
                    }
                    // already exists
                    if (admin) {
                        console.log('User already exists with username: ' + username);
                        return done(null, false);
                    } else {
                        // if there is no user, create the user
                        var newUser = new Admin();

                        // set the user's local credentials
                        newUser.username = username;
                        newUser.password = createHash(password);

                        // save the user
                        newUser.save(function (err) {
                            if (err) {
                                console.log('Error in Saving user: ' + err);
                                throw err;
                            }
                            console.log(newUser.username + ' Registration succesful');
                            return done(null, newUser);
                        });
                    }
                });
            }
            else {
                // find a user in mongo with provided username
                User.findOne({ 'username': username }, function (err, user) {
                    // In case of any error, return using the done method
                    if (err) {
                        console.log('Error in SignUp: ' + err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with username: ' + username);
                        return done(null, false);
                    } else {
                        // if there is no user, create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.username = username;
                        newUser.password = createHash(password);
                        newUser.name = req.body.name;
                        newUser.hall = req.body.hall;
                        newUser.prevRoom = req.body.prevRoom;

                        // save the user
                        newUser.save(function (err) {
                            if (err) {
                                console.log('Error in Saving user: ' + err);
                                throw err;
                            }
                            console.log(newUser.username + ' Registration succesful');
                            return done(null, newUser);
                        });
                    }
                });
            }
        }
    ));


    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
}