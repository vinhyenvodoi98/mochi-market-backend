const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');

router.get('/:address', async (req, res) => {
  try {
    var { address } = req.params;
    address = address.toLowerCase();
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);

    let tokens = await NFT.find({ address }, 'tags name symbol address onModel', {
      skip,
      limit,
    }).populate({
      path: 'tokens',
      model: ERC721Token,
      select: ['tokenId', 'tokenURI', 'thumb', 'name', 'image', 'description'],
    });

    tokens = tokens.filter((token) => token.tokens.length > 0);

    return res.json({ tokens });
  } catch (err) {
    return res.status(500).end();
  }
});

router.post('/transfer', async (req, res) => {
  try {
    var { contractAddress, from, to, tokenId } = req.body;
    contractAddress = contractAddress.toLowerCase();
    from = from.toLowerCase();
    to = to.toLowerCase();

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

router.get('/:address/:tokenId', async (req, res) => {
  var { address, tokenId } = req.params;
  address = address.toLowerCase();
  const skip = parseInt(req.query.skip);
  const limit = parseInt(req.query.limit);

  try {
    let token = await NFT.findOne({ address }, 'tags name symbol address onModel', {
      skip,
      limit,
    }).populate({
      path: 'tokens',
      model: ERC721Token,
      match: { tokenId },
      select: ['tokenId', 'tokenURI', 'thumb', 'name', 'image', 'description'],
    });
    if (!!token && token.tokens.length > 0) return res.json(token.tokens[0]);
    else return res.json(null);
  } catch (err) {
    return res.status(500).end();
  }
});

module.exports = router;
