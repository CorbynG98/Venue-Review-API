const Reviews = require("../models/reviews.model");
const authCheck = require("../Util/authCheck");

exports.getVenueReviews = function(req, res) {
    let venue_id = req.params.id;

    let values = [
        [venue_id]
    ];

    Reviews.getVenueReviews(values, function(result) {
        if (result == null) {
            res.status(404);
            res.json("Not Found");
            return
        }
        res.status(200);
        res.json(result);
    });
};

exports.getUserReviews = function(req, res) {
    res.status(200);
    res.json("OK");
};

exports.create = function(req, res) {
    res.status(200);
    res.json("OK");
};