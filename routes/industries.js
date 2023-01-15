const express = require("express");
const router = new express.Router();
const { ExpressError } = require("../expressError");
const db = require("../db");

router.get("/", async (req, res, next) => {
  const results = await db.query(
    "SELECT industry_name, name FROM industries JOIN company_industries ON code = industry_code JOIN companies ON comp_code = companies.code"
  );
  const industries = results.rows.reduce((acc, row) => {
    for (let val of acc) {
      if (val.industry_name === row.industry_name) {
        val.companies.push(row.name);
        return acc;
      }
    }
    acc.push({ industry_name: row.industry_name, companies: [row.name] });
    return acc;
  }, []);
  return res.json(industries);
});

router.put("/:code", async (req, res, next) => {
  const result = await db.query(
    "INSERT INTO company_industries VALUES($1, $2) RETURNING *",
    [req.body.company_code, req.params.code]
  );
  return res.json({ added: result.rows[0] });
});
module.exports = router;
