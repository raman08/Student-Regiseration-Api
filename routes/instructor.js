const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');

const router = express.Router();

const Instructor = require('../models/instructor');
const instructorController = require('../controllers/instructor');

const { isAuth, fileFilter, fileStorage } = require('../middleware/utils');

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

router.post(
	'/task/new',
	isAuth,
	multer({ storage: fileStorage, fileFilter: fileFilter }).single(
		'taskImage'
	),
	instructorController.postCreateTask
);

router.get('/tasks/:userId/', isAuth, instructorController.getUserTasks);

router.get('/tasks/:userId/:taskId', isAuth, instructorController.getUserTask);

router.post(
	'/tasks/:userId/:taskId/rate',
	isAuth,
	instructorController.postRateTask
);

module.exports = router;
