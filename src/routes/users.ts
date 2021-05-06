import express, { Router, Request, Response } from 'express';
import { check, validationResult, Result, ValidationError } from 'express-validator';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

// @route POST api/users
// @desc Register a new user
// @access Public
router.post(
    '/',
    [
        check('displayName', 'Display name is required').not().isEmpty(),
        check('email', 'Please include a valid email').not().isEmpty(),
        check('password', 'Please provide a password with 8 or more characters').isLength({ min: 8 }),
    ],
    async (req: Request, res: Response) => {
        console.log('POST api/users hit');
        const errors: Result<ValidationError> = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { displayName, email, password }: IUser = req.body;

        try {
            // See if user already exists in the database

            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'A user already exists with that email address' }] });
            }

            // Encrypt the password

            const salt: string = await bcrypt.genSalt(10);
            password = await bcrypt.hash(password, salt);

            // Create a new user

            const newUser: IUser = new User({
                displayName,
                email,
                password,
            });

            // Add the user to the database

            await newUser.save();

            // Return a jwt
            const payload = {
                user: {
                    id: newUser.id,
                },
            };

            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
                if (err) throw err;
                return res.json({ token });
            });
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

module.exports = router;
