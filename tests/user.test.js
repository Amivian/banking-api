const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/user');

beforeAll(async () => {
    await mongoose.connection.dropDatabase();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('User API', () => {
    let userOne, userTwo;
    let userOneToken, userTwoToken;

    beforeEach(async () => {
        await User.deleteMany({});
        
        userOne = {
            email: 'test1@example.com',
            password: 'password123'
        };
        userTwo = {
            email: 'test2@example.com',
            password: 'password456'
        };

        // Register user one
        const res1 = await request(app).post('/api/v1/users/register').send(userOne);
        userOne.id = res1.body.user._id;
        userOneToken = res1.body.token;

        // Register user two
        const res2 = await request(app).post('/api/v1/users/register').send(userTwo);
        userTwo.id = res2.body.user._id;
        userTwoToken = res2.body.token;
    });

    // Test for user registration
    test('Should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/users/register')
            .send({
                email: 'newuser@example.com',
                password: 'password'
            })
            .expect(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');
        const user = await User.findById(res.body.user._id);
        expect(user).not.toBeNull();
    });

    // Test for user login
    test('Should login a user', async () => {
        const res = await request(app)
            .post('/api/v1/users/login')
            .send(userOne)
            .expect(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body).toHaveProperty('token');
    });

    // Test for funding an account
    test('Should fund a user account', async () => {
        const amount = 100;
        const res = await request(app)
            .post('/api/v1/accounts/fund')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ amount })
            .expect(200);
        expect(res.body.user.balance).toBe(amount);
        const userInDb = await User.findById(userOne.id);
        expect(userInDb.balance).toBe(amount);
    });

    // Test for a successful transfer
    test('Should transfer funds from one user to another', async () => {
        // First, fund user one
        await request(app)
            .post('/api/v1/accounts/fund')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ amount: 200 })
            .expect(200);

        // Then, perform the transfer
        const transferAmount = 50;
        const res = await request(app)
            .post('/api/v1/accounts/transfer')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ recipientEmail: userTwo.email, amount: transferAmount })
            .expect(200);

        const senderInDb = await User.findById(userOne.id);
        const receiverInDb = await User.findById(userTwo.id);

        expect(senderInDb.balance).toBe(150); // 200 - 50
        expect(receiverInDb.balance).toBe(50); // 0 + 50
    });

    // Test for insufficient balance during transfer
    test('Should not transfer funds if balance is insufficient', async () => {
        const res = await request(app)
            .post('/api/v1/accounts/transfer')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ recipientEmail: userTwo.email, amount: 100 })
            .expect(400);
        expect(res.body.error).toBe('Insufficient balance.');
    });

    // Test for withdrawal
    test('Should withdraw funds from an account', async () => {
        // First, fund the account
        await request(app)
            .post('/api/v1/accounts/fund')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ amount: 100 })
            .expect(200);

        // Then, withdraw
        const withdrawAmount = 30;
        const res = await request(app)
            .post('/api/v1/accounts/withdraw')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ amount: withdrawAmount })
            .expect(200);

        const userInDb = await User.findById(userOne.id);
        expect(userInDb.balance).toBe(70); // 100 - 30
    });
});
