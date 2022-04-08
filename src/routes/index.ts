import express from 'express';
import client from '../database';

const routes = express.Router();

routes.get('/', async (req: express.Request, res: express.Response) => {
    const connection = await client.connect(); // Create a new connection to the database
    const query = 'SELECT * FROM users'; // Create a query to select all students
    const results = await connection.query(query); // Execute the query
    connection.release(); // Release the connection
    res.send(results.rows); // Send the results
    // res.send('Welcome to my storefrnt backend...');
});

export default routes;
