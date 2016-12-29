module.exports = function (app) {
    app.get('/partials/tickets/ticket-detail/:ticketID', function (req, res) {
        res.render('partials/tickets/ticket-detail');
    })
    app.get('/partials/*', function (req, res) {
        res.render('partials/' + req.params[0]);
    })
    app.get('/damn-it/', function (req, res) {
        res.render('utilities/error');
    })
    app.get('*', function (req, res) {
        res.render('index');
    });
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('utilities/error');
    });
}