const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');

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

		return res.status(201).json({ user: user });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Something Went Wrong' });
	}
};

exports.postLogin = async (req, res, next) => {
	const { email, password } = req.body;
	console.log(email, password);
	const errors = validationResult(req);

	const validateErrors = errors.array().map(error => {
		return { value: error.value, msg: error.msg };
	});

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: validateErrors });
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
