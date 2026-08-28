const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const publicUser = (user) => {
	const result = user.toObject ? user.toObject() : { ...user };
	delete result.password;
	return result;
};

const registerUser = async (req, res) => {
	try {
		const { name, firstName, lastName, email, password, phone } = req.body;
		const splitName = (name || '').trim().split(/\s+/);
		const resolvedFirstName = (firstName || splitName[0] || '').trim();
		const resolvedLastName = (lastName || splitName.slice(1).join(' ') || '').trim();

		if (!resolvedFirstName || !resolvedLastName || !email || !password || !phone) {
			return res.status(400).json({ success: false, message: 'First name, last name, email, password, and phone are required' });
		}

		if (password.length < 6) {
			return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
		}

		const normalizedEmail = email.trim().toLowerCase();
		const existingUser = await User.findOne({ email: normalizedEmail });

		if (existingUser) {
			return res.status(409).json({ success: false, message: 'Email already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.create({
			firstName: resolvedFirstName,
			lastName: resolvedLastName,
			email: normalizedEmail,
			password: hashedPassword,
			phone: phone.trim(),
		});
		return res.status(201).json({ success: true, user: publicUser(user), token: generateToken(user) });
	} catch (error) {
		console.error('Registration error:', error);
		return res.status(500).json({ success: false, message: 'Unable to register user' });
	}
};

const loginUser = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email: (email || '').trim().toLowerCase() });
	if (!user || !(await bcrypt.compare(password || '', user.password))) {
		return res.status(401).json({ success: false, message: 'Invalid email or password' });
	}
	return res.json({ success: true, user: publicUser(user), token: generateToken(user) });
};

const getMe = (req, res) => res.json({ success: true, user: req.user });

module.exports = { registerUser, loginUser, getMe };
