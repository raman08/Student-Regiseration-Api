const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');

const router = express.Router();

const userController = require('../controllers/user');
const { isAuth } = require('../middleware/utils');

router.post(
	'/login',
	body('email').isEmail().withMessage('Not a vaild Email!'),
	userController.postLogin
);

router.post(
	'/signup',

	body('email')
		.isEmail()
		.withMessage('Not a vaild Email!')
		.custom(async (value, { req }) => {
			const user = await User.findOne({ email: value });
			if (user) {
				throw new Error('A user with same email already exist');
			}
			return true;
		})
		.normalizeEmail(),

	body('cpassword').custom((value, { req }) => {
		if (value !== req.body.password) {
			throw new Error('Password Should Match');
		}
		return true;
	}),

	body('bootcamp')
		.trim()
		.custom((value, { req }) => {
			const value_lower = value.toLowerCase();
			console.log(value_lower);
			// if (
			// 	value_lower !== 'beginner' ||
			// 	value_lower !== 'intermediate' ||
			// 	value_lower !== 'advanced'
			// ) {
			// 	console.log(value_lower);
			// 	throw new Error(
			// 		'User can only choose beginner, intermediate or advance!'
			// 	);
			// }
			return true;
		}),

	userController.postSignup
);

module.exports = router;
