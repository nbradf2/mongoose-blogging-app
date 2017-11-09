const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.promise;

// include config.js

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

const app = express();
app.use(bodyParser.json());

// GET request to return blog posts - 10 at a time
app.get('/posts', (req, res) => {
	BlogPost
		.find()
		.limit(10)
		// call dataset 'posts'
		.then(posts => {
			res.status(200).json({
				posts: posts.map(
					(post) => post.apiRepr())
			});
		})
		.catch(
			err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'})
			});
});

// GET request to get posts by ID
app.get('/posts/:id', (req, res) => {
	BlogPost
	.findById(req.params.id)
	.then(post => res.status(200).json(post.apiRepr()))
	.catch(err => {
		console.error(err);
			res.status(500).json({message: 'Internal server error'})
	});
});

// POST to create new post
app.post('/posts', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if(!(field in req.body)) {
			const message = `Missing ${field} in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}

	BlogPost
		.create({
			title: req.body.title,
			content: req.body.content,
			author: req.body.author})
		.then(
			post => res.status(201).json(restaurant.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

// PUT to update posts
app.put('/posts/:id', (req, res) => {
	// make sure id in request and id in body match
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id ${req.params.id} and request body id ${req.body.id} must match`);
		console.error(message);
		return res.status(400).json({message: message});
	}

	// to only support a subset of fields being updateable
	const toUpdate = {};
	const updateableFields = ['title', 'content', 'author'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	BlogPost
		// all key/value pairs in toUpdate will be updated via $set
		.findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.then(post => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

// DELETE to delete posts

app.delete('/posts/:id', (req, res) => {
	BlogPost
		.findByIdAndRemove(req.params.id)
		.then(post => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
	res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err > {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

// close the server and return a promise

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};