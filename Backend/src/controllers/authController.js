const User = require('../models/User');

exports.login = async (req, res) => {
    try {
        const { userId, password, role } = req.body;

        // Find user
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or user not found' });
        }

        // Check if role matches if provided
        if (role && user.role !== role) {
            return res.status(401).json({ message: 'User role mismatch' });
        }

        // Simple password check (For demo purposes only!)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return user data (Level 1: No JWT, just sending user data back for localStorage)
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                userId: user.userId,
                role: user.role,
                fullName: user.basicDetails?.fullName
            }
        });
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.register = async (req, res) => {
    try {
        const { userId, password, role, fullName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        // Create new user
        const user = new User({
            userId,
            password: password || 'password123',
            role,
            basicDetails: {
                fullName
            }
        });

        await user.save();

        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                userId: user.userId,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error: ", error);
        res.status(500).json({ message: 'Internal server error while registering' });
    }
};
