const db = require('../../config/db');

exports.get = function(values, done) {
    // let modeCostRating = "(SELECT mode_cost_rating FROM ModeCostRating JOIN Venue ON ModeCostRating.venue_id = Venue.venue_id ORDER BY occurrences DESC LIMIT 1)";
    let primaryPhoto = "(SELECT photo_filename FROM Venue JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id WHERE is_primary = 1)";
    let query = `SELECT Venue.venue_id as venueId, venue_name as venueName, category_id as categoryId, city, short_description as shortDescription, latitude, longitude, AVG(star_rating) as meanStartRating, mode_cost_rating as modeCostRating, ${primaryPhoto} as primaryPhoto ${values[0]} ` +
        ` FROM Venue` +
        ` LEFT JOIN Review ON Venue.venue_id = Review.reviewed_venue_id LEFT JOIN ModeCostRating ON ModeCostRating.venue_id = Venue.venue_id` +
        ` ${values[1]}` +
        ` GROUP BY Venue.venue_id` +
        ` ${values[4]}` +
        ` ${values[2]}` +
        ` ${values[3]}`;
    db.getPool().query(query, function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.insert = function(done) {
    return done(null);
};