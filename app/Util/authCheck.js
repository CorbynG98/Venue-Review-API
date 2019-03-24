const db = require('../../config/db');

exports.checkUserAuth = function(token, done) {
    if (token == undefined) return done(null);
    db.getPool().query("SELECT * FROM User WHERE auth_token = ?", token, function(err, result) {
        if (err) return done(err);
        // if (result == "" || result == null || result == []) return done(null);
        return done(result);
    });
};

exports.checkVenueAuth = function(token, done) {
    if (token == undefined) return done(null);
    db.getPool().query("SELECT * FROM Venue RIGHT JOIN User ON Venue.admin_id = User.user_id WHERE auth_token = ? GROUP BY venue_id", token, function(err, result) {
        if (err) return done(err);
        return done(result);
    });
};