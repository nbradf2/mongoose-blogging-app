const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
	title: {type: String, required: true},
	// would this be required???
	author: {
		firstName: String, 
		lastName: String,
	},
	content: {type: String, required: true},
	// would this be a string???
	created: {type: String, required: true}
})

// virtual property called authorName that returns string value the API should return
blogPostSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim()
});

// instance method like apiRepr to return title, content, author [firstName, lastNAme]
blogPostSchema.methods.apiRepr = function() {
	return {
		id: this._id;
		title: this.title;
		content: this.content;
		author: this.authorName;
	};
}

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};