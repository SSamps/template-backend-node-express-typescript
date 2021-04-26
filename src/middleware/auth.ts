import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'Unauthorized' });
    }

    interface authRequest extends Request {
        user: IUser;
    }

    interface IToken {
        alg: string;
        typ: string;
        user: { id: string };
        iat: number;
        exp: number;
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as IToken;

        // Check whether the token was issued before oldestValidJWT was last set. This could be used to invalidate user tokens if required. Also protects against tokens being used after user deletion.
        try {
            var user = await User.findById(decoded.user.id).select('-password');
        } catch (err) {
            return res.status(500).json({ msg: 'Server Error' });
        }

        if (!user) {
            console.error('Token decoded for user ' + decoded.user.id + ' but found no oldestValidJWT');
            return res.status(404).json({ msg: 'User not found' });
        }

        const oldestValidJWT = user.oldestValidJWT;
        // Add one second to iat as it is rounded down to the nearest second when set while oldestValidJWT was not
        const tokenDate = new Date((decoded.iat + 1) * 1000);

        if (tokenDate < (oldestValidJWT as Date)) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        user.oldestValidJWT = undefined;
        (req as authRequest).user = user;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(401).json({ msg: 'Unauthorized' });
    }
}

export default authMiddleware;
