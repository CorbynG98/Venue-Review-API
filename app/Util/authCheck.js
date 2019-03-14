const db = require('../../config/db');

exports.checkUserAuth = function(token, done) {
    if (token == null) return done(null);
    db.getPool().query("SELECT * FROM User WHERE auth_token = ?", token, function(err, result) {
        if (err) return done(err);
        if (result == "" || result == null || result == []) return done(null);
        return done(result);
    });
};