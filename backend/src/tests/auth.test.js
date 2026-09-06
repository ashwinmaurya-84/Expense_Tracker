const request = require("supertest");
const app = require("../app");

describe("POST /auth/register", () =>{
  it("should register a new user", async () =>{
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "StrongPassword123!",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("message");
  });
});

describe("POST /auth/register - validation", () => {
  it("should reject missing name", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "missingname@example.com",
        password: "StrongPassword123!",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should reject invalid email", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Test User",
        email: "not-an-email",
        password: "StrongPassword123!",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should reject weak password", async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Test User",
        email: "weak@example.com",
        password: "123",
      });

    expect(response.statusCode).toBe(400);
  });

  it("should reject duplicate email", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "First User",
        email: "duplicate@example.com",
        password: "StrongPassword123!",
      });

    const response = await request(app)
      .post("/auth/register")
      .send({
        name: "Second User",
        email: "duplicate@example.com",
        password: "StrongPassword123!",
      });

    expect(response.statusCode).toBe(409);
  });
});

describe("POST /auth/login", () => {
  it("should login with valid credentials", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "StrongPassword123!",
      });

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "login@example.com",
        password: "StrongPassword123!",
      });

    console.log("LOGIN RESPONSE:", response.statusCode, response.body);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("token");
    expect(typeof response.body.data.token).toBe("string");
  });

  it("should reject incorrect password", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Wrong Password User",
        email: "wrongpass@example.com",
        password: "StrongPassword123!",
      });

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "wrongpass@example.com",
        password: "WrongPassword123!",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid email or password.");
  });

  it("should reject non-existent email", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "doesnotexist@example.com",
        password: "StrongPassword123!",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid email or password.");
  });
});

describe("GET /auth/profile", () => {
  it("should return the authenticated user's profile", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Profile User",
        email: "profile@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "profile@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject requests without a token", async () => {
    const response = await request(app)
      .get("/auth/profile");

    expect(response.statusCode).toBe(401);
  });

  it("should reject an invalid token", async () => {
    const response = await request(app)
      .get("/auth/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
  });
});

