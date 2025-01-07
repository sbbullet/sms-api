const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
const config = require("../config/index.config");
const ManagersLoader = require("../loaders/ManagersLoader");

const BASE_API = "/api/";

let app;
let mongoDb;
let mongoUrl;

beforeAll(async () => {
    mongoDb = await MongoMemoryServer.create();
    mongoUrl = mongoDb.getUri();
    await mongoose.connect(mongoUrl);

    // Clean up the database before each test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }

    // Setup config
    config.dotEnv.MONGO_URI = mongoUrl;
    config.dotEnv.LONG_TOKEN_SECRET = "long_token_secret";
    config.dotEnv.SHORT_TOKEN_SECRET = "short_token_secret";
    config.dotEnv.NACL_SECRET = "nacl_secret";

    const managersLoader = new ManagersLoader({ config });
    const managers = managersLoader.load();
    managers.userServer.run();
    app = managers.userServer.getApp();
});

afterAll(async () => {
    // Disconnect mongoose and stop the MongoDB server
    await mongoose.disconnect();
    await mongoDb.stop();
});

describe("School Management System API Test", () => {
    describe("Test First Super Admin Creation", () => {
        const firstSuperAdminCreateURL = BASE_API + "user/createFirstSuperAdmin";

        it("should return status 422 when request body is empty", async () => {
            await supertest(app).post(firstSuperAdminCreateURL).expect(422);
        });

        it("should return status 422 when request body has fields with no value", async () => {
            await supertest(app).post(firstSuperAdminCreateURL).send({ email: "", password: "" }).expect(422);
        });

        it("should return status 422 when request body has required fields but are invalid", async () => {
            await supertest(app)
                .post(firstSuperAdminCreateURL)
                .send({ email: "hello@gmail", password: "Passw0d" })
                .expect(422);
        });

        it("should return status 200 when request body has valid fields", async () => {
            await supertest(app)
                .post(firstSuperAdminCreateURL)
                .send({ email: "hello@gmail.com", password: "Passw0rd" })
                .expect(200);
        });

        it("should return status 409 if the first superadmin has already been created", async () => {
            await supertest(app)
                .post(firstSuperAdminCreateURL)
                .send({ email: "hello@gmail.com", password: "Passw0rd" })
                .expect(409);
        });
    });
});
