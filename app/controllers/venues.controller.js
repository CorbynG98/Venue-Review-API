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
                //orderClaus += "ORDER BY ( SELECT AVG(star_rating) FROM Review JOIN Venue ON Review.reviewed_venue_id = Venue.venue_id )";
                //if (user_data["reverseOrder"]) orderClaus += "DESC";
            }
            if (key == "count") {
                fetchClaus += "FETCH FIRST " + user_data[key] + " ROWS ONLY";
            }
            else {
                if (key == "adminId") whereClaus += "admin_id = " + user_data["adminId"] + ", ";
                if (key == "categoryId") whereClaus += "category_id = " + user_data["categoryId"] + ", ";
                if (key == "city") whereClaus += "city = " + user_data["city"] + ", ";
                if (key == "q") whereClaus += "CONTAINS(venue_name, " + user_data["q"] + "), "
            }
        }
    }

    if (whereClaus == "WHERE ") {
        whereClaus = "";
    } else {
        whereClaus = whereClaus.substring(0, whereClaus.length - 2);
    }

    let queryString = whereClaus + orderClaus + fetchClaus;

    let values = [
        [queryString]
    ];

    console.log(queryString);

    Venues.get(values, function(result) {
        res.status(200);
        res.json(result);
        return;
    });

    //console.log(fetchClaus);
    //console.log(orderClaus);
    // console.log(whereClaus);

    //res.status(200);
    //res.json("This is a temporary placeholder");
};

exports.create = function(req, res) {
    res.status(201);
    res.json("Created");
};