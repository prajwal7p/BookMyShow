const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
    try {
        const { name, email, password, role, securityQuestion, securityAnswer } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!name?.trim() || !normalizedEmail || !password) {
            return res.status(400).json({ msg: 'Name, email, and password are required' });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const hashedAnswer = securityAnswer
            ? await bcrypt.hash(securityAnswer.toLowerCase(), salt)
            : undefined;

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role || 'Customer',
            securityQuestion: securityQuestion?.trim(),
            securityAnswer: hashedAnswer
        });

        res.status(201).json({
            msg: 'User registered successfully',
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(`Registration error: ${err.message}`);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).json({ msg: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ msg: 'Email and password are required' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        if (user.status === 'Inactive') {
            return res.status(403).json({ msg: 'Account is deactivated' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        res.status(200).json({
            msg: 'Login successful',
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(`Login error: ${err.message}`);
        res.status(500).json({ msg: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -securityAnswer');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -securityAnswer');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ msg: 'Password changed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this email' });
        }

        if (!user.securityAnswer) {
            return res.status(404).json({ msg: 'No security question set for this account' });
        }

        const isMatch = await bcrypt.compare(
            securityAnswer.toLowerCase(),
            user.securityAnswer
        );
        if (!isMatch) {
            return res.status(400).json({ msg: 'Security answer is incorrect ' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ msg: 'Password reset successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

const getSecurityQuestion = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email }).select('securityQuestion');
        if (!user) {
            return res.status(404).json({ msg: 'No account found with this email' });
        }
        res.status(200).json({ securityQuestion: user.securityQuestion });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { register, login, getProfile, getAllUsers, changePassword, forgotPassword, getSecurityQuestion };
