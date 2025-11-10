const request = require("supertest");

// Ensure the server does not auto-start during tests.
process.env.NODE_ENV = "test";

const app = require("../server");

describe("Health Check Endpoint", () => {
  it("returns application status details", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "OK",
      message: "Momo Splitwise API is running",
      service: "MoMo Split API",
    });
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("database");
  });
});

