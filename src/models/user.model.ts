import client from '../database';
import { User } from '../types/user';
import bcrypt from 'bcrypt';

export class UserModel {
    async create(user: User): Promise<User> {
        try {
            const conn = await client.connect();
            const sql =
                'INSERT INTO users (username, firstname, lastname, password) VALUES($1, $2, $3, $4) RETURNING *';
            const hashedPassword = bcrypt.hashSync(
                user.password + process.env.BCRYPT_PASSWORD,
                parseInt(String(process.env.SALT_ROUNDS))
            );
            const result = await conn.query(sql, [
                user.username,
                user.firstname,
                user.lastname,
                hashedPassword,
            ]);
            const createdUser: User = result.rows[0];
            conn.release();
            return createdUser;
        } catch (err) {
            throw new Error(`Unable to create user (${user.username}): ${err}`);
        }
    }

    async authenticate(
        username: string,
        password: string
    ): Promise<User | null> {
        const conn = await client.connect();
        const sql = 'SELECT * FROM users WHERE username=($1)';
        const result = await conn.query(sql, [username]);
        conn.release();
        if (result.rows.length) {
            const returnedUser: User = result.rows[0];
            if (
                bcrypt.compareSync(
                    password + process.env.BCRYPT_PASSWORD,
                    returnedUser.password
                )
            ) {
                return returnedUser;
            }
        }
        return null;
    }

    async index(): Promise<User[]> {
        try {
            const conn = await client.connect();
            const sql = 'SELECT * FROM users';
            const result = await conn.query(sql);
            conn.release();
            return result.rows;
        } catch (error) {
            throw new Error(`Can't get users: ${error}`);
        }
    }

    async show(id: number): Promise<User> {
        try {
            const conn = await client.connect();
            const sql = 'SELECT * FROM users WHERE id=($1)';
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (error) {
            throw new Error(`Can't get user with id = ${id}: ${error}`);
        }
    }

    async update(user: User): Promise<User> {
        try {
            const conn = await client.connect();
            const sql =
                'UPDATE users SET username=($2), firstname=($3), lastname=($4), password=($5) WHERE id=($1) RETURNING *';
            const hashedPassword = bcrypt.hashSync(
                user.password + process.env.BCRYPT_PASSWORD,
                parseInt(String(process.env.SALT_ROUNDS))
            );
            const result = await conn.query(sql, [
                user.id,
                user.username,
                user.firstname,
                user.lastname,
                hashedPassword,
            ]);
            conn.release();
            return result.rows[0];
        } catch (error) {
            throw new Error(`Can't update user with id = ${user.id}: ${error}`);
        }
    }

    async delete(id: number): Promise<User> {
        try {
            const conn = await client.connect();
            const sql = 'DELETE FROM users WHERE id=($1) RETURNING *';
            const result = await conn.query(sql, [id]);
            conn.release();
            return result.rows[0];
        } catch (error) {
            throw new Error(`Can't delete user with id = ${id}: ${error}`);
        }
    }
}
