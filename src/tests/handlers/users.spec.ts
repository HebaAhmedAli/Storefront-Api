import supertest from 'supertest';
import app from '../../server';
import { User } from '../../types/user';
import client from '../../database';

const request = supertest(app);

describe('Testing users API', () => {
    const user: User = {
        username: 'nameT',
        firstname: 'firstT',
        lastname: 'lastT',
        password: 'passT',
    };
    let authorizationToken: string;
    afterAll(async () => {
        const connection = await client.connect();
        const sql =
            'DELETE FROM users;\nALTER SEQUENCE users_id_seq RESTART WITH 1';
        await connection.query(sql);
        connection.release();
    });
    describe('Testing the create api', () => {
        it('Should return 400 when missing username in body params.', async () => {
            const res = await request.post('/users').send({
                firstname: 'firstT',
                lastname: 'lastT',
                password: 'passT',
            });
            expect(res.status).toBe(400);
        });
        it('Should return 200 when taking all user paramters.', async () => {
            const res = await request.post('/users').send(user);
            authorizationToken = res.body.token;
            user.id = res.body.id;
            expect(res.status).toBe(200);
        });
    });
    describe('Testing the authenticate api', () => {
        it('Should return 401 if the password is incorrect.', async () => {
            const res = await request.post('/users/authenticate').send({
                username: 'nameT',
                password: 'passTwrong',
            });
            expect(res.status).toBe(401);
        });
        it('Should return 200 and the user object with the generated token if the username and password are correct.', async () => {
            const res = await request.post('/users/authenticate').send({
                username: 'nameT',
                password: 'passT',
            });
            expect(res.body.token).toBeDefined();
            expect(res.status).toBe(200);
        });
    });
    describe('Testing the index api', () => {
        it('Should return status 200 and an array of users of length 1.', async () => {
            const res = await request
                .get('/users')
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toBe(200);
            expect((res.body as User[]).length).toBe(1);
        });
    });
    describe('Testing the show api', () => {
        it('Should return status 200 and a user with same id provided in the url.', async () => {
            const res = await request
                .get(`/users/${user.id}`)
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toBe(200);
            expect((res.body as User).id).toBe(user.id);
        });
        it('Should return 404 if given id that not exist.', async () => {
            const res = await request
                .get(`/users/900`)
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toBe(404);
        });
    });
    describe('Testing the update api', () => {
        it('Should return 401 if try to update another user with different id.', async () => {
            const newUser: User = {
                id: 999,
                username: 'nameTupdate',
                firstname: user.firstname,
                lastname: user.lastname,
                password: user.password,
            };
            const res = await request
                .put('/users')
                .send(newUser)
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toBe(401);
        });
        it('Should return 200 and the user with the new username when taking all user paramters and the valid id of the current user.', async () => {
            const newUser: User = {
                id: user.id,
                username: 'nameTupdate',
                firstname: user.firstname,
                lastname: user.lastname,
                password: user.password,
            };
            const res = await request
                .put('/users')
                .send(newUser)
                .set('Authorization', `Bearer ${authorizationToken}`);
            user.username = newUser.username;
            expect(res.status).toBe(200);
            expect((res.body as User).username).toBe('nameTupdate');
        });
    });
    describe('Testing the destroy api', () => {
        it('Should return 401 if try to delete another user with different id.', async () => {
            const res = await request
                .delete('/users/999')
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toBe(401);
        });
        it('Should return 200 if try to delete the current user.', async () => {
            const res = await request
                .delete(`/users/${user.id}`)
                .set('Authorization', `Bearer ${authorizationToken}`);
            expect(res.status).toBe(200);
        });
    });
});
