const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const NFT = require('../models/NFT');

router.get('/:address', async (req, res) => {
  try {
    const address = req.params.address;
    const tokens = await NFT.find({ address: address });
    let result = [];

    for (let i = 0; i < tokens.length; i++) {
      result = result.concat(tokens[i].tokens);
    }
    return res.json({ tokens: result });
  } catch (err) {
    return res.status(500).end();
  }
});

router.post('/transfer', async (req, res) => {
  try {
    const { contractAddress, from, to, tokenId } = req.body;
    let token = {};

    let newDocFrom = await NFT.findOne(
      { address: from, addressToken: contractAddress },
      (err, listTokens) => {
        token = listTokens.tokens
          .filter((el) => {
            return parseInt(el.index) === parseInt(tokenId);
          })
          .pop();
      }
    );

    newDocFrom.tokens = newDocFrom.tokens.filter((el) => parseInt(el.index) !== parseInt(tokenId));
    await newDocFrom.save();

    let newDocTo = await NFT.findOne({ address: to, addressToken: contractAddress });
    if (!newDocTo) {
      newDocTo = new NFT({
        address: to,
        addressToken: contractAddress,
        name: newDocFrom.name,
        symbol: newDocFrom.symbol,
        tokens: [token],
      });
    } else {
      newDocTo.tokens = newDocTo.tokens.push(token);
    }

    await newDocTo.save();

    return res.json({ token });
  } catch (err) {
    console.log({ err });
    return res.status(500).end();
  }
});

module.exports = router;
