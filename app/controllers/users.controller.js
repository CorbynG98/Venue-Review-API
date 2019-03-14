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

        authCheck.checkUserAuth(req.headers["x-authorization"], function(authResult) {
            if (authResult == null || authResult[0].user_id != user_id) {
                delete result[0].email;
            }
            res.status(200);
            res.json(result[0]);
        });
    });
};

function testEmail(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

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

    if (!testEmail(user_data["email"])) {
        res.status(400);
        res.json("Bad Request");
        return;
    }

    if (user_data["password"].toString().trim() === "") {
        res.status(400);
        res.json("Bad Request");
        return;
    }

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
            res.status(400);
            res.json("Bad Request");
            return;
        }
        res.status(201);
        res.json(result[0]);
    })
};

exports.update = async function (req, res) {
    let user_id = req.params.user_id;
    let user_data = {
        "username": req.body.username,
        "email": req.body.email,
        "givenName": req.body.givenName,
        "familyName": req.body.familyName,
        "password": req.body.password
    };

    let queryPart = ""
    for (let value in user_data) {
        if (user_data[value] != undefined) {
            if (value == "password") {
                const hash = crypto.createHash("sha256");
                hash.update(user_data["password"]);
                queryPart += value + " = " + hash.digest("hex") + ", ";
            } else {
                queryPart += value + " = " + user_data[value] + ", ";
            };
        };
    };

    if (queryPart == "") {
        res.status(400);
        res.json("Bad Request");
        return;
    }

    queryPart = queryPart.substring(0, queryPart.length - 2);

    authCheck.checkUserAuth(req.headers["x-authorization"], function(authResult) {
        if (authResult == null) {
            res.status(401);
            res.json("Unauthorized");
            return;
        } else if (authResult[0].user_id != user_id) {
            res.status("403");
            res.json("Forbidden");
            return;
        }
        let values = [
            [queryPart],
            [user_id]
        ];
        User.alter(values, function(result) {
            if (result == null) {
                res.status(404);
                res.json("Not Found");
                return;
            }
            res.status(200);
            res.json("OK");
        });
    });
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
        if (user_data["username"] == undefined) {
            values.push([user_data["email"]]);
        } else {
            values.push([user_data["username"]]);
            isUsernameLogin = true;
        }
    }

    const hash = crypto.createHash("sha256");
    hash.update(user_data["password"]);

    values.push(hash.digest("hex"));

    if (isUsernameLogin) {
        User.getAuthUsername(values, function (result) {
            if (result.length < 1) {
                res.status(400);
                res.json("Bad Request");
                return;
            }
            res.status(200);
            res.json(result[0]);
            return;
        })
    } else {
        User.getAuthEmail(values, function (result) {
            if (result.length < 1) {
                res.status(400);
                res.json("Bad Request");
                return;
            }
            res.status(200);
            res.json(result[0]);
            return;
        });
    };
};

exports.logout = async function (req, res) {
    let token = req.headers["x-authorization"];
    if (token == undefined) {
        res.status(401);
        res.json("Unauthorized");
        return;
    }
    User.removeAuth(token, function(result) {
        if (result.affectedRows == 0) {
            res.status(401);
            res.json("Unauthorized");
            return;
        }
        res.status(200);
        res.json("OK");
    });
};