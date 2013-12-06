exports.addAuthentication = function(app, db) {
    app.post('/login', function(req, res){
        var collection = db.collection('users');
        var params = {username: req.body.username};
        collection.findOne(params, function(e, result) {
            if (e) return next(e);
            if (!result) {
                res.status(401);
                res.send();
            } else {
                req.session.user = result;
                res.send(result);
            }
        });
    });

    app.get('/login', function(req, res) {
        if (req.session.user) {
            res.send(req.session.user);
        } else {
            res.status(401).send();
        }
    });

    app.post('/logout', function(req, res){
        delete req.session.user;
        res.status(204).send();
    });
}