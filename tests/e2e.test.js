const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");

const BASE_API = "/api/";

let app;
let mongoDb;
let mongoUrl;

beforeAll(async () => {
    // Set up in-memory MongoDB instance
    mongoDb = await MongoMemoryServer.create();
    mongoUrl = mongoDb.getUri();

    // Connect to the in-memory MongoDB
    await mongoose.connect(mongoUrl);

    // Clean up the database before each test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }

    // Import your app after DB connection setup
    const { app: importedApp } = require("../managers/http/UserServer.manager");
    app = importedApp;
});

afterAll(async () => {
    // Disconnect mongoose and stop the MongoDB server
    await mongoose.disconnect();
    await mongoDb.stop();
});

describe("School Management System API Test", () => {
    describe("Test First Super Admin Creation", () => {
        const firstSuperAdminCreateURL = BASE_API + "user/createFirstSuperAdmin";

        it("should return status 400 Bad Request when request body is empty", async () => {
            await supertest(app).post(firstSuperAdminCreateURL).expect(400);
        });
    });
});
