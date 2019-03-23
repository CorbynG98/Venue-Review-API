const db = require('../../config/db');

exports.getVenueReviews = function(values, done) {
    db.getPool().query("SELECT * FROM Review WHERE reviewed_venue_id = ?", values, function(rows) {
        if (rows == "" || rows == []) return done(null);
        db.getPool().query("SELECT review_author_id as reviewAuthor, review_body as reviewBody, star_rating as starRating, cost_rating as costRating, time_posted as timePosted" +
            " FROM Review WHERE reviewed_venue_id = ? ORDER BY timePosted", values, function(rows) {
            return done(rows);
        });
    });
};

exports.insert = function(done) {
    return done(null);
};

exports.getUserReviews = function(done) {
    return done(null);
};