# Storefront-Backend-Project

The backend is running on port 3000
The database is running on port 5432

To install packages:
- npm i

To create the database run the following:
- psql -U postgres
- CREATE DATABASE store;
- CREATE DATABASE store_test;

If you want to connect to the database:
- \c store

To Run the up migrations:
- npx db-migrate up

To build the code:
- npm run build

To build the code and run the server.ts:
- npm run dev

To build the code and run the server.js:
- npm run start

To build the code and run the tests:
- npm run test

To lint the code (with eslint and prettier) and fix it:
- npm run lint:f

To run the prettier alone:
- npm run format
