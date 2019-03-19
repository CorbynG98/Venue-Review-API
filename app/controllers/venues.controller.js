const Venues = require("../models/venues.model");
const authCheck = require("../Util/authCheck");

exports.getById = function(req, res) {
    let user_data = {
        "startIndex": req.query.startIndex,
        "count": req.query.count,
        "city": req.query.city,
        "q": req.query.q,
        "categoryId": req.query.categoryId,
        "minStarRating": req.query.minStarRating,
        "maxCostRating": req.query.maxCostRating,
        "adminId": req.query.adminId,
        "sortBy": req.query.sortBy,
        "reverseSort": req.query.reverseSort,
        "myLatitude": req.query.myLatitude,
        "myLongitude": req.query.myLongitude
    };

    let isDistance = false;
    let getDistance = "";

    // set defaults if they weren't defined
    if (user_data["sortBy"] == undefined) user_data["sortBy"] = "STAR_RATING";
    if (user_data["reverseSort"] == undefined)  {
        user_data["reverseSort"] = false;
    } else {
        user_data["reverseSort"] = user_data["reverseSort"] === "true";
    }
    if (user_data["startIndex"] == undefined) user_data["startIndex"] = 0;

    if (!["STAR_RATING", "COST_RATING", "DISTANCE"].includes(user_data["sortBy"])) {
        res.status(400);
        res.json("Bad Request");
        return;
    }

    if (user_data["myLatitude"] != undefined && user_data["myLongitude"] != undefined) {
        getDistance = ", (6371 * acos (cos(radians(-45))" +
            " * cos (radians(latitude))" +
            " * cos (radians(longitude) - radians(170)) + sin(radians(-45))" +
            " * sin (radians(latitude)) ) ) AS distance";
        isDistance = true;
    }

    let whereClaus = "WHERE ";
    let orderClaus = "";
    let fetchClaus = "";
    let havingClaus = "HAVING ";
    let modeCostRating = "(SELECT mode_cost_rating FROM ModeCostRating JOIN Venue ON ModeCostRating.venue_id = Venue.venue_id ORDER BY occurrences DESC LIMIT 1)";


    // Create parts of the query with the data here
    for (let key in user_data) {
        if (user_data[key] != undefined) {
            if (["startIndex", "count", "categoryId", "minStarRating", "maxCostRating", "adminId", "myLatitude", "myLongitude"].includes(key)) {
                if (isNaN(user_data[key])) {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
                if (key == "minStarRating") {
                    if (!["5", "4", "3", "2", "1"].includes(user_data[key])) {
                        res.status(400);
                        res.json("Bad Request");
                        return;
                    }
                }
                if (key == "maxCostRating") {
                    if (!["4", "3", "2", "1", "0"].includes(user_data[key])) {
                        res.status(400);
                        res.json("Bad Request");
                        return;
                    }
                }
                if (user_data["sortBy"] == "DISTANCE") {
                    if (!isDistance) {
                        res.status(400);
                        res.json("Bad Request");
                        return;
                    }
                }
            }
            if (key == "reverseSort") {
                if (typeof user_data[key] != "boolean") {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
            }

            // Add the part to the query
            if (key == "sortBy") {
                if (user_data[key] == "STAR_RATING")  orderClaus = "ORDER BY AVG(star_rating)";
                else if (user_data[key] == "COST_RATING") orderClaus = "ORDER BY AVG(cost_rating)";
                else if (user_data[key] == "DISTANCE") {
                    orderClaus = "ORDER BY DISTANCE";
                }
                if (!user_data["reverseOrder"]) orderClaus += " DESC";
            }
            if (key == "count") {
                // fetchClaus += "LIMIT " + user_data[key];
            }
            else {
                if (key == "adminId") whereClaus += "admin_id = " + user_data["adminId"] + "AND ";
                else if (key == "categoryId") whereClaus += "category_id = " + user_data["categoryId"] + " AND ";
                else if (key == "city") whereClaus += 'city = "' + user_data["city"] + '" AND ';
                else if (key == "q") whereClaus += "lower(venue_name) like '%" + user_data["q"] + "%' AND ";
                else if (key == "maxCostRating") havingClaus += "modeCostRating <= " + user_data["maxCostRating"] + " AND ";
                else if (key == "minStarRating") havingClaus += "AVG(star_rating) >= " + user_data["minStarRating"] + " AND ";
            }
        }
    }

    if (whereClaus == "WHERE ") whereClaus = "";
    else whereClaus = whereClaus.substring(0, whereClaus.length - 4);

    if (havingClaus == "HAVING ") havingClaus = "";
    else havingClaus = havingClaus.substring(0, havingClaus.length - 4);

    let values = [
        [getDistance],
        [whereClaus],
        [orderClaus],
        [fetchClaus],
        [havingClaus]
    ];

    Venues.get(values, function(result) {
        if (parseInt(user_data["startIndex"]) > result.length - 1 || result.length == 0) {
            res.status(200);
            res.json([]);
            return;
        }
        let endIndex = result.length;
        if (user_data["count"] != undefined) {
            if (parseInt(user_data["count"]) < endIndex) {
                endIndex = parseInt(user_data["count"]);
            }
        }
        res.status(200);
        res.json(result.splice(user_data["startIndex"], endIndex));
        return;
    });
};

exports.create = function(req, res) {
    let user_data = {
        "venue_name": req.body.venueName,
        "category_id": req.body.categoryId,
        "city": req.body.city,
        "short_description": req.body.shortDescription,
        "long_description": req.body.longDescription,
        "address": req.body.address,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude,
    };

    authCheck.checkUserAuth(req.headers["x-authorization"], function(authResult) {
        if (authResult == null) {
            res.status(401);
            res.json("Unauthorized");
            return;
        } else if (authResult == "" || authResult == []) {
            res.status("401");
            res.json("Unauthorized");
            return;
        }

        for (let key in user_data) {
            if (key != "admin_id" && user_data[key] == undefined) {
                res.status(400);
                res.json("Bad Request");
                return;
            }
            user_data[key] = user_data[key].toString().replace("'", "''");
        }
        if (user_data["latitude"] < -90 || user_data["latitude"] > 90) {
            res.status(400);
            res.json("Bad Request");
            return;
        }
        if (user_data["longitude"] < -180 || user_data["longitude"] > 180) {
            res.status(400);
            res.json("Bad Request");
            return;
        }
        if (user_data["city"].toString().trim() == "") {
            res.status(400);
            res.json("Bad Request");
            return;
        }
        if (user_data["address"].toString().trim() == "") {
            res.status(400);
            res.json("Bad Request");
            return;
        }
        if (user_data["short_description"].toString().trim() == "") {
            res.status(400);
            res.json("Bad Request");
            return;
        }
        if (user_data["venue_name"].toString().trim() == "") {
            res.status(400);
            res.json("Bad Request");
            return;
        }

        let date = new Date();

        let values = [[
            user_data["venue_name"].toString(),
            user_data["category_id"],
            user_data["city"].toString(),
            user_data["short_description"].toString(),
            user_data["long_description"].toString(),
            user_data["address"].toString(),
            user_data["latitude"],
            user_data["longitude"],
            authResult[0].user_id,
            date
        ]];

        Venues.insert(values, function(result) {
            res.status(201);
            res.json(result[result.length - 1]);
            return;
        });
    });
};

exports.getOne = function(req, res) {
    let venue_id = req.params.id;

    let values = [
        [venue_id]
    ];

    Venues.getById(values, function(result) {
        if (result == null) {
            res.status(404);
            res.json("Not Found");
            return;
        }
        res.status(200);
        res.json(result);
    });
};

exports.update = function(req, res) {
    let venue_id = req.params.id;

    let user_data = {
        "venue_name": req.body.venueName,
        "category_id": req.body.categoryId,
        "city": req.body.city,
        "short_description": req.body.shortDescription,
        "long_description": req.body.longDescription,
        "address": req.body.address,
        "latitude": req.body.latitude,
        "longitude": req.body.longitude
    };

    let queryPart = "";

    authCheck.checkVenueAuth(req.headers["x-authorization"], function(authResult) {
        if (authResult == null) {
            res.status(401);
            res.json("Unauthorized");
            return;
        } else if (authResult == "" || authResult[0].venue_id != venue_id) {
            res.status("403");
            res.json("Forbidden");
            return;
        }
        for (let key in user_data) {
            if (user_data[key] != undefined) {
                if (user_data[key] == "") {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
                if (["venue_name", "city", "short_description", "long_description", "address"].includes(key)) queryPart += key + ` = "` + user_data[key] + `", `;
                else queryPart += key + " = " + user_data[key] + ", ";
            }
        }
        if (queryPart == "") {
            res.status(400);
            res.json("Bad Request");
            return;
        }
        queryPart = queryPart.substring(0, queryPart.length - 2);
        let values = [
            [queryPart],
            [venue_id]
        ];

        Venues.alter(values, function(result) {
            if (result == null) {
                res.status(404);
                res.json("Not Found");
                return;
            }
            res.status(200);
            res.json("OK");
            return;
        });
    });
};