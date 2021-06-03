const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const ERC721Token = require('../models/ERC721Token');
const ERC1155Token = require('../models/ERC1155Token');
const NFT = require('../models/NFT');

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

router.get('/:address/:erc', async (req, res) => {
  const { address, erc } = req.params;
  const skip = parseInt(req.query.skip);
  const limit = parseInt(req.query.limit);

  try {
    let user;
    if (erc === 'erc721') {
      user = await User.findOne({ address }, 'address erc721tokens', {
        skip,
        limit,
      }).populate({
        path: 'erc721tokens',
        model: ERC721Token,
        select: ['tokenId', 'tokenURI', 'name', 'image', 'description', 'nft'],
        populate: {
          path: 'nft',
          model: NFT,
          select: ['name', 'symbol', 'address'],
        },
      });
    } else if (erc === 'erc1155') {
      user = await User.findOne({ address }, 'address erc721tokens', {
        skip,
        limit,
      }).populate({
        path: 'erc1155tokens',
        model: ERC1155Token,
        select: ['tokenId', 'tokenURI', 'name', 'image', 'description', 'nft'],
        populate: {
          path: 'nft',
          model: NFT,
          select: ['name', 'symbol', 'address'],
        },
      });
    } else {
      return res.status(401).json({ message: 'wrong parameter' });
    }

    return res.json(user);
  } catch (error) {
    console.log({ error });
    return res.status(500).json(error);
  }
});

module.exports = router;
