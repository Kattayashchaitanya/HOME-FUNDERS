const request = require('supertest');
const app = require('../main');
const User = require('../models/User');
const Loan = require('../models/Loan');
const mongoose = require('mongoose');

describe('Loan Tests', () => {
    let testUser;
    let testAdmin;
    let testLoan;
    let userToken;
    let adminToken;

    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGO_URI_TEST, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Create test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Test@123',
            phone: '1234567890',
            address: 'Test Address'
        });

        // Create test admin
        testAdmin = await User.create({
            name: 'Test Admin',
            email: 'admin@example.com',
            password: 'Admin@123',
            phone: '9876543210',
            address: 'Admin Address',
            isAdmin: true
        });

        // Create test loan
        testLoan = await Loan.create({
            user: testUser._id,
            type: 'urban',
            amount: 500000,
            tenure: 20,
            status: 'pending'
        });

        // Get tokens
        const userRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'Test@123'
            });
        userToken = userRes.body.token;

        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'Admin@123'
            });
        adminToken = adminRes.body.token;
    });

    afterAll(async () => {
        // Clean up test database
        await User.deleteMany({});
        await Loan.deleteMany({});
        await mongoose.connection.close();
    });

    describe('POST /api/loans', () => {
        it('should create a new loan application', async () => {
            const res = await request(app)
                .post('/api/loans')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    type: 'urban',
                    amount: 1000000,
                    tenure: 15,
                    purpose: 'Home Purchase',
                    propertyType: 'Apartment',
                    employmentType: 'Salaried',
                    monthlyIncome: 50000,
                    monthlyExpenses: 20000
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.type).toBe('urban');
        });

        it('should fail with invalid loan type', async () => {
            const res = await request(app)
                .post('/api/loans')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    type: 'invalid',
                    amount: 1000000,
                    tenure: 15
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/loans', () => {
        it('should get all loans for admin', async () => {
            const res = await request(app)
                .get('/api/loans')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should get user-specific loans', async () => {
            const res = await request(app)
                .get('/api/loans')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/loans/:id', () => {
        it('should get loan details', async () => {
            const res = await request(app)
                .get(`/api/loans/${testLoan._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(testLoan._id.toString());
        });

        it('should fail for unauthorized access', async () => {
            const res = await request(app)
                .get(`/api/loans/${testLoan._id}`)
                .set('Authorization', 'Bearer invalid-token');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/loans/:id/approve', () => {
        it('should approve loan as admin', async () => {
            const res = await request(app)
                .put(`/api/loans/${testLoan._id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    approvedAmount: 450000,
                    interestRate: 8.5,
                    comments: 'Approved with reduced amount'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('approved');
        });

        it('should fail for non-admin users', async () => {
            const res = await request(app)
                .put(`/api/loans/${testLoan._id}/approve`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });

    describe('PUT /api/loans/:id/reject', () => {
        it('should reject loan as admin', async () => {
            const res = await request(app)
                .put(`/api/loans/${testLoan._id}/reject`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    reason: 'Insufficient income'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('rejected');
        });

        it('should fail for non-admin users', async () => {
            const res = await request(app)
                .put(`/api/loans/${testLoan._id}/reject`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
        });
    });
}); 