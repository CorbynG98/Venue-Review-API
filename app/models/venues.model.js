const db = require('../../config/db');

exports.get = function(values, done) {
    // let modeCostRating = "(SELECT mode_cost_rating FROM ModeCostRating JOIN Venue ON ModeCostRating.venue_id = Venue.venue_id ORDER BY occurrences DESC LIMIT 1)";
    let primaryPhoto = "(SELECT photo_filename FROM Venue JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id WHERE is_primary = 1 AND VenuePhoto.venue_id = venueId)";
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

exports.insert = function(values, done) {
    db.getPool().query("SELECT * FROM VenueCategory WHERE category_id = ?", values[0][1], function(err, rows) {
        if (err) return done(err);
        if (rows == "" || rows == []) return done(null);
        db.getPool().query(`INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address, latitude, longitude, admin_id, date_added) VALUES (?)`, values, function (err, rows) {
            if (err) return done(err);
            //let values = []

            db.getPool().query(`SELECT venue_id as venueId FROM Venue WHERE venue_name = ? AND address = ? AND latitude = ? AND longitude = ?`, [values[0][0], values[0][5], values[0][6], values[0][7]], function (err, result) {
                if (err) return done(err);
                return done(result);
            });
        });
    });
};

exports.getById = function(values, done) {
    db.getPool().query("SELECT Venue.venue_name as venueName, Venue.admin_id as admin, Venue.category_id as category, city, short_description as shortDescription, " +
        "long_description as longDescription, date_added as dateAdded, address, latitude, longitude, null as photos FROM Venue WHERE venue_id = ?", values, function(err, mainResult) {
        if (err) return done(err);
        if (mainResult == "" || mainResult == []) return done(null);
        db.getPool().query("SELECT user_id as userId, username FROM User WHERE user_id = ?", [[mainResult[0].admin]], function(err, userResult) {
            if (err) return done(err);
            db.getPool().query("SELECT category_id as categoryId, category_name as categoryName, category_description as categoryDescription FROM VenueCategory WHERE category_id = ?", [[mainResult[0].category]], function(err, categoryResult) {
                if (err) return done(err);
                db.getPool().query("SELECT photo_filename as photoFilename, photo_description as photoDescription, is_primary as isPrimary FROM VenuePhoto WHERE VenuePhoto.venue_id = ?", values, function(err, photoResult) {
                    if (err) return done(err);
                    mainResult[0].admin = userResult[0];
                    mainResult[0].category = categoryResult[0];
                    mainResult[0].photos = photoResult;
                    return done(mainResult[0]);
                });
            });
        });
    });
};

exports.alter = function(values, done) {
    let query = `UPDATE Venue SET ${values[0]} WHERE venue_id = ${values[1]}`;
    db.getPool().query("SELECT * FROM Venue WHERE venue_id = ?", values[1], function(err, rows) {
        if (err) return done(err);
        if (rows == null || rows == []) {
            return done(null);
        };
        db.getPool().query(query, values, function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.getCategories = function(done) {
    db.getPool().query("SELECT category_id as categoryId, category_name as categoryName, category_description as categoryDescription FROM VenueCategory", function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.uploadPhoto = function(venue_id, values, done) {
    db.getPool().query("SELECT * FROM VenuePhoto WHERE venue_id = ?", venue_id, function(err, rows) {
        if (err) return done(err);
        if (rows == [] || rows == "") {
            values[1] = 1;
        }
        db.getPool().query("INSERT INTO VenuePhoto (photo_filename, venue_id, photo_description, is_primary) VALUES (?, ?)", values, function(err, rows) {
            if (err) return done(err);
            return done(rows);
        });
    });
};

exports.resetOtherPrimary = function(venue_id, fileName, done) {
    db.getPool().query("UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ? AND photo_filename != ?", [[venue_id], [fileName]], function(err, rows) {
        if (err) return done(err);
        return done(rows);
    })
};

exports.checkVenueExists = function(venue_id, done) {
    db.getPool().query("SELECT * FROM Venue WHERE venue_id = ?", venue_id, function(err, rows) {
        if (err) return done(err);
        return done(rows);
    });
};

exports.checkVenueAndPhotoExists = function(venue_id, filename, done) {
    db.getPool().query("SELECT * FROM Venue RIGHT JOIN VenuePhoto ON Venue.venue_id = VenuePhoto.venue_id WHERE Venue.venue_id = ? AND photo_filename = ?", [[venue_id], [filename]], function(err, rows) {
        if (err) return done(err);
        if (rows == "" || rows == []) return done(null);
        return done(rows);
    })
};

exports.getPhotoByFilename = function(venue_id, filename, done) {
    db.getPool().query("SELECT photo_filename FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?", [[venue_id], [filename]], function(err, rows) {
        if (err) return done(err);
        if (rows == "" || rows == []) return done(null);
        return done(rows);
    });
};

exports.removePhoto = function(venue_id, filename, done) {
    db.getPool().query("SELECT * FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?", [[venue_id], [filename]], function(err, photo) {
        if (err) return done(err);
        if (photo == []) return done(null);
        db.getPool().query("DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?", [[venue_id], [filename]], function (err, rows) {
            if (photo[0].is_primary == 1) {
                db.getPool().query("SELECT * FROM VenuePhoto WHERE venue_id = ? LIMIT 1", venue_id, function (err, rows) {
                    if (err) return done(err);
                    if (rows == "" || rows == []) return done(true);
                    db.getPool().query("UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?", [[rows[0].venue_id], [rows[0].photo_filename]], function (err, result) {
                        console.log(result);
                    });
                });
            }
            return done(rows);
        });
    });
};