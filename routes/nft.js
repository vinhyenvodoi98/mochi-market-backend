const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');

router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);

    let tokens = await NFT.find({ address }, 'tags name symbol address onModel', {
      skip,
      limit,
    }).populate({
      path: 'tokens',
      model: ERC721Token,
      select: ['tokenId', 'tokenURI', 'name', 'image', 'description'],
    });

    tokens = tokens.filter((token) => token.tokens.length > 0);

    return res.json({ tokens });
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
