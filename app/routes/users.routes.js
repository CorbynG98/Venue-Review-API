const user = require('../controllers/users.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id')
        .get(user.getById)
        .patch(user.update);

    app.route(app.rootUrl + "/users")
        .post(user.create);

    app.route(app.rootUrl + "/users/login")
        .post(user.login);

    app.route(app.rootUrl + "/users/logout")
        .post(user.logout);

    app.route(app.rootUrl + "/users/:id/photos")
        .get(user.getPhoto)
        .put(user.uploadPhoto)
        .delete(user.removePhoto);
};