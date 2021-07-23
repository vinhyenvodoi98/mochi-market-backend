const express = require('express');
const router = express.Router();
// const NFT = require('../models/NFT');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

router.post('/nft', body('isVerify').isBoolean(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var { address, isVerify } = req.body;
  address = address.toLowerCase();
  try {
    let isSuccess = await NFT.updateOne({ address }, { isVerify });
    if (!!isSuccess) return res.json({ isSuccess: true });
    else return res.json({ isSuccess: false });
  } catch (err) {
    return res.json({ isSuccess: false });
  }
});

router.get('/nft', async (req, res) => {
  try {
    let addresses = await NFT.find({ isVerify: true }, 'address');
    arrAdd = addresses.map((add) => add.address);
    return res.json(arrAdd);
  } catch (err) {
    return res.json([]);
  }
});

router.get('/nft/:address', async (req, res) => {
  var { address } = req.params;
  address = address.toLowerCase();
  try {
    let isVerify = await NFT.findOne({ address, isVerify: true });
    if (!!isVerify) return res.json({ isVerify: true });
    else return res.json({ isVerify: false });
  } catch (err) {
    return res.json({ isVerify: false });
  }
});

router.post(
  '/user', // isVerify must be Boolean
  body('isVerify').isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    var { address, isVerify } = req.body;
    address = address.toLowerCase();
    try {
      let isSuccess = await User.updateOne({ address }, { isVerify });
      console.log(isSuccess);
      if (!!isSuccess) return res.json({ isSuccess: true });
      else return res.json({ isSuccess: false });
    } catch (err) {
      return res.json({ isSuccess: false });
    }
  }
);

router.get('/user', async (req, res) => {
  try {
    let addresses = await User.find({ isVerify: true }, 'address');
    arrAdd = addresses.map((add) => add.address);
    return res.json(arrAdd);
  } catch (err) {
    return res.json([]);
  }
});

router.get('/user/:address', async (req, res) => {
  var { address } = req.params;
  address = address.toLowerCase();
  try {
    let isVerify = await User.findOne({ address, isVerify: true });
    if (!!isVerify) return res.json({ isVerify: true });
    else return res.json({ isVerify: false });
  } catch (err) {
    return res.json({ isVerify: false });
  }
});

module.exports = router;
