const request = require("supertest");
const app = require("../app");

describe("POST /expenses", () => {
  it("should create an expense for an authenticated user", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Expense User",
        email: "expense@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "expense@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Burger",
        amount: 450,
        category: "Food",
      });

    console.log("CREATE EXPENSE RESPONSE:", response.statusCode, response.body);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("Expense created successfully");
    expect(response.body.expense).toHaveProperty("_id");
    expect(response.body.expense.title).toBe("Burger");
    expect(response.body.expense.amount).toBe(450);
  });

  it("should reject creating an expense without authentication", async () => {
    const response = await request(app)
      .post("/expenses")
      .send({
        title: "Burger",
        amount: 450,
        category: "Food",
      });

    expect(response.statusCode).toBe(401);
  });
});


describe("GET /expenses", () => {
  it("should return all expenses for the authenticated user", async () => {
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        name: "List User",
        email: "list@example.com",
        password: "StrongPassword123!",
      });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "list@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Burger",
        amount: 450,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Movie",
        amount: 300,
        category: "Entertainment",
      });

    const response = await request(app)
      .get("/expenses")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("expenses");
    expect(Array.isArray(response.body.expenses)).toBe(true);
    expect(response.body.expenses).toHaveLength(2);
  });

  it("should reject unauthenticated requests", async () => {
    const response = await request(app)
      .get("/expenses");

    expect(response.statusCode).toBe(401);
  });
});

describe("GET /expenses/:id", () => {
  it("should return a user's own expense", async () => {
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        name: "Get User",
        email: "get@example.com",
        password: "StrongPassword123!",
      });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "get@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const createResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Pizza",
        amount: 500,
        category: "Food",
      });

    expect(createResponse.statusCode).toBe(201);

    const expenseId = createResponse.body.expense._id;

    const response = await request(app)
      .get(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);
   
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", expenseId);
    expect(response.body.title).toBe("Pizza");
    expect(response.body.amount).toBe(500);
    expect(response.body.category).toBe("Food");
  });

  it("should return 404 when the expense does not exist", async () => {
    const registerResponse = await request(app)
      .post("/auth/register")
      .send({
        name: "Missing User",
        email: "missing@example.com",
        password: "StrongPassword123!",
      });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "missing@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .get("/expenses/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });

  it("should not allow a user to access another user's expense", async () => {
    // User 1
    await request(app)
      .post("/auth/register")
      .send({
        name: "Owner",
        email: "owner@example.com",
        password: "StrongPassword123!",
      });

    const ownerLogin = await request(app)
      .post("/auth/login")
      .send({
        email: "owner@example.com",
        password: "StrongPassword123!",
      });

    const ownerToken = ownerLogin.body.data.token;

    const createResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Private Expense",
        amount: 1000,
        category: "Private",
      });

    const expenseId = createResponse.body.expense._id;

    // User 2
    await request(app)
      .post("/auth/register")
      .send({
        name: "Other User",
        email: "other@example.com",
        password: "StrongPassword123!",
      });

    const otherLogin = await request(app)
      .post("/auth/login")
      .send({
        email: "other@example.com",
        password: "StrongPassword123!",
      });

    const otherToken = otherLogin.body.data.token;

    const response = await request(app)
      .get(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(404);
  });
});

describe("PATCH /expenses/:id", () => {
  it("should update a user's own expense", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Update User",
        email: "update@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "update@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const createResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Old Title",
        amount: 300,
        category: "Food",
      });

    const expenseId = createResponse.body.expense._id;

    const response = await request(app)
      .patch(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Title",
        amount: 500,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.expense).toHaveProperty("_id", expenseId);
    expect(response.body.expense.title).toBe("Updated Title");
    expect(response.body.expense.amount).toBe(500);
  });

  it("should reject an invalid update", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Validation User",
        email: "patchvalidation@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "patchvalidation@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const createResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Lunch",
        amount: 300,
        category: "Food",
      });

    const expenseId = createResponse.body.expense._id;

    const response = await request(app)
      .patch(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "",
      });

    console.log(
      "PATCH INVALID RESPONSE:",
      response.statusCode,
      response.body
    );

    expect(response.statusCode).toBe(400);
  });

  it("should return 404 when the expense does not exist", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Missing Update",
        email: "missingupdate@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "missingupdate@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .patch("/expenses/000000000000000000000001")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated",
      });

    expect(response.statusCode).toBe(404);
  });
});


describe("DELETE /expenses/:id", () => {
  it("should delete a user's own expense", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Delete User",
        email: "delete@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "delete@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const createResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete Me",
        amount: 250,
        category: "Test",
      });

    const expenseId = createResponse.body.expense._id;

    const response = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Expense deleted successfully");

    // Verify it is actually gone
    const getResponse = await request(app)
      .get(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(404);
  });

  it("should return 404 when the expense does not exist", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Missing Delete",
        email: "missingdelete@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "missingdelete@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    const response = await request(app)
      .delete("/expenses/000000000000000000000001")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
  });

  it("should not allow a user to delete another user's expense", async () => {
    // Owner
    await request(app)
      .post("/auth/register")
      .send({
        name: "Delete Owner",
        email: "deleteowner@example.com",
        password: "StrongPassword123!",
      });

    const ownerLogin = await request(app)
      .post("/auth/login")
      .send({
        email: "deleteowner@example.com",
        password: "StrongPassword123!",
      });

    const ownerToken = ownerLogin.body.data.token;

    const createResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        title: "Protected Expense",
        amount: 1000,
        category: "Private",
      });

    const expenseId = createResponse.body.expense._id;

    // Different user
    await request(app)
      .post("/auth/register")
      .send({
        name: "Delete Other",
        email: "deleteother@example.com",
        password: "StrongPassword123!",
      });

    const otherLogin = await request(app)
      .post("/auth/login")
      .send({
        email: "deleteother@example.com",
        password: "StrongPassword123!",
      });

    const otherToken = otherLogin.body.data.token;

    const response = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(response.statusCode).toBe(404);

    // Confirm owner still has the expense
    const ownerGetResponse = await request(app)
      .get(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(ownerGetResponse.statusCode).toBe(200);
  });
});


describe("GET /expenses - filtering", () => {
  it("should filter expenses by category", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Filter User",
        email: "filter@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "filter@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Burger",
        amount: 450,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Movie",
        amount: 300,
        category: "Entertainment",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Pizza",
        amount: 600,
        category: "Food",
      });

    const response = await request(app)
      .get("/expenses?category=Food")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.expenses).toHaveLength(2);

    response.body.expenses.forEach((expense) => {
      expect(expense.category).toBe("Food");
    });
  });
});

it("should reject an invalid date range", async () => {
  const registerResponse = await request(app)
    .post("/auth/register")
    .send({
      name: "Date Validation User",
      email: "datevalidation@example.com",
      password: "StrongPassword123!",
    });

  expect(registerResponse.statusCode).toBe(201);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({
      email: "datevalidation@example.com",
      password: "StrongPassword123!",
    });

  expect(loginResponse.statusCode).toBe(200);

  const token = loginResponse.body.data.token;

  const response = await request(app)
    .get("/expenses?startDate=2026-09-30&endDate=2026-09-01")
    .set("Authorization", `Bearer ${token}`);

  expect(response.statusCode).toBe(400);
  expect(response.body.message).toBe(
    "startDate cannot be greater than endDate."
  );
});

describe("GET /expenses - pagination", () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Pagination User",
        email: "pagination@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "pagination@example.com",
        password: "StrongPassword123!",
      });

    token = loginResponse.body.data.token;
  });

  it("should paginate expenses correctly", async () => {
    for (let i = 1; i <= 5; i++) {
      await request(app)
        .post("/expenses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: `Expense ${i}`,
          amount: i * 100,
          category: "Food",
        });
    }

    const response = await request(app)
      .get("/expenses?page=2&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.expenses).toHaveLength(2);

    expect(response.body.pagination).toEqual({
      total: 5,
      page: 2,
      limit: 2,
      totalPages: 3,
    });
  });

  it("should reject an invalid page", async () => {
    const response = await request(app)
      .get("/expenses?page=0")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Page must be a positive integer."
    );
  });

  it("should reject an invalid limit", async () => {
    const response = await request(app)
      .get("/expenses?limit=101")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Limit must be between 1 and 100."
    );
  });
});


describe("GET /expenses - sorting", () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Sort User",
        email: "sort@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "sort@example.com",
        password: "StrongPassword123!",
      });

    token = loginResponse.body.data.token;
  });

  it("should sort expenses by amount ascending", async () => {
    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expensive",
        amount: 900,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Cheap",
        amount: 100,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Medium",
        amount: 500,
        category: "Food",
      });

    const response = await request(app)
      .get("/expenses?sortBy=amount&order=asc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(
      response.body.expenses.map((expense) => expense.amount)
    ).toEqual([100, 500, 900]);
  });

  it("should sort expenses by amount descending", async () => {
    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expensive",
        amount: 900,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Cheap",
        amount: 100,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Medium",
        amount: 500,
        category: "Food",
      });

    const response = await request(app)
      .get("/expenses?sortBy=amount&order=desc")
      .set("Authorization", `Bearer ${token}`);
    
    console.log("SORT RESPONSE:", response.statusCode, response.body);

    expect(response.statusCode).toBe(200);

    expect(
      response.body.expenses.map((expense) => expense.amount)
    ).toEqual([900, 500, 100]);
  });

  it("should reject an invalid sort field", async () => {
    const response = await request(app)
      .get("/expenses?sortBy=password")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Invalid Sort field."
    );
  });

  it("should reject an invalid sort order", async () => {
    const response = await request(app)
      .get("/expenses?order=random")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Order must be asc or desc."
    );
  });
});

describe("GET /expenses/summary", () => {
  it("should return the correct expense summary", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Summary User",
        email: "summary@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "summary@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expense 1",
        amount: 100,
        category: "Food",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expense 2",
        amount: 300,
        category: "Travel",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expense 3",
        amount: 500,
        category: "Food",
      });

    const response = await request(app)
      .get("/expenses/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.totalExpense).toBe(900);
    expect(response.body.expenseCount).toBe(3);
    expect(response.body.averageExpense).toBe(300);
  });
});

describe("GET /expenses/summary/monthly", () => {
  it("should return monthly expense summary", async () => {
    await request(app)
      .post("/auth/register")
      .send({
        name: "Monthly User",
        email: "monthly@example.com",
        password: "StrongPassword123!",
      });

    const loginResponse = await request(app)
      .post("/auth/login")
      .send({
        email: "monthly@example.com",
        password: "StrongPassword123!",
      });

    const token = loginResponse.body.data.token;

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expense 1",
        amount: 100,
        category: "Food",
        date: "2026-09-01",
      });

    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Expense 2",
        amount: 300,
        category: "Travel",
        date: "2026-09-15",
      });

    const response = await request(app)
      .get("/expenses/summary/monthly")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.monthly).toHaveLength(1);

    expect(response.body.monthly[0]).toMatchObject({
      _id: {
        year: 2026,
        month: 9,
      },
      totalExpense: 400,
      expenseCount: 2,
    });
  });
});