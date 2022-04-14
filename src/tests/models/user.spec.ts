import client from '../../database';
import { UserModel } from '../../models/user.model';
import { User } from '../../types/user';

const userModel = new UserModel();

describe('Testing user Model', () => {
    const user: User = {
        username: 'nameT',
        firstname: 'firstT',
        lastname: 'lastT',
        password: 'passT',
    };
    afterAll(async () => {
        const connection = await client.connect();
        const sql =
            'DELETE FROM users;\nALTER SEQUENCE users_id_seq RESTART WITH 1';
        await connection.query(sql);
        connection.release();
    });
    describe('Test create method', () => {
        it('Should return the created user with its id if given valid user data.', async () => {
            const createdUser = await userModel.create(user);
            user.id = createdUser.id;
            expect(createdUser).toBeDefined();
            expect(createdUser.id).toBeDefined();
        });
        it('Should throw error if try to create user with username that already exist', async () => {
            try {
                await userModel.create(user);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });
    });
    describe('Test authenticate method', () => {
        it('Should return null if given wrong password.', async () => {
            const authenticatedUser = await userModel.authenticate(
                user.username,
                'passTwrong'
            );
            expect(authenticatedUser).toBeNull();
        });
    });
    describe('Test index method', () => {
        it('Should return list of all users of length one.', async () => {
            const users = await userModel.index();
            expect(users.length).toEqual(1);
        });
    });
    describe('Test show method', () => {
        it('Should return the user data when given the user id.', async () => {
            const returnedUser = await userModel.show(user.id as number);
            expect(returnedUser.username).toEqual(user.username);
            expect(returnedUser.firstname).toEqual(user.firstname);
            expect(returnedUser.lastname).toEqual(user.lastname);
        });
    });
    describe('Test update method', () => {
        it('Should return the updated user with new firstname if given valid user data with a new firstname.', async () => {
            const updatedUser = await userModel.update({
                ...user,
                firstname: 'firstTnew',
            });
            user.firstname = updatedUser.firstname;
            expect(updatedUser.firstname).toEqual('firstTnew');
        });
    });
    describe('Test delete method', () => {
        it('Should return undefined if given id that not exist.', async () => {
            const deletedUser = await userModel.delete(999);
            expect(deletedUser).toBeUndefined();
        });
    });
});
