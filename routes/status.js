const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  return res.sendStatus(200);
});

module.exports = router;
