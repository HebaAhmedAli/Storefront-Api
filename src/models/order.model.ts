import client from '../database';
import { Order } from '../types/order';
import { OrderProduct } from '../types/order-product';

export class OrderModel {
    async create(order: Order): Promise<Order> {
        try {
            const conn = await client.connect();
            let sql =
                'INSERT INTO orders (status, user_id) VALUES($1, $2) RETURNING *';
            let result = await conn.query(sql, [order.status, order.userId]);
            const createdOrder: Order = result.rows[0];
            order.id = createdOrder.id;
            for (let i = 0; i < order.orderProducts.length; i++) {
                sql =
                    'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *';
                result = await conn.query(sql, [
                    order.orderProducts[i].quantity,
                    order.id,
                    order.orderProducts[i].productId,
                ]);
                const returnedOrderProduct: OrderProduct = result.rows[0];
                order.orderProducts[i] = returnedOrderProduct;
            }
            conn.release();
            return order;
        } catch (err) {
            throw new Error(`Unable to create the order: ${err}`);
        }
    }

    async addProductToOrder(orderProduct: OrderProduct): Promise<Order> {
        try {
            let sql = 'SELECT * FROM orders WHERE id=($1)';
            const conn = await client.connect();
            let result = await conn.query(sql, [orderProduct.orderId]);
            const order: Order = result.rows[0];
            if (!order) return order;
            if (order.status !== 'active') {
                throw new Error(
                    `Can't add product ${orderProduct.productId} to order ${orderProduct.orderId} because order status is ${order.status}`
                );
            }
            sql =
                'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3);';
            await conn.query(sql, [
                orderProduct.quantity,
                orderProduct.orderId,
                orderProduct.productId,
            ]);
            sql = 'SELECT * FROM order_products WHERE order_id=($1)';
            result = await conn.query(sql, [order.id]);
            order.orderProducts = result.rows;
            conn.release();
            return order;
        } catch (err) {
            throw new Error(
                `Can't add product ${orderProduct.productId} to order ${orderProduct.orderId}: ${err}`
            );
        }
    }

    async getCurrentOrderByUser(userId: number): Promise<Order> {
        try {
            let sql = 'SELECT * FROM orders WHERE user_id=($1)';
            const conn = await client.connect();
            let result = await conn.query(sql, [userId]);
            const order: Order = result.rows[0];
            if (order) {
                sql = 'SELECT * FROM order_products WHERE order_id=($1)';
                result = await conn.query(sql, [order.id]);
                order.orderProducts = result.rows;
            }
            conn.release();
            return order;
        } catch (err) {
            throw new Error(`${err}`);
        }
    }

    async updateOrderStatus(
        orderId: number,
        newStatus: string
    ): Promise<string> {
        try {
            const conn = await client.connect();
            const sql =
                'UPDATE orders SET status=($2) WHERE id=($1) RETURNING status';
            const result = await conn.query(sql, [orderId, newStatus]);
            conn.release();
            return result.rows[0]?.status;
        } catch (error) {
            throw new Error(
                `Can't update order with id = ${orderId}: ${error}`
            );
        }
    }
}
