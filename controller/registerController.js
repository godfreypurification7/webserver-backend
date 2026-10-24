
const usersDB = {
    users: require('../model/users.json'),
    setUser(data) {
        this.users = data;
    }
};

const path = require('path');
const fsPromises = require('fs').promises;
const bcrypt = require('bcrypt');

const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body || {};

    // Validate the request body
    if (
        typeof user !== 'string' ||
        typeof pwd !== 'string' ||
        !user.trim() ||
        !pwd
    ) {
        return res.status(400).json({
            message: 'Username and password are required.'
        });
    }

    const username = user.trim();

    // Check whether the username already exists
    const duplicate = usersDB.users.find(
        person =>
            person.username.toLowerCase() ===
            username.toLowerCase()
    );

    if (duplicate) {
        return res.status(409).json({
            message: 'Username already exists.'
        });
    }

    try {
        // Hash the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        const newUser = {
            "username": user,
            "roles":{"User": 2001},
            "password": hashedPwd
        };

        const updatedUsers = [...usersDB.users, newUser];

        // Save users to the JSON file
        await fsPromises.writeFile(
            path.join(__dirname, '..', 'model', 'users.json'),
            JSON.stringify(updatedUsers, null, 2),
            'utf8'
        );

        // Update the in-memory database
        usersDB.setUser(updatedUsers);

        return res.status(201).json({
            success: `New user ${username} created.`
        });
    } catch (err) {
        console.error('Registration error:', err);

        return res.status(500).json({
            message: 'Failed to register user.'
        });
    }
};

module.exports = { handleNewUser };
