import express from 'express';

const routes = express.Router();

routes.get('/', async (req: express.Request, res: express.Response) => {
    res.send('Welcome to my storefrnt backend...');
});

export default routes;
