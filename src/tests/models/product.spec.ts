import client from '../../database';
import { ProductModel } from '../../models/product.model';
import { Product } from '../../types/product';

const productModel = new ProductModel();

describe('Testing product Model', () => {
    const product: Product = {
        name: 'productT',
        price: 20,
        category: 'categoryT',
    };
    afterAll(async () => {
        const connection = await client.connect();
        const sql =
            'DELETE FROM products;\nALTER SEQUENCE products_id_seq RESTART WITH 1';
        await connection.query(sql);
        connection.release();
    });
    describe('Test create method', () => {
        it('Should return the created product with its id if given valid product data.', async () => {
            const createdProduct = await productModel.create(product);
            product.id = createdProduct.id;
            expect(createdProduct).toBeDefined();
            expect(createdProduct.id).toBeDefined();
        });
    });
    describe('Test index method', () => {
        it('Should return list of all products of length one.', async () => {
            const products = await productModel.index();
            expect(products.length).toEqual(1);
        });
    });
    describe('Test show method', () => {
        it('Should return the product data when given the product id.', async () => {
            const returnedProduct = await productModel.show(
                product.id as number
            );
            expect(returnedProduct.name).toEqual(product.name);
            expect(returnedProduct.price).toEqual(product.price);
            expect(returnedProduct.category).toEqual(product.category);
        });
    });
});
