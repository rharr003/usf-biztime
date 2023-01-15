const express = require("express");
const router = new express.Router();
const { ExpressError } = require("../expressError");
const db = require("../db");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM companies");
    return res.json({ companies: results.rows });
  } catch (e) {
    next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const results = await db.query(
      "SELECT c.code, c.name, c.description, industry_name FROM companies as c LEFT JOIN company_industries ON c.code=comp_code JOIN industries ON industry_code = industries.code WHERE c.code=$1",
      [req.params.code]
    );
    if (results.rowCount === 0) next();
    const industries = results.rows.map((row) => {
      return row.industry_name;
    });
    const { name, description } = results.rows[0];
    return res.json({
      company: name,
      description: description,
      industries: industries,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *;",
      [slugify(req.body.name), req.body.name, req.body.description]
    );
    return res.json({ added: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const company = await db.query("SELECT * FROM companies WHERE code=$1;", [
      req.params.code,
    ]);
    if (company.rowCount === 0) next();
    let { name, description } = company.rows[0];
    name = req.body.name ? req.body.name : name;
    description = req.body.description ? req.body.description : description;

    const result = await db.query(
      "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING *",
      [name, description, req.params.code]
    );

    return res.json({ updated: result.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const company = await db.query("SELECT * FROM companies WHERE code=$1;", [
      req.params.code,
    ]);
    if (company.rowCount === 0) next();

    const result = await db.query("DELETE FROM companies WHERE code = $1", [
      req.params.code,
    ]);

    return res.json({ deleted: company.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.get("/:code/invoices", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT name, amt, paid FROM companies LEFT JOIN company_invoices on code=comp_code LEFT JOIN invoices ON invoice_id = id WHERE companies.code=$1",
      [req.params.code]
    );
    if (result.rowCount === 0) next();
    const { name } = result.rows[0];
    let invoice_arr = result.rows.map((row) => {
      if ((row.amt === null) | (row.paid === null)) {
        return "No invoices found";
      } else {
        return { amount: row.amt, paid: row.paid };
      }
    });
    return res.json({ company: name, invoices: invoice_arr });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
