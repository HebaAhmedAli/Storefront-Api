import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import verifyAuthToken from '../middlewares/verify-auth-token.middleware';
import { UserModel } from '../models/user.model';
import { User } from '../types/user';

const userModel = new UserModel();

const create = async (req: Request, res: Response) => {
    if (!req.body.username) {
        res.status(400);
        return res.json('Parameter (username) is required.');
    }
    if (!req.body.firstname) {
        res.status(400);
        return res.json('Parameter (firstname) is required.');
    }
    if (!req.body.lastname) {
        res.status(400);
        return res.json('Parameter (lastname) is required.');
    }
    if (!req.body.password) {
        res.status(400);
        return res.json('Parameter (password) is required.');
    }
    const user: User = {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
    };
    try {
        const createdUser = await userModel.create(user);
        const token = jwt.sign(
            { user: createdUser },
            String(process.env.TOKEN_SECRET)
        );
        res.json({ ...createdUser, token });
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const authenticate = async (req: Request, res: Response) => {
    if (!req.body.username) {
        res.status(400);
        return res.json('Parameter (username) is required.');
    }
    if (!req.body.password) {
        res.status(400);
        return res.json('Parameter (password) is required.');
    }
    try {
        const authenticatedUser = await userModel.authenticate(
            req.body.username,
            req.body.password
        );
        if (authenticatedUser) {
            const token = jwt.sign(
                { user: authenticatedUser },
                String(process.env.TOKEN_SECRET)
            );
            res.json({ ...authenticatedUser, token });
        } else {
            res.status(401);
            res.json('Incorrect username or password.');
        }
    } catch (err) {
        res.status(401);
        res.json(JSON.stringify((err as Error).message));
    }
};

const index = async (req: Request, res: Response) => {
    try {
        const users = await userModel.index();
        res.json(users);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const show = async (req: Request, res: Response) => {
    if (!req.params.id) {
        res.status(400);
        return res.json('Parameter (id) is required.');
    }
    try {
        const user = await userModel.show(+req.params.id);
        if (!user) {
            res.status(404);
            return res.json(`There is no user with id = ${req.params.id}.`);
        }
        res.json(user);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const update = async (req: Request, res: Response) => {
    if (!req.body.id) {
        res.status(400);
        return res.json('Parameter (id) is required.');
    }
    if (!req.body.username) {
        res.status(400);
        return res.json('Parameter (username) is required.');
    }
    if (!req.body.firstname) {
        res.status(400);
        return res.json('Parameter (firstname) is required.');
    }
    if (!req.body.lastname) {
        res.status(400);
        return res.json('Parameter (lastname) is required.');
    }
    if (!req.body.password) {
        res.status(400);
        return res.json('Parameter (password) is required.');
    }
    const user: User = {
        id: req.body.id,
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
    };
    try {
        const updatedUser = await userModel.update(user);
        if (!updatedUser) {
            res.status(404);
            return res.json(`There is no user with id = ${req.body.id}.`);
        }
        res.json(updatedUser);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const destroy = async (req: Request, res: Response) => {
    if (!req.params.id) {
        res.status(400);
        return res.json('Parameter (id) is required.');
    }
    try {
        const deletedUser = await userModel.delete(+req.params.id);
        if (!deletedUser) {
            res.status(404);
            return res.json(`There is no user with id = ${req.params.id}.`);
        }
        res.json(deletedUser);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const usersRoutes = (app: express.Application) => {
    app.post('/users', create);
    app.post('/users/authenticate', authenticate);
    app.get('/users', verifyAuthToken, index);
    app.get('/users/:id', verifyAuthToken, show);
    app.put('/users', verifyAuthToken, update);
    app.delete('/users/:id', verifyAuthToken, destroy);
};

export default usersRoutes;
