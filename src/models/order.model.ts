import client from '../database';
import { Order } from '../types/order';

export class OrderModel {
    async addProductToOrder(
        quantity: number,
        orderId: string,
        productId: string
    ): Promise<Order> {
        try {
            const orderCheckSql = 'SELECT * FROM orders WHERE id=($1)';
            const conn = await client.connect();
            const result = await conn.query(orderCheckSql, [orderId]);
            const order = result.rows[0];
            if (order.status !== 'open') {
                throw new Error(
                    `Can't add product ${productId} to order ${orderId} because order status is ${order.status}`
                );
            }
            conn.release();
        } catch (err) {
            throw new Error(`${err}`);
        }
        try {
            const insertionSql =
                'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *';
            const conn = await client.connect();
            const result = await conn.query(insertionSql, [
                quantity,
                orderId,
                productId,
            ]);
            const order = result.rows[0];
            conn.release();
            return order;
        } catch (err) {
            throw new Error(
                `Can't add product ${productId} to order ${orderId}: ${err}`
            );
        }
    }
}
