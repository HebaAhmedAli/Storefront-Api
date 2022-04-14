import supertest from 'supertest';
import app from '../../server';
import { User } from '../../types/user';
import client from '../../database';
import { Product } from '../../types/product';

const request = supertest(app);

describe('Testing products API', () => {
    const product: Product = {
        name: 'productT',
        price: 20,
        category: 'categoryT',
    };
    let authorizationToken: string;
    beforeAll(async () => {
        // Create a user and get its token to use it in test.
        const user: User = {
            username: 'nameT',
            firstname: 'firstT',
            lastname: 'lastT',
            password: 'passT',
        };
        const res = await request.post('/users').send(user);
        authorizationToken = res.body.token;
    });
    afterAll(async () => {
        const connection = await client.connect();
        const sql =
            'DELETE FROM users;\nALTER SEQUENCE users_id_seq RESTART WITH 1;\nDELETE FROM products;\nALTER SEQUENCE products_id_seq RESTART WITH 1';
        await connection.query(sql);
        connection.release();
    });
    describe('Testing the create api', () => {
        it('Should return 400 when missing name in body params.', async () => {
            const res = await request
                .post('/products')
                .set('Authorization', `Bearer ${authorizationToken}`)
                .send({
                    price: 20,
                    category: 'categoryT',
                });
            expect(res.status).toBe(400);
        });
        it('Should return 401 when missing Authorization header.', async () => {
            const res = await request.post('/products').send(product);
            expect(res.status).toBe(401);
        });
        it('Should return 200 when taking all products paramters.', async () => {
            const res = await request
                .post('/products')
                .set('Authorization', `Bearer ${authorizationToken}`)
                .send(product);
            product.id = res.body.id;
            expect(res.status).toBe(200);
        });
    });
    describe('Testing the index api', () => {
        it('Should return status 200 and an array of products of length 1.', async () => {
            const res = await request.get('/products');
            expect(res.status).toBe(200);
            expect((res.body as Product[]).length).toBe(1);
        });
    });
    describe('Testing the show api', () => {
        it('Should return status 200 and a product with same id provided in the url.', async () => {
            const res = await request.get(`/products/${product.id}`);
            expect(res.status).toBe(200);
            expect((res.body as Product).id).toBe(product.id);
        });
        it('Should return 404 if given id that not exist.', async () => {
            const res = await request.get(`/products/900`);
            expect(res.status).toBe(404);
        });
    });
});
