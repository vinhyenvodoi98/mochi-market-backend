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
  var { address, erc } = req.params;
  const skip = parseInt(req.query.skip);
  const limit = parseInt(req.query.limit);
  address = address.toLowerCase();
  try {
    let user = [];
    if (erc === 'erc721') {
      user = await User.findOne({ address }, 'address erc721tokens').populate({
        path: 'erc721tokens',
        model: ERC721Token,
        options: {
          skip,
          limit,
        },
        select: ['tokenId', 'tokenURI', 'name', 'image', 'description', 'nft'],
        populate: {
          path: 'nft',
          model: NFT,
          select: ['name', 'symbol', 'address'],
        },
      });
    } else if (erc === 'erc1155') {
      user = await User.findOne({ address }, 'address erc721tokens').populate({
        path: 'erc1155tokens',
        model: ERC1155Token,
        options: {
          skip,
          limit,
        },
        select: ['tokenId', 'tokenURI', 'name', 'image', 'description', 'nft'],
        populate: {
          path: 'nft',
          model: NFT,
          select: ['name', 'symbol', 'address'],
        },
      });
    } else if (erc === 'all') {
      let userToken = await User.findOne({ address }, 'erc721tokens erc1155tokens')
        .populate({
          path: 'erc721tokens',
          model: ERC721Token,
          options: {
            skip,
            limit,
          },
          select: ['tokenId', 'tokenURI'],
          populate: {
            path: 'nft',
            model: NFT,
            select: ['address'],
          },
        })
        .populate({
          path: 'erc1155tokens',
          model: ERC1155Token,
          options: {
            skip,
            limit,
          },
          select: ['tokenId'],
          populate: {
            path: 'nft',
            model: NFT,
            select: ['address'],
          },
        });
      if (!!userToken) {
        let erc721 = userToken.erc721tokens.map((token) => {
          let sToken = {};
          sToken.index = token.tokenId;
          sToken.tokenURI = token.tokenURI;
          sToken.addressToken = token.nft.address;
          sToken.is1155 = false;
          return sToken;
        });

        let erc1155 = userToken.erc1155tokens.map((token) => {
          let sToken = {};
          sToken.index = token.tokenId;
          sToken.tokenURI = token.tokenURI;
          sToken.addressToken = token.nft.address;
          sToken.is1155 = true;
          return sToken;
        });

        user = erc721.concat(erc1155);
      }
    } else if (erc === 'formatByNft') {
      let userToken = await User.findOne({ address }, 'address erc721tokens').populate({
        path: 'erc721tokens',
        model: ERC721Token,
        options: {
          skip,
          limit,
        },
        select: ['tokenId', 'tokenURI', 'name', 'image', 'description', 'nft'],
        populate: {
          path: 'nft',
          model: NFT,
          select: ['name', 'symbol', 'address'],
        },
      });
      if (!!userToken) {
        let objUser = {};
        await userToken.erc721tokens.forEach((token) => {
          objUser[token.nft._id.toString()] = {
            name: token.nft.name,
            symbol: token.nft.symbol,
            tokens:
              objUser[token.nft._id.toString()] && objUser[token.nft._id.toString()].tokens
                ? objUser[token.nft._id.toString()].tokens
                : [],
          };

          objUser[token.nft._id.toString()].tokens.push({
            index: token.tokenId,
            tokenURI: token.tokenURI,
            addressToken: token.nft.address,
            is1155: false,
          });

          objUser[token.nft._id.toString()].balanceOf =
            objUser[token.nft._id.toString()].tokens.length;
        });
        user = [];
        for (var key in objUser) {
          user.push(objUser[key]);
        }
      }
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
