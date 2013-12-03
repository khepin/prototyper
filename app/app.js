var express = require('express'),
    mongoskin = require('mongoskin');
    _ = require('lodash');

var app = express();

app.use(express.bodyParser());
app.use(express.static('frontend'));
app.use(express.cookieParser('keyboard cat'));
app.use(express.session());
var db = mongoskin.db('localhost:27017/test', {safe:true});

app.param('collectionName', function(req, res, next, collectionName){
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/', function(req, res) {
    res.send('please select a collection, e.g., /api/messages');
});

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

app.get('/api/:collectionName', function(req, res) {
    var query = {};
    query.limit = req.query['_max'];
    query.skip = req.query['_start'];
    var match = {};
    var keys = _.keys(req.query);
    _.each(keys, function(key){
        if (key.charAt(0) !== '_') {
            match[key] = req.query[key];
        }
    });
    if (req.query._id) {
        match._id = req.collection.id(req.query._id);
    }

    req.collection.find(match, query).toArray(function(e, results){
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/api/:collectionName', function(req, res) {
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
    var object = req.body;
    delete object._id;
    req.collection.update({_id: req.collection.id(req.params.id)}, {$set:req.body}, {safe:true, multi:false}, function(e, result){
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