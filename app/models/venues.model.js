const db = require('../../config/db');

exports.get = function(values, done) {
    db.getPool().query("SELECT venue_id as venueId, admin_id as adminId, category_id as categoryId, venue_name as venueName, city, short_description as shortDescription, latitude, longitude, AVG(star_rating) as meanStarRating, AVG(cost_rating) as meanCostRating " +
        "FROM Venue JOIN Review ON Venue.venue_id = Review.reviewed_venue_id", values, function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.insert = function(done) {
    return done(null);
};