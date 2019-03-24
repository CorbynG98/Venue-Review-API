const db = require('../../config/db');

exports.getVenueReviews = function(values, done) {
    db.getPool().query("SELECT * FROM Review WHERE reviewed_venue_id = ?", values, function(err, rows) {
        if (rows == "" || rows == []) return done(null);
        db.getPool().query("SELECT review_author_id, username, review_body as reviewBody, star_rating as starRating, cost_rating as costRating, time_posted as timePosted" +
            " FROM Review JOIN User ON Review.review_author_id = user_id WHERE reviewed_venue_id = ? ORDER BY timePosted DESC", values, function(err, rows) {
            return done(rows);
        });
    });
};

exports.checkReviewer = function(user_id, done) {
    db.getPool().query("SELECT * FROM Venue JOIN Review ON Review.reviewed_venue_id = venue_id WHERE Venue.admin_id = ? OR Review.review_author_id = ?", [user_id, user_id], function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.insert = function(venue_id, values, done) {
    db.getPool().query("SELECT * FROM Venue WHERE venue_id = ?", venue_id, function(err, rows) {
        if (err) return done(err);
        if (rows == "" || rows == null || rows == []) return done(null);
        db.getPool().query("INSERT INTO Review (reviewed_venue_id, review_body, star_rating, cost_rating, time_posted, review_author_id) VALUES (?)", values, function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.getUserReviews = function(values, done) {
    db.getPool().query("SELECT * FROM User WHERE user_id = ?", values, function(err, rows) {
        if (rows == "" || rows == []) return done(null);
        db.getPool().query("SELECT user_id, username, review_body as reviewBody, star_rating as starRating, cost_rating as costRating, time_posted as timePosted, Venue.venue_id as venueId, venue_name as venueName, " +
                "(SELECT category_name " +
                "FROM VenueCategory " +
                "WHERE VenueCategory.category_id = Venue.category_id) as categoryName, " +
            "city, short_description as shortDescription, " +
            "(SELECT photo_filename FROM VenuePhoto WHERE is_primary = 1 AND VenuePhoto.venue_id = Venue.venue_id) as primaryPhoto " +
            "FROM User " +
            "LEFT JOIN Review ON Review.review_author_id = user_id " +
            "LEFT JOIN Venue ON Venue.venue_id = Review.reviewed_venue_id " +
            "LEFT JOIN VenuePhoto ON VenuePhoto.venue_id = Venue.venue_id " +
            "WHERE User.user_id = ? ", values, function(err, rows) {
            return done(rows);
        });
    });
};