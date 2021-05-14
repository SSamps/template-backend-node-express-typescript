import express, { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import User, { IcensoredUser, IUser } from '../models/User';
import { check, validationResult, Result, ValidationError } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

interface authRequest extends Request {
    user: IUser;
}

// @route GET api/auth
// @desc Get a user's info using a token
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        console.log('GET api/auth hit');
        return res.json((req as authRequest).user);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post(
    '/',
    [check('email', 'An email is required').not().isEmpty(), check('password', 'A password is required').exists()],
    async (req: Request, res: Response) => {
        console.log('POST api/auth hit');
        const errors: Result<ValidationError> = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { email, password }: IUser = req.body;

        try {
            // See if user exists in the database
            let foundUser = await User.findOne({ email });
            if (!foundUser) {
                return res.status(400).json({ errors: [{ msg: 'Your email or password is incorrect.' }] });
            }

            // Check if the password is correct
            const isMatch = await bcrypt.compare(password, foundUser.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Your email or password is incorrect.' }] });
            }

            // Return a jwt and a cut down user
            const payload = {
                user: {
                    id: foundUser.id,
                },
            };

            var user: IcensoredUser = {
                _id: foundUser._id,
                displayName: foundUser.displayName,
                email: foundUser.email,
                registrationDate: foundUser.registrationDate,
            };

            jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
                if (err) throw err;
                return res.json({ token, user });
            });
        } catch (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
    }
);

module.exports = router;
