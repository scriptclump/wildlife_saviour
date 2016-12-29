module.exports = function(app){
    app.use('/api/dashboard', require('../api/dashboard'));
    app.use('/api/team', require('../api/team'));
    app.use('/api/search', require('../api/search'));
    app.use('/api/user', require('../api/user'));
    app.use('/api/ticketsRelated', require('../api/ticketsRelated'));
    app.use('/api/roles', require('../api/roles'));
};