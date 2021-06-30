const express = require('express');
const { body } = require('express-validator');
const Instructor = require('../models/instructor');

const router = express.Router();

const instructorController = require('../controllers/instructor');
const { isAuth } = require('../middleware/utils');

router.post(
	'/login',
	body('email').isEmail().withMessage('Not a vaild Email!'),
	instructorController.postLogin
);

router.post(
	'/signup',

	body('email')
		.isEmail()
		.withMessage('Not a vaild Email!')
		.custom(async (value, { req }) => {
			const user = await Instructor.findOne({ email: value });
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

	instructorController.postSignup
);

module.exports = router;
