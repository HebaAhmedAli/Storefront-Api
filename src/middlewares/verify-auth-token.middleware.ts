import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../types/user';

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (authorizationHeader) {
            const bearer = authorizationHeader?.split(' ')[0].toLowerCase();
            const token = authorizationHeader?.split(' ')[1];
            if (!bearer || !token) {
                res.status(401);
                next('Invalid Authorization token.');
            }
            const decoded = jwt.verify(
                String(token),
                String(process.env.TOKEN_SECRET)
            );
            if (!decoded) {
                res.status(401);
                next('Invalid Authorization token.');
            }
            if (
                (req.url.includes('users') &&
                    req.method === 'DELETE' &&
                    req.params.id &&
                    +req.params.id !==
                        ((decoded as JwtPayload).user as User).id) ||
                (req.url.includes('users') &&
                    req.method === 'PUT' &&
                    req.body.id &&
                    +req.body.id !== ((decoded as JwtPayload).user as User).id)
            ) {
                res.status(401);
                next('You are unauthorized to update/delete this user.');
            }
            next();
        } else {
            res.status(401);
            next('Authorization header is required.');
        }
    } catch (err) {
        res.status(401);
        next(JSON.stringify(err));
    }
};

export default verifyAuthToken;
