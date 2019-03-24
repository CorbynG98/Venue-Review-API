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

        let newResult = [];

        for (let i = 0; i < result.length; i++) {
            newResult.push({
                "reviewAuthor": {
                    "userId": result[i].review_author_id,
                    "username": result[i].username
                },
                "reviewBody": result[i].reviewBody,
                "starRating": result[i].starRating,
                "costRating": result[i].costRating,
                "timePosted": result[i].timePosted
            });
        }

        res.status(200);
        res.json(newResult);
    });
};

exports.getUserReviews = function(req, res) {
    let user_id = req.params.id;

    let values = [
        [user_id]
    ];

    Reviews.getUserReviews(values, function(result) {
        if (result == null) {
            res.status(404);
            res.json("Not Found");
            return
        }

        let newResult = [];

        for (let i = 0; i < result.length; i++) {
            newResult.push({
                "reviewAuthor": {
                    "userId": result[i].review_author_id,
                    "username": result[i].username
                },
                "reviewBody": result[i].reviewBody,
                "starRating": result[i].starRating,
                "costRating": result[i].costRating,
                "timePosted": result[i].timePosted,
                "venue": {
                    "venueId": result[i].venueId,
                    "venueName": result[i].venueName,
                    "categoryName": result[i].categoryName,
                    "city": result[i].city,
                    "shortDescription": result[i].shortDescription,
                    "primaryPhoto": result[i].primaryPhoto
                }
            });
        }

        res.status(200);
        res.json(newResult);
    });
};

exports.create = function(req, res) {
    let user_data = {
        "venue_id": req.params.id,
        "review_body": req.body.reviewBody,
        "star_rating": req.body.starRating,
        "cost_rating": req.body.costRating,
        "time_posted": new Date()
    };

    authCheck.checkUserAuth(req.headers["x-authorization"], function(authResult) {
        if (authResult == null || authResult == "" || authResult == []) {
            res.status(401);
            res.json("Unauthorized");
            return;
        }
        Reviews.checkReviewer(authResult[0].user_id, function(result) {
            if (result.length != 0) {
                res.status(403);
                res.json("Forbidden");
                return;
            }
            user_data.review_author_id = authResult[0].user_id;

            for (let item in user_data) {
                if (user_data[item] == undefined) {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
                if (user_data["cost_rating"] % 1 != 0 || user_data["cost_rating"] < 0 || user_data["cost_rating"] > 4) {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
                if (user_data["star_rating"] % 1 != 0 || user_data["star_rating"] < 1 || user_data["star_rating"] > 5) {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
            }

            let values = [
                [
                    user_data["venue_id"],
                    user_data["review_body"],
                    user_data["star_rating"],
                    user_data["cost_rating"],
                    user_data["time_posted"],
                    user_data["review_author_id"]
                ]
            ];

            Reviews.insert(user_data["venue_id"], values, function(result) {
                if (result == null) {
                    res.status(404);
                    res.json("Not Found");
                    return;
                }
                res.status(201);
                res.json("Created");
                return;
            });
        });
    })
};