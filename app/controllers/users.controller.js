const User = require("../models/users.model");
const authCheck = require("../Util/authCheck");
const crypto = require("crypto");
const fs = require("fs");
const Promise = require("bluebird");
const fileType = require("file-type");
var path = require('path');
const uuidv1 = require("uuid/v1");

exports.getById = async function (req, res) {
    let user_id = req.params.id;
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
    let user_id = req.params.id;
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
            if (user_data[value] == "") {
                res.status(400);
                res.json("Bad Request");
                return;
            }
            if (value == "password") {
                if (typeof user_data["password"] != "string") {
                    res.status(400);
                    res.json("Bad Request");
                    return;
                }
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

exports.getPhoto = function (req, res) {
    let user_id = req.params.id;
    User.getPhoto(user_id, function(result) {
        if (result == null || result[0] == undefined|| result[0].profile_photo_filename == null || result[0].profile_photo_filename == undefined) {
            res.status(404);
            res.json("Not Found");
            return;
        }
        let imageFile = "./storage/photos/" + result[0].profile_photo_filename;
        res.status(200);
        res.sendFile(path.resolve(imageFile));
        return;
    });
};

exports.uploadPhoto = async function (req, res) {
    Promise.promisifyAll(fs);
    let user_id = req.params.id;
    let image = req.body;
    let imageExt = fileType(image).ext;

    authCheck.checkUserAuth(req.headers["x-authorization"], async function(result) {
        if (result == null) {
            res.status(401);
            res.json("Unauthorized");
            return;
        } else if (result[0].user_id != user_id) {
            res.status(403);
            res.json("Forbidden");
            return;
        }
        let imageDIR = "./storage/";
        if (!await fs.existsSync(imageDIR)) {
            await fs.mkdirSync(imageDIR);
        }
        imageDIR += "photos/";
        if (!await fs.existsSync(imageDIR)) {
            await fs.mkdirSync(imageDIR);
        }
        let fileName = imageDIR + user_id + "dp." + imageExt;
        if (await fs.existsSync(fileName)) {
            res.status(200);
            res.json("OK");
        } else {
            res.status(201);
            res.json("Created");
        }

        fs.writeFile(fileName, image, "utf8", function (err) {
            if (err) {
                console.log(err);
            }
            let values = [
                [user_id + "dp." + imageExt],
                [user_id]
            ];
            User.uploadPhoto(values, function (result) {
                if (result == null) {
                    res.status(404);
                    res.json("Not Found");
                }
            });
        });
    });
};

exports.removePhoto = function (req, res) {
    let user_id = req.params.id;
    authCheck.checkUserAuth(req.headers["x-authorization"], function (authResult) {
        if (authResult == null) {
            res.status(401);
            res.json("Unauthorized");
            return;
        } else if (authResult[0].user_id != user_id) {
            res.status(403);
            res.json("Forbidden");
            return;
        }
        User.getPhoto(user_id, function (result) {
            if (result == null || result[0].profile_photo_filename == null || result[0].profile_photo_filename == undefined) {
                res.status(404);
                res.json("Not Found");
                return;
            }
            let imageFile = "./storage/photos/" + result[0].profile_photo_filename;
            fs.unlink(imageFile, function (err, data) {
                if (err) {
                    res.status(404);
                    res.json("Not Found");
                    return;
                }
                User.deletePhoto(user_id, function (result) {
                    res.status(200);
                    res.json("OK");
                    return;
                });
            });
        });
    });
};