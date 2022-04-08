import supertest from 'supertest';
import app from '../server';

const request = supertest(app);

describe('Testing the endpoints', (): void => {
    it('Using the main endpoint / returns 200', async () => {
        await request.get('/').expect(200);
    });
});
