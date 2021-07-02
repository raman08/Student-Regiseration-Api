const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const Instructor = require('../models/instructor');
const Tasks = require('../models/tasks');
const User = require('../models/user');

exports.postSignup = async (req, res, next) => {
	const { name, email, password, cpassword, bootcamp } = req.body;

	const errors = validationResult(req);

	const validateErrors = errors.array().map(error => {
		return { value: error.value, msg: error.msg };
	});

	if (!errors.isEmpty()) {
		return res.status(400).json({
			message: 'Error in the input fields',
			errors: validateErrors,
		});
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 12);

		const user = new Instructor({
			name: name,
			email: email,
			password: hashedPassword,
			bootcamp: bootcamp,
		});
		await user.save();

		return res.status(201).json({
			message: 'Instructor Created Sucessfully',
			user: { _id: user._id, name: user.name, email: user.email },
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
		return { value: error.value, msg: error.msg };
	});

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: validateErrors });
	}

	try {
		const user = await Instructor.findOne({ email: email });
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

exports.postCreateTask = async (req, res, next) => {
	const { title, bootcamp } = req.body;
	const taskImage = req.file;

	try {
		const task = new Tasks({
			title: title,
			createdBy: req.userId,
			image: `/${taskImage.path}`,
			bootcamp: bootcamp,
		});

		await task.save();

		const instructor = await Instructor.findById(req.userId);
		instructor.tasks.push(task._id);
		await instructor.save();

		const users = await User.find({ bootcamp: bootcamp });

		if (users.length > 0) {
			users.forEach(async user => {
				console.log(user);
				const taskLength = user.tasks.length + 1;
				user.tasks.push({
					_id: task._id,
					index: taskLength,
					title: task.title,
					image: task.image,
					done: false,
				});
				await user.save();
			});
		}

		res.json({
			message: 'Task created sucessfully!',
			task: {
				task: task.title,
				image: task.image,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
};

exports.getUserTasks = async (req, res, next) => {
	const userId = req.params.userId;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json('Invalid userId');
		}

		res.json({ name: user.name, tasks: user.tasks });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
};

exports.getUserTask = async (req, res, next) => {
	const userId = req.params.userId;
	const taskIndex = req.params.taskId;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json('Invalid userId');
		}

		const task = user.tasks.filter(task => task.index == taskIndex);

		res.json({ name: user.name, task: task });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
};

exports.postRateTask = async (req, res, next) => {
	const userId = req.params.userId;
	const taskIndex = req.params.taskId;
	const grade = req.body.grade;

	try {
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json('Invalid userId');
		}

		const task = user.tasks.filter(task => task.index == taskIndex)[0];

		console.log(task);
		task.checked = true;
		task.grade = grade;
		console.log(task);

		user.markModified('tasks');
		await user.save();

		res.json({ message: 'Task Graded', task: task });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: 'Something went wrong' });
	}
};
