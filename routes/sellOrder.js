const express = require('express');
const router = express.Router();
const SellOrder = require('../models/SellOrder');
const ERC721Token = require('../models/ERC721Token');
const NFT = require('../models/NFT');
const { utils } = require('ethers');

router.get('/:filter', async (req, res) => {
  const skip = parseInt(req.query.skip);
  const limit = parseInt(req.query.limit);
  const { filter } = req.params;
  let sellOrders;
  try {
    if (filter === 'getDetail') {
      let orders = await SellOrder.find(
        { isActive: true },
        'sellId nftAddress tokenId amount soldAmount seller price token isActive sellTime buyers buyTimes',
        {
          skip,
          limit,
        }
      );

      sellOrders = await Promise.all(
        orders.map(async (order) => {
          let nft = await NFT.findOne(
            { _id: order.nftAddress },
            'tags name symbol address'
          ).populate({
            path: 'tokens',
            model: ERC721Token,
            match: { tokenId: order.tokenId },
            select: ['tokenId', 'tokenURI', 'name', 'image', 'description'],
          });

          let newSellOrder = {
            sellId: order.sellId,
            amount: order.amount,
            soldAmount: order.soldAmount,
            seller: order.seller,
            price: utils.parseEther(order.price.toString()).toString(),
            token: order.token,
            nft,
          };

          return newSellOrder;
        })
      );
    } else if (filter === 'all') {
      let orders = await SellOrder.find(
        { isActive: true },
        'sellId nftAddress tokenId amount soldAmount seller price token sellTime ',
        {
          skip,
          limit,
        }
      );

      let sortIndex = 0;
      sellOrders = await Promise.all(
        orders.map(async (order) => {
          let nft = await NFT.findOne(
            { _id: order.nftAddress },
            'tags name symbol address'
          ).populate({
            path: 'tokens',
            model: ERC721Token,
            match: { tokenId: order.tokenId },
            select: ['tokenId', 'tokenURI', 'name', 'image', 'description'],
          });

          let newSellOrder = {
            index: nft.tokens[0].tokenId,
            amount: order.amount,
            soldAmount: order.soldAmount,
            seller: order.seller,
            price: utils.parseEther(order.price.toString()).toString(),
            tokenPayment: order.token,
            collections: nft.name,
            symbolCollections: nft.symbol,
            addressToken: nft.address,
            tokenURI: nft.tokens[0].tokenURI,
            sortIndex,
          };
          order += 1;
          return newSellOrder;
        })
      );
    } else if (filter === 'formatByNft') {
      let orders = await SellOrder.find(
        { isActive: true },
        'sellId nftAddress tokenId amount soldAmount seller price token sellTime ',
        {
          skip,
          limit,
        }
      );

      let sortIndex = 0;
      let sellOrdersRaw = await Promise.all(
        orders.map(async (order) => {
          let nft = await NFT.findOne(
            { _id: order.nftAddress },
            'tags name symbol address'
          ).populate({
            path: 'tokens',
            model: ERC721Token,
            match: { tokenId: order.tokenId },
            select: ['tokenId', 'tokenURI', 'name', 'image', 'description'],
          });

          let newSellOrder = {
            index: order.tokenId,
            amount: order.amount,
            soldAmount: order.soldAmount,
            seller: order.seller,
            price: utils.parseEther(order.price.toString()).toString(),
            tokenPayment: order.token,
            collections: nft.name,
            symbolCollections: nft.symbol,
            addressToken: nft.address,
            tokenURI: nft.tokens[0].tokenURI,
            sortIndex,
          };
          order += 1;
          return newSellOrder;
        })
      );

      let objOrder = {};
      await sellOrdersRaw.forEach((token) => {
        objOrder[token.addressToken] = {
          name: token.collections,
          symbol: token.symbolCollections,
          addressToken: token.addressToken,
          tokens:
            objOrder[token.addressToken] && objOrder[token.addressToken].tokens
              ? objOrder[token.addressToken].tokens
              : [],
        };

        objOrder[token.addressToken].tokens.push(token);
      });
      sellOrders = [];
      for (var key in objOrder) {
        sellOrders.push(objOrder[key]);
      }
    } else if (filter === 'availableSellOrderERC721') {
      let orders = await SellOrder.find(
        { isActive: true },
        'sellId nftAddress tokenId amount soldAmount seller price token isActive sellTime buyers buyTimes',
        {
          skip,
          limit,
        }
      );

      sellOrders = await Promise.all(
        orders.map(async (order) => {
          let nft = await NFT.findOne({ _id: order.nftAddress }, 'address');

          let newSellOrder = {
            sellId: order.sellId,
            amount: order.amount,
            sellTime: order.sellTime,
            buyers: order.buyers,
            buyTimes: order.buyTimes,
            tokenId: order.tokenId.toString(),
            soldAmount: order.soldAmount,
            seller: order.seller,
            price: utils.parseEther(order.price.toString()).toString(),
            token: order.token,
            nftAddress: nft.address,
          };

          return newSellOrder;
        })
      );
    } else if (filter === 'sortByPrice') {
      let orders = await SellOrder.find(
        { isActive: true },
        'sellId nftAddress tokenId amount soldAmount seller price token isActive sellTime buyers buyTimes',
        {
          skip,
          limit,
          sort: {
            price: 1, //Sort by Date Added ASC
          },
        }
      );

      sellOrders = await Promise.all(
        orders.map(async (order) => {
          let nft = await NFT.findOne({ _id: order.nftAddress }, 'address');

          let newSellOrder = {
            sellId: order.sellId,
            amount: order.amount,
            sellTime: order.sellTime,
            buyers: order.buyers,
            buyTimes: order.buyTimes,
            tokenId: order.tokenId.toString(),
            soldAmount: order.soldAmount,
            seller: order.seller,
            price: utils.parseEther(order.price.toString()).toString(),
            token: order.token,
            nftAddress: nft.address,
          };

          return newSellOrder;
        })
      );
    }

    return res.json(sellOrders);
  } catch (error) {
    return res.status(500).end();
  }
});

router.get('/user/:address', async (req, res) => {
  const skip = parseInt(req.query.skip);
  const limit = parseInt(req.query.limit);
  var { address } = req.params;
  address = address.toLowerCase();

  let sellOrders;
  try {
    let orders = await SellOrder.find(
      { isActive: true, seller: address },
      'sellId nftAddress tokenId amount soldAmount seller price token sellTime ',
      {
        skip,
        limit,
      }
    );

    let sortIndex = 0;
    sellOrders = await Promise.all(
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
          index: order.tokenId,
          amount: order.amount,
          soldAmount: order.soldAmount,
          seller: order.seller,
          price: utils.parseEther(order.price.toString()).toString(),
          tokenPayment: order.token,
          collections: nft.name,
          symbolCollections: nft.symbol,
          addressToken: nft.address,
          tokenURI: nft.tokens[0].tokenURI,
          sortIndex,
        };
        order += 1;
        return newSellOrder;
      })
    );
    return res.json(sellOrders);
  } catch (error) {
    return res.status(500).end();
  }
});

module.exports = router;
