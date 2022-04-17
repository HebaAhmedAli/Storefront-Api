import express, { Request, Response } from 'express';
import verifyAuthToken from '../middlewares/verify-auth-token.middleware';
import { OrderModel } from '../models/order.model';
import { Order } from '../types/order';
import { OrderProduct } from '../types/order-product';

const ordertModel = new OrderModel();

const create = async (req: Request, res: Response) => {
    if (!req.body.status) {
        res.status(400);
        return res.json('Parameter (status) is required.');
    }
    if (!req.body.userId) {
        res.status(400);
        return res.json('Parameter (userId) is required.');
    }
    if (
        !req.body.orderProducts ||
        req.body.orderProducts.length === 0 ||
        req.body.orderProducts.some(
            (orderProduct: OrderProduct) =>
                !orderProduct.productId || !orderProduct.quantity
        )
    ) {
        res.status(400);
        return res.json(
            'Parameter (orderProducts) is required and must contain at least one product with (productId, quantity).'
        );
    }
    const order: Order = req.body;
    try {
        const createdOrder = await ordertModel.create(order);
        res.json(createdOrder);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const getCurrentOrderByUser = async (req: Request, res: Response) => {
    if (!req.params.userId) {
        res.status(400);
        return res.json('Parameter (userId) is required.');
    }
    try {
        const order = await ordertModel.getCurrentOrderByUser(
            +req.params.userId
        );
        if (!order) {
            res.status(404);
            return res.json(
                `There is no order by user with id = ${req.params.userId}.`
            );
        }
        res.json(order);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const updateOrderStatus = async (req: Request, res: Response) => {
    if (!req.body.orderId) {
        res.status(400);
        return res.json('Parameter (orderId) is required.');
    }
    if (!req.body.newStatus) {
        res.status(400);
        return res.json('Parameter (newStatus) is required.');
    }
    try {
        const status = await ordertModel.updateOrderStatus(
            +req.body.orderId,
            req.body.newStatus
        );
        if (!status) {
            res.status(404);
            return res.json(`There is no order with id = ${req.body.orderId}.`);
        }
        res.json(status);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const addProductToOrder = async (req: Request, res: Response) => {
    if (!req.body.orderId) {
        res.status(400);
        return res.json('Parameter (orderId) is required.');
    }
    if (!req.body.productId) {
        res.status(400);
        return res.json('Parameter (productId) is required.');
    }
    if (!req.body.quantity) {
        res.status(400);
        return res.json('Parameter (quantity) is required.');
    }
    try {
        const order = await ordertModel.addProductToOrder(req.body);
        if (!order) {
            res.status(404);
            return res.json(`There is no order with id = ${req.body.orderId}.`);
        }
        res.json(order);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const ordersRoutes = (app: express.Application) => {
    app.post('/orders', verifyAuthToken, create);
    app.post('/orders/addProduct', verifyAuthToken, addProductToOrder);
    app.get('/orders/:userId', verifyAuthToken, getCurrentOrderByUser);
    app.put('/orders/status', verifyAuthToken, updateOrderStatus);
};

export default ordersRoutes;
