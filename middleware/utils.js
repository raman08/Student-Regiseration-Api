const jwt = require('jsonwebtoken');
const multer = require('multer');

exports.isAuth = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (token == null) {
		req.isAuth = false;
		return res.status(401).json({ message: 'No auth token' });
	}

	let decodedToken;
	try {
		decodedToken = jwt.verify(token, 'This is a seceret');
	} catch (err) {
		req.isAuth = false;
		return res.status(403).json({ message: 'Token not valid' });
	}

	if (!decodedToken) {
		req.isAuth = false;
		return res.status(403).json({ message: 'Token not valid' });
	}

	req.isAuth = true;
	req.userId = decodedToken.id;
	next();
};

exports.fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `tasks/${req.body.bootcamp}`);
	},
	filename: (req, file, cb) => {
		const url_title = req.body.title.replace(/ /g, '_');
		cb(null, `Task_${url_title}.${file.mimetype.split('/')[1]}`);
	},
});

exports.fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};
