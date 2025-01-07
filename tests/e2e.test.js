const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const supertest = require("supertest");
const config = require("../config/index.config");
const ManagersLoader = require("../loaders/ManagersLoader");

const BASE_API = "/api/";

let app;
let mongoDb;
let mongoUrl;

const API_PATHS = {
    CREATE_FIRST_SUPER_ADMIN: BASE_API + "user/createFirstSuperAdmin",
    USER_LOGIN: BASE_API + "user/login",
    CREATE_USER: BASE_API + "user/createUser",
    GET_ALL_USERS: BASE_API + "user/getAllUsers",
    UPDATE_USER_ROLE: BASE_API + "user/updateUserRole",
    DELETE_USER: BASE_API + "user/deleteUser",

    CREATE_SCHOOL: BASE_API + "school/createSchool",
    GET_ALL_SCHOOLS: BASE_API + "school/getAllSchools",
    UPDATE_SCHOOL: BASE_API + "school/updateSchool/:schoolId",
    DELETE_SCHOOL: BASE_API + "school/deleteSchool/:schoolId",

    SET_USER_AS_SCHOOL_ADMIN: BASE_API + "user/setUserAsSchoolAdmin/:userId",
    UNSET_USER_AS_SCHOOL_ADMIN: BASE_API + "user/unsetUserAsSchoolAdmin/:userId",

    CREATE_CLASSROOM: BASE_API + "classroom/createClassroom",
    UPDATE_CLASSROOM: BASE_API + "classroom/updateClassroom/:classroomId",
    DELETE_CLASSROOM: BASE_API + "classroom/deleteClassroom/:classroomId",
    GET_ALL_CLASSROOMS_OF_SCHOOL: BASE_API + "classroom/getAllClassrooms/:schoolId",

    CREATE_STUDENT: BASE_API + "student/createStudent",
    UPDATE_STUDENT: BASE_API + "student/updateStudent/:studentId",
    DELETE_STUDENT: BASE_API + "student/deleteStudent/:studentId",
    GET_ALL_STUDENTS_OF_SCHOOL: BASE_API + "student/getAllStudents/:schoolId",
    GET_ALL_CLASSROOMS_OF_CLASSROOM: BASE_API + "student/getAllStudents/:classroomId",
};

beforeAll(async () => {
    mongoDb = await MongoMemoryServer.create();
    mongoUrl = mongoDb.getUri();
    await mongoose.connect(mongoUrl);

    // Clean up the database before running test
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
        it("should return status 422 when request body is empty", async () => {
            await supertest(app).post(API_PATHS.CREATE_FIRST_SUPER_ADMIN).expect(422);
        });

        it("should return status 422 when request body has fields with no value", async () => {
            await supertest(app).post(API_PATHS.CREATE_FIRST_SUPER_ADMIN).send({ email: "", password: "" }).expect(422);
        });

        it("should return status 422 when request body has required fields but are invalid", async () => {
            await supertest(app)
                .post(API_PATHS.CREATE_FIRST_SUPER_ADMIN)
                .send({ email: "hello@gmail", password: "Passw0d" })
                .expect(422);
        });

        it("should return status 200 when request body has valid fields", async () => {
            await supertest(app)
                .post(API_PATHS.CREATE_FIRST_SUPER_ADMIN)
                .send({ email: "hello@gmail.com", password: "Passw0rd" })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data).toHaveProperty("_id", "email", "accessLevel", "createdAt", "updatedAt");
                });
        });

        it("should return status 409 if the first superadmin has already been created", async () => {
            await supertest(app)
                .post(API_PATHS.CREATE_FIRST_SUPER_ADMIN)
                .send({ email: "hello@gmail.com", password: "Passw0rd" })
                .expect(409);
        });
    });

    describe("Test User Login", () => {
        it("should return status 422 when request body is empty", async () => {
            await supertest(app).post(API_PATHS.USER_LOGIN).expect(422);
        });

        it("should return status 422 when request body has fields with no value", async () => {
            await supertest(app).post(API_PATHS.USER_LOGIN).send({ email: "", password: "" }).expect(422);
        });

        it("should return status 422 when request body has fields that don't pass input validation", async () => {
            await supertest(app)
                .post(API_PATHS.USER_LOGIN)
                .send({ email: "hell@gmail", password: "Passw3rd" })
                .expect(422)
                .expect((res) => {
                    expect(res.body.errors).toBeTruthy();
                });
        });

        it("should return status 401 when request body has invalid credentials", async () => {
            await supertest(app)
                .post(API_PATHS.USER_LOGIN)
                .send({ email: "hell@gmail", password: "Passw3rd" })
                .expect(422)
                .expect((res) => {
                    expect(res.body.errors).toBeTruthy();
                });
        });

        it("should return status 200 when request body has valid credentials", async () => {
            await supertest(app)
                .post(API_PATHS.USER_LOGIN)
                .send({ email: "hello@gmail.com", password: "Passw0rd" })
                .expect(200)
                .expect((res) => {
                    expect(res.body.data).toHaveProperty("longToken");
                });
        });
    });
});
