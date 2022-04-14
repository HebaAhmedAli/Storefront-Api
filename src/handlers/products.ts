import express, { Request, Response } from 'express';
import verifyAuthToken from '../middlewares/verify-auth-token.middleware';
import { ProductModel } from '../models/product.model';
import { Product } from '../types/product';

const productModel = new ProductModel();

const create = async (req: Request, res: Response) => {
    if (!req.body.name) {
        res.status(400);
        return res.json('Parameter (name) is required.');
    }
    if (!req.body.price) {
        res.status(400);
        return res.json('Parameter (price) is required.');
    }
    if (!req.body.category) {
        res.status(400);
        return res.json('Parameter (category) is required.');
    }
    const product: Product = {
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
    };
    try {
        const createdProduct = await productModel.create(product);
        res.json(createdProduct);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const index = async (req: Request, res: Response) => {
    try {
        const products = await productModel.index();
        res.json(products);
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
        const product = await productModel.show(+req.params.id);
        if (!product) {
            res.status(404);
            return res.json(`There is no product with id = ${req.params.id}.`);
        }
        res.json(product);
    } catch (err) {
        res.status(500);
        res.json(JSON.stringify((err as Error).message));
    }
};

const productsRoutes = (app: express.Application) => {
    app.post('/products', verifyAuthToken, create);
    app.get('/products', index);
    app.get('/products/:id', show);
};

export default productsRoutes;
