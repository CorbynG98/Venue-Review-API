const venues = require('../controllers/venues.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/venues')
        .get(venues.getById)
        .post(venues.create);

    app.route(app.rootUrl + "/venues/:id")
        .get(venues.getOne)
        .patch(venues.update);

    app.route(app.rootUrl + "/categories")
        .get(venues.getCategories);
};