import express, { Router, Request, Response } from 'express';
import auth from '../middleware/auth';
import { IUser } from '../models/User';
import { check, Result, ValidationError, validationResult } from 'express-validator';
import Test, { ItestData } from '../models/Test';

const router: Router = express.Router();

interface authRequest extends Request {
    user: IUser;
}

// @route GET api/test
// @desc Get a user's test data
// @access Private
router.get('/', auth, async (req: Request, res: Response) => {
    try {
        console.log('GET api/test hit');
        // TODO fix this as authRequest
        const test = await Test.findOne({ user: (req as authRequest).user._id });
        if (!test) {
            return res.status(404).json({ msg: 'Test data not found' });
        }
        return res.json(test);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

// @route POST api/test
// @desc Add some test data to a user
// @access Private
router.post('/', auth, check('testVar', 'testVar is required').not().isEmpty(), async (req: Request, res: Response) => {
    console.log('POST api/test hit');
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { testVar } = req.body;
    const id = (req as authRequest).user._id;
    const testData = { testVar };

    try {
        let foundTestData = await Test.findOne({ user: id });
        if (!foundTestData) {
            const newTestDataRecord: ItestData = new Test({ user: id, testData: [testData] });
            await newTestDataRecord.save();
            return res.status(200).send();
        } else {
            await Test.findOneAndUpdate({ user: id }, { $push: { testData: testData } });
            return res.status(200).send();
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Server error');
    }
});

module.exports = router;
