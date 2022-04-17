import { User } from '../../types/user';
import client from '../../database';
import { Product } from '../../types/product';
import { UserModel } from '../../models/user.model';
import { ProductModel } from '../../models/product.model';
import { OrderModel } from '../../models/order.model';
import { Order } from '../../types/order';

const userModel = new UserModel();
const productModel = new ProductModel();
const orderModel = new OrderModel();

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
    beforeAll(async () => {
        // Create a user to use it in test.
        const createdUser = await userModel.create(user);
        user.id = createdUser.id;
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
    describe('Test create method', () => {
        it('Should return the created order with its id and the id and quantity of each product in the order if given valid order data.', async () => {
            const createdOrder = await orderModel.create(order);
            order = createdOrder;
            expect(createdOrder).toBeDefined();
            expect(createdOrder.id).toBeDefined();
            expect(createdOrder.orderProducts.length).toBe(1);
            expect(createdOrder.orderProducts[0].quantity).toBe(2);
            expect(createdOrder.orderProducts[0].id).toBeDefined();
        });
    });
    describe('Test updateOrderStatus method', () => {
        it('Should return the new status = complete after updating the order.', async () => {
            const newStatus = await orderModel.updateOrderStatus(
                order.id as number,
                'complete'
            );
            order.status = newStatus;
            expect(newStatus).toBe('complete');
        });
    });
    describe('Test addProductToOrder method', () => {
        it('Should throw error if try to add product to order that is not active.', async () => {
            try {
                await orderModel.addProductToOrder({
                    productId: productToAdd.id as number,
                    quantity: 3,
                    orderId: order.id,
                });
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
        it('Should return the order after adding the product to it if given valid orderProduct data to be added to an active order.', async () => {
            const newStatus = await orderModel.updateOrderStatus(
                order.id as number,
                'active'
            );
            order.status = newStatus;
            const updatedOrder = await orderModel.addProductToOrder({
                productId: productToAdd.id as number,
                quantity: 3,
                orderId: order.id,
            });
            order = updatedOrder;
            expect(updatedOrder).toBeDefined();
            expect(updatedOrder.orderProducts.length).toBe(2);
            expect(updatedOrder.orderProducts[1].quantity).toBe(3);
            expect(updatedOrder.orderProducts[1].id).toBeDefined();
        });
    });
    describe('Test getCurrentOrderByUser method', () => {
        it('Should return the created order by the current user.', async () => {
            const returnedOrder = await orderModel.getCurrentOrderByUser(
                user.id as number
            );
            expect(returnedOrder).toBeDefined();
            expect(returnedOrder.id).toEqual(order.id);
            expect(returnedOrder.orderProducts.length).toEqual(
                order.orderProducts.length
            );
        });
    });
});
