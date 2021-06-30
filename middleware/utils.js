const jwt = require('jsonwebtoken');

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
