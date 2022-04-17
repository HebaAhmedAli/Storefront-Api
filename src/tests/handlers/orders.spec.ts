import { User } from '../../types/user';
import client from '../../database';
import { Product } from '../../types/product';
import { ProductModel } from '../../models/product.model';
import { Order } from '../../types/order';
import supertest from 'supertest';
import app from '../../server';

const productModel = new ProductModel();
const request = supertest(app);

describe('Testing order model', () => {
    const user: User = {
        username: 'nameT',
        firstname: 'firstT',
        lastname: 'lastT',
        password: 'passT',
    };
    const product: Product = {
        name: 'productT',
        price: 20,
        category: 'categoryT',
    };
    const productToAdd: Product = {
        name: 'productToAdd',
        price: 10,
        category: 'categoryT',
    };
    let order: Order;
    let authorizationToken: string;
    beforeAll(async () => {
        // Create a user to use it in test.
        const res = await request.post('/users').send(user);
        user.id = res.body.id;
        authorizationToken = res.body.token;
        // Create a product to use it in test.
        const createdProduct = await productModel.create(product);
        product.id = createdProduct.id;
        const createdProductToAdd = await productModel.create(productToAdd);
        productToAdd.id = createdProductToAdd.id;
        order = {
            status: 'active',
            userId: user.id as number,
            orderProducts: [{ productId: product.id as number, quantity: 2 }],
        };
    });
    afterAll(async () => {
        const connection = await client.connect();
        const sql =
            'DELETE FROM order_products;\nALTER SEQUENCE order_products_id_seq RESTART WITH 1;\nDELETE FROM orders;\nALTER SEQUENCE orders_id_seq RESTART WITH 1;\nDELETE FROM users;\nALTER SEQUENCE users_id_seq RESTART WITH 1;\nDELETE FROM products;\nALTER SEQUENCE products_id_seq RESTART WITH 1';
        await connection.query(sql);
        connection.release();
    });
    describe('Testing the create api', () => {
        it('Should return 400 when missing orderProducts in body params.', async () => {
            const res = await request
                .post('/orders')
                .set('Authorization', `Bearer ${authorizationToken}`)
                .send({
                    status: order.status,
                    userId: order.userId,
                });
            expect(res.status).toBe(400);
        });
        it('Should return 401 when missing Authorization header.', async () => {
            const res = await request.post('/orders').send(order);
            expect(res.status).toBe(401);
        });
        it('Should return 401 when taking id of a user that is not the current user.', async () => {
            const res = await request
                .post('/orders')
                .send({ ...order, userId: 999 });
            expect(res.status).toBe(401);
        });
        it('Should return 200 when taking all order paramters.', async () => {
            const res = await request
                .post('/orders')
                .set('Authorization', `Bearer ${authorizationToken}`)
                .send(order);
            order = res.body;
            expect(res.status).toBe(200);
        });
    });
    describe('Test addProduct to order api', () => {
        it('Should return the order after adding the product to it if given valid orderProduct data to be added to an active order.', async () => {
            const res = await request
                .post('/orders/addProduct')
                .set('Authorization', `Bearer ${authorizationToken}`)
                .send({
                    productId: productToAdd.id as number,
                    quantity: 3,
                    orderId: order.id,
                });
            order = res.body;
            expect(order).toBeDefined();
            expect(order.orderProducts.length).toBe(2);
            expect(order.orderProducts[1].quantity).toBe(3);
            expect(order.orderProducts[1].id).toBeDefined();
        });
    });
    describe('Test update order status api', () => {
        it('Should return the new status = complete after updating the order.', async () => {
            const res = await request
                .put('/orders/status')
                .set('Authorization', `Bearer ${authorizationToken}`)
                .send({ orderId: order.id, newStatus: 'complete' });
            order.status = res.body;
            expect(res.body).toBe('complete');
        });
    });
    describe('Test get current order By user api', () => {
        it('Should return 401 if given user id either than the current user.', async () => {
            const res = await request
                .get(`/orders/999`)
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toEqual(401);
        });
        it('Should return the created order by the current user.', async () => {
            const res = await request
                .get(`/orders/${user.id}`)
                .set('Authorization', `Bearer ${authorizationToken}`);
            const returnedOrder = res.body;
            expect(returnedOrder).toBeDefined();
            expect(returnedOrder.id).toEqual(order.id);
            expect(returnedOrder.orderProducts.length).toEqual(
                order.orderProducts.length
            );
        });
    });
});
