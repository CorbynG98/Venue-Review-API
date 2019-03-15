const db = require('../../config/db');


exports.getOne = function(user_id, done) {
    db.getPool().query("SELECT username, email, given_name as givenName, family_name as familyName FROM User WHERE user_id = ?;", user_id, function(err, rows) {
        if (err) return done(err);
        return done(rows);
    })
};

exports.insert = function(values, done) {
    db.getPool().query("INSERT INTO User (username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?);", values, function(err, result) {
        if (err) return done(err);
        db.getPool().query("SELECT user_id as userId FROM User WHERE username = ?", values[0], function(err, result) {
            if (err) return done(err);
            return done(result);
        });
    });
};

exports.alter = function(values, done) {
    db.getPool().query("SELECT * FROM User WHERE user_id = ?", values[1], function(err, rows) {
        if (err) return done(err);
        if (rows == null || rows == []) {
            return done(null);
        };
        db.getPool().query("UPDATE User SET ? WHERE user_id = ?", values, function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.getAuthUsername = function(values, done) {
    db.getPool().query("UPDATE User SET auth_token = ? WHERE username = ? AND password = ?;", values, function(err, rows) {
        if (err) return done(err);
        if (rows == null || rows == []) {
            return done(null);
        }
        db.getPool().query("SELECT user_id as userId, auth_token as token FROM User WHERE auth_token = ?", values[0], function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.getAuthEmail = function(values, done) {
    db.getPool().query("UPDATE User SET auth_token = ? WHERE email = ? AND password = ?;", values, function(err, rows) {
        if (err) return done(err);
        if (rows == null || rows == []) {
            return done(null);
        }
        db.getPool().query("SELECT user_id as userId, auth_token as token FROM User WHERE auth_token = ?", values[0], function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.removeAuth = function(token, done) {
    db.getPool().query("UPDATE User SET auth_token = NULL WHERE auth_token = ?", token, function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.getPhoto = function(user_id, done) {
    db.getPool().query("SELECT profile_photo_filename FROM User WHERE user_id = ?", user_id, function (err, rows) {
        if (err) return done(err);
        if (rows == []) return done(null);
        return done(rows);
    })
};

exports.uploadPhoto = function(values, done) {
    db.getPool().query("SELECT * FROM User WHERE user_id = ?", values[1], function(err, rows) {
        if (err) return done(err);
        if (rows == []) return done(null);
        db.getPool().query("UPDATE User SET profile_photo_filename = ? WHERE user_id = ?", values, function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.deletePhoto = function(user_id, done) {
    return done(null);
};