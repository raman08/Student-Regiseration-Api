const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	student: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'users',
	},
	tasks: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'tasks',
	},
});

module.exports = mongoose.model('Instructor', instructorSchema);
