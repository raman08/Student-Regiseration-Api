const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const tasks = require('../models/tasks');

exports.postSignup = async (req, res, next) => {
	const { name, email, password, cpassword, bootcamp } = req.body;

	const errors = validationResult(req);

	const validateErrors = errors.array().map(error => {
		return { value: error.value, msg: error.msg };
	});

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: validateErrors });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 12);

		const user = new User({
			name: name,
			email: email,
			password: hashedPassword,
			bootcamp: bootcamp,
		});
		await user.save();

		return res.status(201).json({
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				bootcamp: user.bootcamp,
			},
		});
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.postLogin = async (req, res, next) => {
	const { email, password } = req.body;

	const errors = validationResult(req);

	const validateErrors = errors.array().map(error => {
		return {
			value: error.value,
			msg: error.msg,
		};
	});

	if (!errors.isEmpty()) {
		return res.status(400).json({
			message: 'The enter value id not correct',
			errors: validateErrors,
		});
	}

	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(401).json({ error: 'No User Found' });
		}

		const isEqual = await bcrypt.compare(password, user.password);

		if (!isEqual) {
			return res.status(401).json({ error: 'Invaild Passsword' });
		}

		const token = jwt.sign(
			{
				email: user.email,
				id: user._id,
			},
			'This is a seceret',
			{ expiresIn: '1h' }
		);

		res.status(200).json({
			message: 'User Authenticated',
			userId: user._id,
			token: token,
		});
	} catch (err) {
		console.log(err);
	}
};

exports.getTasks = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId);

		const tasks = user.tasks;

		res.status(200).json(tasks);
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something Wend Wrong' });
	}
};

exports.getTask = async (req, res, next) => {
	const num = req.params.num;
	console.log(num);

	if (num <= 0) {
		return res.status(404).status('Invalid Task');
	}

	try {
		const user = await User.findById(req.userId);

		const tasks = user.tasks;

		if (num > tasks.length) {
			return res
				.status(404)
				.json({ message: "You don't have this many task" });
		}
		res.status(200).json(tasks.filter(task => task.index == num));
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something Wend Wrong' });
	}
};

exports.updateTask = async (req, res, next) => {
	const num = req.params.num;
	const taskImage = req.file;

	if (num <= 0) {
		res.status(404).status('Invalid Task');
	}

	if (!taskImage) {
		res.status(404).json({ message: 'No image found.' });
	}

	const user = await User.findById(req.userId);

	if (num >= user.tasks.length) {
		res.status(404).json({ message: "You don't have this many task" });
	}

	let task = user.tasks[num];

	task.editedImage = `/${taskImage.path}`;
	task.done = true;

	user.markModified('tasks');

	await user.save();

	res.json({ message: 'Task updated', task: task });
};

exports.getGradedTasks = async (req, res, next) => {
	const user = await User.findById(req.userId);

	const gradedTasks = user.tasks.filter(task => task.checked);

	res.json(gradedTasks);
};
