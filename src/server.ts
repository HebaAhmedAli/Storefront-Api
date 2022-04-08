import express from 'express';
import routes from './routes/index';

const app = express();
const port = 3000;

app.use(routes);

app.listen(port, (): void => {
    console.log('My storefront listens on port', port);
});

export default app;
