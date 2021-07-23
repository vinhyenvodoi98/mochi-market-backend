const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

router.get('/:chainId/:address', async (req, res) => {
  try {
    let { address, chainId } = req.params;
    address = address.toLowerCase();
    let collection = await Collection.findOne(
      { chainId: chainId, address: address },
      { type: 1, isVerify: 1, name: 1, symbol: 1, address: 1, uriFormat: 1, _id: 0 }
    );

    return res.json(collection);
  } catch (err) {
    return res.status(500).end();
  }
});

router.get('/:chainId', async (req, res) => {
  try {
    var { chainId } = req.params;
    let collections = await Collection.find(
      { chainId: chainId },
      {
        type: 1,
        isVerify: 1,
        name: 1,
        symbol: 1,
        address: 1,
        uriFormat: 1,
        _id: 0,
      }
    );

    return res.json({ collections });
  } catch (err) {
    return res.status(500).end();
  }
});

module.exports = router;
