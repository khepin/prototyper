var config = {
    db: 'test',
    frontend: 'frontend',
    // If set to true, all records will have a creator field when they are
    // created by a user with a session
    save_creator: true
};

var express = require('express'),
    mongoskin = require('mongoskin');
    _ = require('lodash');
    Auth = require('./auth');

var app = express();

app.use(express.bodyParser());
app.use(express.static(config.frontend));
app.use(express.cookieParser('keyboard cat'));
app.use(express.session());
var db = mongoskin.db('localhost:27017/'+config.db, {safe:true});

app.param('collectionName', function(req, res, next, collectionName){
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/', function(req, res) {
    res.send('please select a collection, e.g., /api/messages');
});

Auth.addAuthentication(app, db);

app.get('/api/:collectionName', function(req, res) {
    var query = {};
    query.limit = req.query._max;
    query.skip = req.query._start;
    query.sort = [[req.query._sort, req.query._order || 'asc']];

    var match = {};
    var keys = _.keys(req.query);
    _.each(keys, function(key){
        if (key.charAt(0) !== '_') {
            match[key] = req.query[key];
        }
    });
    if (req.query.id) {
        delete match.id;
        match._id = req.collection.id(req.query._id);
    }

    req.collection.find(match, query).toArray(function(e, results){
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/api/:collectionName', function(req, res) {
    var document = req.body;
    if (config.save_creator && req.session.user && req.session.user._id) {
        document.creator_id = req.session.user._id;
    }
    document.created_at = Date.now();


    req.collection.insert(req.body, {}, function(e, results){
        if (e) return next(e);
        res.send(results);
    });
});

app.get('/api/:collectionName/:id', function(req, res) {
    req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e);
        res.send(result);
    });
});

app.put('/api/:collectionName/:id', function(req, res) {
    var document = req.body;
    delete document._id;
    document.updated_at = Date.now();

    req.collection.update({_id: req.collection.id(req.params.id)}, {$set:document}, {safe:true, multi:false}, function(e, result){
        if (e) return next(e);
        req.collection.findOne({_id: req.collection.id(req.params.id)}, function(e, result){
            if (e) return next(e);
            res.send(result);
        });
    });
});

app.del('/api/:collectionName/:id', function(req, res) {
    req.collection.remove({_id: req.collection.id(req.params.id)}, function(e, result){
        if (e) return next(e);
        if (result === 1) {
            res.status(204);
            res.send();
        } else {
            res.send({message: 'error'});
        }
    });
});

app.listen(3000);