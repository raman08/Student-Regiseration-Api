const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

app.use(bodyParser.json());

const userRoutes = require('./routes/user');
const instructorRoutes = require('./routes/instructor');

app.use('/api/user', userRoutes);
app.use('/api/instructor', instructorRoutes);

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(
		app.listen(3000, () => {
			console.log('App started at http://localhost:3000');
		})
	)
	.catch(err => {
		console.log(err);
	});
