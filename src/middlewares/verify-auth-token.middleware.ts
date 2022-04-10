import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (authorizationHeader) {
            const bearer = authorizationHeader?.split(' ')[0].toLowerCase();
            const token = authorizationHeader?.split(' ')[1];
            if (!bearer || !token) {
                res.status(401);
                next(new Error('Invalid Authorization token.'));
            }
            const decoded = jwt.verify(
                String(token),
                String(process.env.TOKEN_SECRET)
            );
            if (!decoded) {
                res.status(401);
                next(new Error('Invalid Authorization token.'));
            }
            next();
        } else {
            res.status(401);
            next(new Error('Authorization header is required.'));
        }
    } catch (err) {
        res.status(401);
        next(new Error(JSON.stringify(err)));
    }
};

export default verifyAuthToken;
