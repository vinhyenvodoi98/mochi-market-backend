const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

router.post('/checkin', async (req, res) => {
  try {
    const { address } = req.body;

    let user = await User.findOne({ address });

    if (!user) {
      let newUser = new User({ address: address, count: 1 });
      await newUser.save();
      return res.json({ address });
    }

    user.count++;
    await user.save();
    return res.json({ address });
  } catch (err) {
    console.log({ err });
    return res.status(500).end();
  }
});

module.exports = router;
