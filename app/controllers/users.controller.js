const User = require("../models/users.model");
const authCheck = require("../Util/authCheck");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");

exports.getById = async function (req, res) {
    let user_id = req.params.user_id;
    User.getOne(user_id, function (result) {
        if (result === null || result == "") {
            res.status(404);
            res.json("Not Found");
            return;
        };
        delete result[0].password;
        delete result[0].user_id;
        delete result[0].auth_token;
        delete result[0].profile_photo_filename;
        authCheck.checkUserAuth(req.headers["x-authorization"], function(authResult) {
            if (authResult == null || authResult[0].user_id != user_id) {
                delete result[0].email;
            }
            res.status(200);
            res.json(result);
        });
    });
};

exports.create = async function (req, res) {
    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password
    };

    for (let item in user_data) {
        if (user_data[item] == null || user_data[item] == undefined) {
            res.status(400);
            res.json("Bad Request");
            return;
        };
    };

    const hash = crypto.createHash("sha256");
    hash.update(user_data["password"]);

    let values = [
        [user_data["username"].toString()],
        [user_data["email"].toString()],
        [user_data["givenName"].toString()],
        [user_data["familyName"].toString()],
        [hash.digest("hex")]
    ];

    User.insert(values, function(result) {
        if (result.code == "ER_DUP_ENTRY") {
            res.status(422);
            res.json("Unprocessable Entry");
            return;
        }
        res.status(201);
        res.json(result);
    })
};

exports.update = async function (req, res) {
    return null;
};

exports.login = async function (req, res) {
    let isUsernameLogin = false;
    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "password": req.body.password
    };

    if (user_data["password"] == undefined) {
        res.status(400);
        res.json("Bad Request");
        return;
    }

    let values = [];

    let token = uuidv1().replace(/-/g, "");

    values.push(token);

    if (user_data["email"] == undefined && user_data["username"] == undefined) {
        res.status(400);
        res.json("Bad Request");
        return;
    } else {
        if (user_data["email"] == undefined) {
            values.push([user_data["username"]])
            isUsernameLogin = true;
        } else {
            values.push([user_data["email"]])
        }
    }

    const hash = crypto.createHash("sha256");
    hash.update(user_data["password"]);

    values.push(hash.digest("hex"));

    console.log(values);

    if (isUsernameLogin) {
        User.getAuthUsername(values, function (result) {
            res.status(200);
            res.json(result);
            return;
        })
    } else {
        User.getAuthEmail(values, function (result) {
            res.status(200);
            res.json(result);
            return;
        });
    };
};

exports.logout = async function (req, res) {
    let token = req.headers["x-authorization"];
    User.removeAuth(token, function(result) {
        if (result == null || result == "") {
            res.status(401);
            res.json("Unauthorized");
            return;
        }
        res.status(200);
        res.json("OK");
    });
};