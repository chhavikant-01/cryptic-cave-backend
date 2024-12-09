const supertest = require("supertest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("../index.js");
const User = require("../models/User.js"); // Adjust the path to your User model

dotenv.config();

const request = supertest(app);

/* Connect to the database before running tests. */
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

/* Clear and close the database after tests. */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("POST /api/v1/auth/login", () => {
  const validDomain = "mitwpu.edu.in"; // Use your actual valid domain here
  let user;

  beforeEach(async () => {
    // Create a mock user in the database
    user = await User.create({
      name: "Test User",
      email: `test@${validDomain}`,
      password: "password123",
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany();
  });

  it("should return 400 if email or password is missing", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .send({ email: "" }); // Missing password

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please enter all fields!");
  });

  it("should return 400 if the email domain is invalid", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .send({ email: "invalid@otherdomain.com", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please use a valid email address");
  });

  it("should return 400 if the user does not exist", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .send({ email: `nonexistent@${validDomain}`, password: "password123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User doesn't exist!");
  });

  it("should return 400 if the password is incorrect", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .send({ email: `test@${validDomain}`, password: "wrongpassword" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please provide the correct information");
  });

  it("should return 200 and a token if login is successful", async () => {
    const response = await request
      .post("/api/v1/auth/login")
      .send({ email: `test@${validDomain}`, password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
