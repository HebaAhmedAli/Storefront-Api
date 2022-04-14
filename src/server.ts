import express from 'express';
import routes from './handlers/index';
import productsRoutes from './handlers/products';
import usersRoutes from './handlers/users';

const app = express();
const port = 3000;

app.use(express.json());

app.use(routes);
usersRoutes(app);
productsRoutes(app);

app.listen(port, (): void => {
    console.log('My storefront listens on port', port);
});

export default app;
