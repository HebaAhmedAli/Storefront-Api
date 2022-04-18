# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints

| Endpoint | Request | Parameters | Requires Token | Usage          |
| -------- | ------- | ---------- | -------------- | -------------- |
| **/**    | **GET** | **N/A**    | **False**      | **Root Route** |

#### Users:

| Endpoint                | Request    | Parameters                                           | Requires Token | Usage                 |
| ----------------------- | ---------- | ---------------------------------------------------- | -------------- | --------------------- |
| **/users**              | **GET**    | **N/A**                                              | **True**       | **List Users**        |
| **/users**              | **POST**   | **username, firstname, lastname, password**          | **False**      | **Create User**       |
| **/users**              | **PUT**    | **id, username, firstname, lastname, password**      | **True**       | **Update User**       |
| **/users/:id**          | **DELETE** | **id**                                               | **True**       | **Delete User**       |
| **/users/:id**          | **GET**    | **id**                                               | **True**       | **Show user by Id**   |
| **/users/authenticate** | **POST**   | **username, password**                               | **False**      | **Authenticate User** |

#### Products:

| Endpoint          | Request    | Parameters                    | Requires Token | Usage                  |
| ----------------- | ---------- | ----------------------------- | -------------- | ---------------------- |
| **/products**     | **GET**    | **N/A**                       | **False**      | **List products**      |
| **/products**     | **POST**   | **name, price, category**     | **True**       | **Create product**     |
| **/products/:id** | **GET**    | **id**                        | **False**      | **Show product by Id** |

#### Orders:

| Endpoint               | Request  | Parameters                                               | RequiresToken  | Usage                     |
| ---------------------- | -------- | -------------------------------------------------------- | -------------- | ------------------------  |
| **/orders**            | **POST** | **status, userId, orderProducts[{productId, quantity}]** | **True**       | **Create order**          |
| **/orders/:userId**    | **GET**  | **userId**                                               | **True**       | **Get order by user**     |
| **/orders/addProduct** | **POST** | **orderId, productId, quantity**                         | **True**       | **Add product to order**  |
| **/orders/status**     | **PUT**  | **orderId, newStatus**                                   | **True**       | **Update order status**  |


## Data Schema

### Products Schema

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price integer NOT NULL,
    category VARCHAR(50)
);
```

### Users Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    password VARCHAR NOT NULL
);
```

### Orders Schema

```sql
CREATE TABLE orders(
  id SERIAL PRIMARY KEY,
  status VARCHAR(50),
  user_id BIGINT REFERENCES users(id) NOT Null
);
```

### Order Products Schema

```sql
CREATE TABLE order_products(
  id SERIAL PRIMARY KEY,
  quantity INT,
  order_id BIGINT REFERENCES orders(id) NOT NULL,
  product_id BIGINT REFERENCES products(id) NOT NULL
  );
```

## Data Shapes

### User

```typescript
type User = {
    id?: number;
    username: string;
    firstname: string;
    lastname: string;
    password: string;
};
```

### Product

```typescript
type Product = {
    id?: number;
    name: string;
    price: number;
    category: string;
};
```

### Order

```typescript
type Order = {
    id?: number;
    status: string;
    userId: number;
    orderProducts: OrderProduct[];
};
```

### Order Product

```typescript
type OrderProduct = {
    id?: number;
    orderId?: number;
    productId: number;
    quantity: number;
};
```