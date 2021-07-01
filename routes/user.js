const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');

const User = require('../models/user');

const router = express.Router();

const userController = require('../controllers/user');
const { isAuth, fileFilter } = require('../middleware/utils');

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

router.get('/tasks', isAuth, userController.getTasks);

router.get('/task/:num', isAuth, userController.getTask);

router.post(
	'/task/:num/upload',
	isAuth,
	multer({
		storage: multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, `homework/${req.userId}`);
			},
			filename: (req, file, cb) => {
				const url_title = req.params.num;
				cb(
					null,
					`Task_${req.userId}_${url_title}.${
						file.mimetype.split('/')[1]
					}`
				);
			},
		}),
		fileFilter: fileFilter,
	}).single('taskImage'),
	userController.updateTask
);

router.get('/tasks/graded', isAuth, userController.getGradedTasks);

module.exports = router;
