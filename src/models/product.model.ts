import client from '../database';
import { Product } from '../types/product';

export class ProductModel {
    async create(product: Product): Promise<Product> {
        try {
            const conn = await client.connect();
            const sql =
                'INSERT INTO products (name, price, category) VALUES($1, $2, $3) RETURNING *';
            const result = await conn.query(sql, [
                product.name,
                product.price,
                product.category,
            ]);
            const createdProduct = result.rows[0];
            conn.release();
            return createdProduct;
        } catch (err) {
            throw new Error(
                `Unable to create product (${product.name}): ${err}`
            );
        }
    }

    async index(): Promise<Product[]> {
        try {
            const conn = await client.connect();
            const sql = 'SELECT * FROM products';
            const result = await conn.query(sql);
            conn.release();
            return result.rows;
        } catch (error) {
            throw new Error(`Can't get products: ${error}`);
        }
    }

    async show(id: number): Promise<Product> {
        try {
            const conn = await client.connect();
            const sql = 'SELECT * FROM products WHERE id=($1)';
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (error) {
            throw new Error(`Can't get product with id = ${id}: ${error}`);
        }
    }
}
