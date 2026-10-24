
const usersDB = {
    users: require('../model/users.json'),
    setUser: function (data) {
        this.users = data;
    }
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fsPromises = require('fs').promises;
const path = require('path');

require('dotenv').config();

const handleLogin = async (req, res) => {
    try {
        const { user, pwd } = req.body;

        // Validate request body
        if (!user || !pwd) {
            return res.status(400).json({
                message: 'Username and password are required.'
            });
        }

        // Find user
        const foundUser = usersDB.users.find(
            person => person.username === user
        );

        if (!foundUser) {
            return res.sendStatus(401);
        }

        // Compare submitted password with stored bcrypt hash
        const match = await bcrypt.compare(pwd, foundUser.password);

        if (!match) {
            
            return res.sendStatus(401);
        }

        // Verify JWT secrets are configured
        const accessSecret = process.env.ACCESS_TOKEN_SECRET;
        const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

        if (!accessSecret || !refreshSecret) {
            console.error('JWT secrets are missing from .env');
            return res.status(500).json({
                message: 'Server authentication configuration error.'
            });
        }

        // Create tokens
        const accessToken = jwt.sign(
            { username: foundUser.username },
            accessSecret,
            { expiresIn: '60s' }
        );

        const refreshToken = jwt.sign(
            { username: foundUser.username },
            refreshSecret,
            { expiresIn: '1d' }
        );

        // Store refresh token in the correct users.json file
        const otherUsers = usersDB.users.filter(
            person => person.username !== foundUser.username
        );

        const currentUser = {
            ...foundUser,
            refreshToken
        };

        const updatedUsers = [...otherUsers, currentUser];

        const usersFile = path.join(
            __dirname,
            '..',
            'model',
            'users.json'
        );

        await fsPromises.writeFile(
            usersFile,
            JSON.stringify(updatedUsers, null, 2)
        );

        // Update in-memory users only after successful file write
        usersDB.setUser(updatedUsers);

        // Send refresh token as an HTTP-only cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Send access token to client
        return res.status(200).json({ accessToken });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            message: 'An internal server error occurred during login.'
        });
    }
};

module.exports = { handleLogin };

