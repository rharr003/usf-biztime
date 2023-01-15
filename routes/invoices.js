const express = require("express");
const router = new express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM INVOICES");
    return res.json({ invoices: results.rows });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const results = await db.query("SELECT * FROM INVOICES WHERE id=$1", [
      req.params.id,
    ]);
    if (results.rowCount === 0) next();
    return res.json({ invoice: results.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const invoice = await db.query("SELECT * FROM invoices WHERE id=$1", [
      req.params.id,
    ]);
    if (invoice.rowCount === 0) next();
    await db.query("DELETE FROM invoices WHERE id=$1", [req.params.id]);
    return res.json({ deleted: invoice.rows[0] });
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const invoice = await db.query("SELECT * FROM invoices WHERE id=$1", [
      req.params.id,
    ]);
    if (invoice.rowCount === 0) next();
    let { amt, paid, add_date, paid_date } = invoice.rows[0];
    amt = req.body.amt ? req.body.amt : amt;
    paid = req.body.paid ? req.body.paid : paid;
    add_date = req.body.add_date ? req.body.add_date : add_date;
    paid_date = req.body.paid_date ? req.body.paid_date : paid_date;
    console.log(paid_date);
    const result = await db.query(
      `UPDATE invoices SET amt=$1, paid=$2, add_date=$3, paid_date=$4 WHERE id=$5 RETURNING *`,
      [amt, paid, add_date, paid_date, req.params.id]
    );
    return res.json({ updated: result.rows[0] });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
