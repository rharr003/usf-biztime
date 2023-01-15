process.env.NODE_ENV = "test";
const app = require("./app");
const request = require("supertest");
const db = require("./db");

describe("Tests for company routes", function () {
  test("Main get route should return all companies", async () => {
    const result = await request(app).get("/companies");
    expect(result.statusCode).toBe(200);
    expect(result.rowCount).not.toBe(0);
    expect(result.body.companies[0].code).toEqual("apple");
  });
  test("Getting specific company should work", async () => {
    const result = await request(app).get("/companies/ibm");
    expect(result.statusCode).toBe(200);
    expect(result.body.company.code).toEqual("ibm");
  });
  test("adding new company should work", async () => {
    const result = await request(app).post("/companies").send({
      code: "MTAO",
      name: "Ming Tao Industries",
      description: "Most pwerful company in the world",
    });
    expect(result.statusCode).toBe(200);
    expect(result.body.added.code).toEqual("MTAO");
  });
  afterEach(
    async () => await db.query("DELETE FROM companies WHERE code='MTAO'")
  );
});

describe("Tests for invoice routes", () => {
  test("Main get route should return all invoices", async () => {
    const result = await request(app).get("/invoices");
    expect(result.statusCode).toBe(200);
    expect(result.rowCount).not.toBe(0);
  });
  test("Getting invoice by id should work", async () => {
    const result = await request(app).get("/invoices/1");
    expect(result.statusCode).toBe(200);
    expect(result.body.invoice.comp_code).toEqual("apple");
  });
});

afterAll(async () => {
  await db.end();
});
