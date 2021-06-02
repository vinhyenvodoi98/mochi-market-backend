const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const SellOrder = require('../models/SellOrder');
const ERC721Token = require('../models/ERC721Token');
const NFT = require('../models/NFT');

router.get('/', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    let orders = await SellOrder.find(
      { isActive: true },
      'sellId nftAddress tokenId amount soldAmount seller price token isActive sellTime buyers buyTimes',
      {
        skip,
        limit,
      }
    );

    let sellOrders = await Promise.all(
      orders.map(async (order) => {
        let nft = await NFT.findOne({ _id: order.nftAddress }, 'tags name symbol address').populate(
          {
            path: 'tokens',
            model: ERC721Token,
            match: { tokenId: order.tokenId },
            select: ['tokenId', 'tokenURI', 'name', 'image', 'description'],
          }
        );

        let newSellOrder = {
          sellId: order.sellId,
          amount: order.sellId,
          soldAmount: order.soldAmount,
          seller: order.seller,
          price: order.price,
          token: order.token,
          nft,
        };
        return newSellOrder;
      })
    );

    console.log(sellOrders);

    return res.json({ sellOrders });
  } catch (error) {
    return res.status(500).end();
  }
});

module.exports = router;
