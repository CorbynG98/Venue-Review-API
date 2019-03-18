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


    // Create parts of the query with the data here
    for (let key in user_data) {
        if (user_data[key] != undefined) {
            if (["startIndex", "count", "categoryId", "minStarRating", "maxCostRating", "adminId", "myLatitude", "myLongitude"].includes(key)) {
                if (isNaN(user_data[key])) {
                    console.log(key);
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
                fetchClaus += "LIMIT " + user_data[key];
            }
            else {
                if (key == "adminId") whereClaus += "admin_id = " + user_data["adminId"] + "AND ";
                else if (key == "categoryId") whereClaus += "category_id = " + user_data["categoryId"] + " AND ";
                else if (key == "city") whereClaus += "city = " + user_data["city"] + " AND ";
                else if (key == "q") whereClaus += "CONTAINS(venue_name, " + user_data["q"] + ") AND ";
            }
        }
    }

    if (whereClaus == "WHERE ") whereClaus = "";
    else whereClaus = whereClaus.substring(0, whereClaus.length - 4);

    let values = [
        [getDistance],
        [whereClaus],
        [orderClaus],
        [fetchClaus]
    ];

    Venues.get(values, function(result) {
        res.status(200);
        res.json(result);
        return;
    });
};

exports.create = function(req, res) {
    res.status(201);
    res.json("Created");
};