const db = require('../../config/db');

exports.get = function(values, done) {
    db.getPool().query("SELECT venue_id as venueId, category_id as categoryId,  venue_name as venueName, city, short_description as shortDescription, latitude, longitude, AVG(star_rating) as meanStartRating, AVG(cost_rating) as meanCostRating" +
        " FROM Venue" +
        " LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id" +
        " ?" +
        " GROUP BY venue_id", values, function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.insert = function(done) {
    return done(null);
};