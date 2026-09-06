const request = require("superTest");
const app = require("../app");

describe("GET /", () =>{
  it("should return API status", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
  });
});