const express = require("express");
const router = new express.Router();
const { ExpressError } = require("../expressError");
const db = require("../db");

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
    const results = await db.query("SELECT * FROM companies WHERE code=$1", [
      req.params.code,
    ]);
    if (results.rowCount === 0) next();
    return res.json({ company: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *;",
      [req.body.code, req.body.name, req.body.description]
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

module.exports = router;
