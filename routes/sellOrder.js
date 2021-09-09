const express = require('express');
const router = express.Router();
const SellOrder = require('../models/SellOrder');
const ERC721NFT = require('../models/ERC721NFT');
const ERC1155NFT = require('../models/ERC1155NFT');
const Collection = require('../models/Collection');
const { getSellOrderListInstance } = require('../utils/getContractInstance');
const { addSellOrder, updateSellOrder } = require('../scripts/sellOrder');
const { isAddress, validChainId } = require('../helpers/verifyAddress');

const { initERC721Single, initERC1155Single } = require('../helpers/blockchain');
const { updateERC721NFT, updateERC1155NFT } = require('../scripts/nft');

router.get('/:chainId', async (req, res) => {
  try {
    let { chainId } = req.params;

    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let sellOrders;
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    if (token == undefined) {
      sellOrders = await SellOrder.find(
        { isActive: true, chainId: chainId },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ sellId: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      sellOrders = await SellOrder.find(
        { isActive: true, chainId: chainId, token: token.toLowerCase() },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ price: asc, sellId: -1 })
        .skip(skip)
        .limit(limit);
    }

    if (!sellOrders) {
      return res.json();
    }

    let result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let item = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };

        return item;
      })
    );
    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/:chainId/:searchString', async (req, res) => {
  try {
    let { chainId, searchString } = req.params;

    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let sellOrders = [];
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    searchString = new RegExp(searchString, 'gi');

    let erc721Nfts = await ERC721NFT.find({
      $or: [{ name: searchString }, { description: searchString }, { tokenId: searchString }],
    });
    let erc1155Nfts = await ERC1155NFT.find({
      $or: [{ name: searchString }, { description: searchString }, { tokenId: searchString }],
    });

    let nfts = erc721Nfts.concat(erc1155Nfts);

    if (nfts.length == 0) return res.json([]);

    await Promise.all(
      nfts.map(async (nft) => {
        let temp;
        if (token == undefined) {
          temp = await SellOrder.find(
            {
              collectionAddress: nft.collectionAddress,
              tokenId: nft.tokenId,
              chainId: chainId,
              isActive: true,
            },
            { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
          );
        } else {
          temp = await SellOrder.find(
            {
              collectionAddress: nft.collectionAddress,
              tokenId: nft.tokenId,
              chainId: chainId,
              isActive: true,
              token: token.toLowerCase(),
            },
            { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
          );
        }
        if (temp.length > 0) sellOrders = sellOrders.concat(temp);
      })
    );

    if (token != undefined) {
      if (asc == 1) {
        sellOrders.sort((a, b) =>
          a.price > b.price
            ? 1
            : b.price > a.price
            ? -1
            : a.sellId < b.sellId
            ? 1
            : b.sellId < a.sellId
            ? -1
            : 0
        );
      } else {
        sellOrders.sort((a, b) =>
          a.price < b.price
            ? 1
            : b.price < a.price
            ? -1
            : a.sellId < b.sellId
            ? 1
            : b.sellId < a.sellId
            ? -1
            : 0
        );
      }
    } else {
      sellOrders.sort((a, b) => (a.sellId < b.sellId ? 1 : b.sellId < a.sellId ? -1 : 0));
    }
    if (sellOrders.length == 0) return res.json();

    sellOrders = sellOrders.slice(skip, skip + limit);

    let result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let item = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };

        return item;
      })
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/byType/erc721/:chainId', async (req, res) => {
  try {
    let { chainId } = req.params;

    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    let erc721Collections = await Collection.find({ chainId: chainId, type: 'ERC721Token' });

    if (!erc721Collections) return res.json();

    let allAddresses = erc721Collections.map((collection) => collection.address);
    let sellOrders;

    if (token == undefined) {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          isActive: true,
          collectionAddress: { $in: allAddresses },
        },
        { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ sellId: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          isActive: true,
          token: token,
          collectionAddress: { $in: allAddresses },
        },
        { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ price: asc, sellId: -1 })
        .skip(skip)
        .limit(limit);
    }
    if (!sellOrders) return res.json();

    let result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let nft = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };

        return nft;
      })
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/byType/erc1155/:chainId', async (req, res) => {
  try {
    let { chainId } = req.params;

    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    let erc1155Collections = await Collection.find({ chainId: chainId, type: 'ERC1155Token' });
    if (!erc1155Collections) return res.json();

    let allAddresses = erc1155Collections.map((collection) => collection.address);
    let sellOrders;
    if (token == undefined) {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          isActive: true,
          collectionAddress: { $in: allAddresses },
        },
        { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ sellId: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          isActive: true,
          token: token,
          collectionAddress: { $in: allAddresses },
        },
        { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ price: asc, sellId: -1 })
        .skip(skip)
        .limit(limit);
    }
    if (!sellOrders) return res.json();

    let result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let nft = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };

        return nft;
      })
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/filterByAttributes/:chainId/:address', async (req, res) => {
  try {
    let { address, chainId } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    let query = getFilter(chainId, address, req.query);
    let result;

    let collection = await Collection.findOne({ chainId: chainId, address: address });
    if (!collection) res.json();

    if (collection.type === 'ERC721Token') {
      let sellOrders;
      let items = await ERC721NFT.find(query, {
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });
      let tokenIds = items.map(function (item) {
        return item.tokenId;
      });

      if (!!tokenIds && tokenIds.length > 0) {
        if (token == undefined) {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ sellId: -1 })
            .skip(skip)
            .limit(limit);
        } else {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
              token: token,
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ price: asc, sellId: -1 })
            .skip(skip)
            .limit(limit);
        }
      }

      if (!sellOrders) return res.json();

      result = await Promise.all(
        sellOrders.map(async (sellOrder) => {
          sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
          let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

          let nft = {
            buyers: sellOrder.buyers,
            buyTimes: sellOrder.buyTimes,
            chainId: sellOrder.chainId,
            sellId: sellOrder.sellId,
            collectionAddress: nftInfo.collectionAddress,
            collectionName: nftInfo.collectionName,
            tokenId: sellOrder.tokenId,
            amount: sellOrder.amount,
            soldAmount: sellOrder.soldAmount,
            seller: sellOrder.seller,
            price: sellOrder.price,
            token: sellOrder.token,
            isActive: sellOrder.isActive,
            sellTime: sellOrder.sellTime,
            image: nftInfo.image,
            name: nftInfo.name,
            tokenURI: nftInfo.tokenURI,
            thumb: nftInfo.thumb,
            attributes: nftInfo.attributes,
          };

          return nft;
        })
      );
    } else if (collection.type === 'ERC1155Token') {
      let sellOrders;

      let items = await ERC1155NFT.find(query, {
        _id: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0,
      });

      let tokenIds = items.map(function (item) {
        return item.tokenId;
      });

      if (!!tokenIds && tokenIds.length > 0) {
        if (token == undefined) {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ sellId: -1 })
            .skip(skip)
            .limit(limit);
        } else {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ price: asc, sellId: -1 })
            .skip(skip)
            .limit(limit);
        }
      }

      if (!sellOrders) return res.json();

      result = await Promise.all(
        sellOrders.map(async (sellOrder) => {
          sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
          let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

          let nft = {
            buyers: sellOrder.buyers,
            buyTimes: sellOrder.buyTimes,
            chainId: sellOrder.chainId,
            sellId: sellOrder.sellId,
            collectionAddress: nftInfo.collectionAddress,
            collectionName: nftInfo.collectionName,
            tokenId: sellOrder.tokenId,
            amount: sellOrder.amount,
            soldAmount: sellOrder.soldAmount,
            seller: sellOrder.seller,
            price: sellOrder.price,
            token: sellOrder.token,
            isActive: sellOrder.isActive,
            sellTime: sellOrder.sellTime,
            image: nftInfo.image,
            name: nftInfo.name,
            tokenURI: nftInfo.tokenURI,
            thumb: nftInfo.thumb,
            attributes: nftInfo.attributes,
          };
          return nft;
        })
      );
    }

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/filterByAttributes/:chainId/:address/:searchString', async (req, res) => {
  try {
    let { address, chainId, searchString } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;
    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    searchString = new RegExp(searchString, 'gi');

    let query = getFilter(chainId, address, req.query);
    let result;

    let collection = await Collection.findOne({ chainId: chainId, address: address });
    if (!collection) res.json();
    if (collection.type === 'ERC721Token') {
      let sellOrders;
      let items = await ERC721NFT.find(
        { $and: [query, { $or: [{ name: searchString }, { description: searchString }] }] },
        {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        }
      );
      let tokenIds = items.map(function (item) {
        return item.tokenId;
      });

      if (!!tokenIds && tokenIds.length > 0) {
        if (token == undefined) {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ sellId: -1 })
            .skip(skip)
            .limit(limit);
        } else {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
              token: token,
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ price: asc, sellId: -1 })
            .skip(skip)
            .limit(limit);
        }
      }
      if (!sellOrders) return res.json();

      result = await Promise.all(
        sellOrders.map(async (sellOrder) => {
          sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
          let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

          let nft = {
            buyers: sellOrder.buyers,
            buyTimes: sellOrder.buyTimes,
            chainId: sellOrder.chainId,
            sellId: sellOrder.sellId,
            collectionAddress: nftInfo.collectionAddress,
            collectionName: nftInfo.collectionName,
            tokenId: sellOrder.tokenId,
            amount: sellOrder.amount,
            soldAmount: sellOrder.soldAmount,
            seller: sellOrder.seller,
            price: sellOrder.price,
            token: sellOrder.token,
            isActive: sellOrder.isActive,
            sellTime: sellOrder.sellTime,
            image: nftInfo.image,
            name: nftInfo.name,
            tokenURI: nftInfo.tokenURI,
            thumb: nftInfo.thumb,
            attributes: nftInfo.attributes,
          };

          return nft;
        })
      );
    } else if (collection.type === 'ERC1155Token') {
      let sellOrders;

      let items = await ERC1155NFT.find(
        { $and: [query, { $or: [{ name: searchString }, { description: searchString }] }] },
        {
          _id: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        }
      );

      let tokenIds = items.map(function (item) {
        return item.tokenId;
      });

      if (!!tokenIds && tokenIds.length > 0) {
        if (token == undefined) {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ sellId: -1 })
            .skip(skip)
            .limit(limit);
        } else {
          sellOrders = await SellOrder.find(
            {
              chainId: chainId,
              collectionAddress: address,
              isActive: true,
              tokenId: { $in: tokenIds },
            },
            { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
          )
            .sort({ price: asc, sellId: -1 })
            .skip(skip)
            .limit(limit);
        }
      }
      if (!sellOrders) return res.json();

      result = await Promise.all(
        sellOrders.map(async (sellOrder) => {
          sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
          let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

          let nft = {
            buyers: sellOrder.buyers,
            buyTimes: sellOrder.buyTimes,
            chainId: sellOrder.chainId,
            sellId: sellOrder.sellId,
            collectionAddress: nftInfo.collectionAddress,
            collectionName: nftInfo.collectionName,
            tokenId: sellOrder.tokenId,
            amount: sellOrder.amount,
            soldAmount: sellOrder.soldAmount,
            seller: sellOrder.seller,
            price: sellOrder.price,
            token: sellOrder.token,
            isActive: sellOrder.isActive,
            sellTime: sellOrder.sellTime,
            image: nftInfo.image,
            name: nftInfo.name,
            tokenURI: nftInfo.tokenURI,
            thumb: nftInfo.thumb,
            attributes: nftInfo.attributes,
          };
          return nft;
        })
      );
    }

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/byCollection/:chainId/:address', async (req, res) => {
  try {
    let { address, chainId } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let sellOrders;
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    if (token == undefined) {
      sellOrders = await SellOrder.find(
        { chainId: chainId, collectionAddress: address, isActive: true },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ sellId: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          collectionAddress: address,
          token: token.toLowerCase(),
          isActive: true,
        },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ price: asc, sellId: -1 })
        .skip(skip)
        .limit(limit);
    }

    if (!sellOrders) return res.json();

    let result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);

        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let item = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };

        return item;
      })
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/byCollection/:chainId/:address/:searchString', async (req, res) => {
  try {
    let { address, chainId, searchString } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let sellOrders;
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;
    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    searchString = new RegExp(searchString, 'gi');

    let collectionInfo = await Collection.findOne({ address: address, chainId: chainId });
    if (!collectionInfo) return res.json([]);

    let nfts;
    if (collectionInfo.type == 'ERC721Token') {
      nfts = await ERC721NFT.find({
        chainId: chainId,
        collectionAddress: address,
        $or: [{ name: searchString, description: searchString }],
      });
    } else {
      nfts = await ERC1155NFT.find({
        chainId: chainId,
        collectionAddress: address,
        $or: [{ name: searchString, description: searchString }],
      });
    }
    if (!nfts) return res.json();

    let tokenIds = nfts.map((nft) => nft.tokenId);
    if (token == undefined) {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          collectionAddress: address,
          isActive: true,
          tokenId: { $in: tokenIds },
        },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ sellId: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          collectionAddress: address,
          isActive: true,
          tokenId: { $in: tokenIds },
          token: token.toLowerCase(),
        },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ price: asc, sellId: -1 })
        .skip(skip)
        .limit(limit);
    }

    if (!sellOrders) return res.json();

    result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let nft = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };
        return nft;
      })
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/byUser/:chainId/:address', async (req, res) => {
  try {
    let { address, chainId } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let sellOrders;
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let token = req.query.token;

    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }

    if (token == undefined) {
      sellOrders = await SellOrder.find(
        { chainId: chainId, seller: address, isActive: true },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ sellId: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      sellOrders = await SellOrder.find(
        { chainId: chainId, seller: address, isActive: true, token: token },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      )
        .sort({ price: asc, sellId: -1 })
        .skip(skip)
        .limit(limit);
    }

    if (!sellOrders) return res.json();

    let result = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = await checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

        let item = {
          buyers: sellOrder.buyers,
          buyTimes: sellOrder.buyTimes,
          chainId: sellOrder.chainId,
          sellId: sellOrder.sellId,
          collectionAddress: nftInfo.collectionAddress,
          collectionName: nftInfo.collectionName,
          tokenId: sellOrder.tokenId,
          amount: sellOrder.amount,
          soldAmount: sellOrder.soldAmount,
          seller: sellOrder.seller,
          price: sellOrder.price,
          token: sellOrder.token,
          isActive: sellOrder.isActive,
          sellTime: sellOrder.sellTime,
          image: nftInfo.image,
          name: nftInfo.name,
          description: nftInfo.description,
          tokenURI: nftInfo.tokenURI,
          thumb: nftInfo.thumb,
          attributes: nftInfo.attributes,
        };

        return item;
      })
    );

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/bySellId/:chainId/:sellId', async (req, res) => {
  try {
    let { chainId, sellId } = req.params;

    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let sellOrder = await SellOrder.findOne({ chainId: chainId, sellId: sellId });
    sellOrder = await checkSellOrder(chainId, sellId, sellOrder);

    let otherSellOrders = await getOtherSellOrders(chainId, sellOrder);

    let nftInfo = await getNftInfo(chainId, sellOrder.collectionAddress, sellOrder.tokenId);

    let result = {
      buyers: sellOrder.buyers,
      buyTimes: sellOrder.buyTimes,
      chainId: sellOrder.chainId,
      sellId: sellOrder.sellId,
      collectionAddress: nftInfo.collectionAddress,
      collectionName: nftInfo.collectionName,
      tokenId: sellOrder.tokenId,
      amount: sellOrder.amount,
      soldAmount: sellOrder.soldAmount,
      seller: sellOrder.seller,
      price: sellOrder.price,
      token: sellOrder.token,
      isActive: sellOrder.isActive,
      sellTime: sellOrder.sellTime,
      image: nftInfo.image,
      name: nftInfo.name,
      description: nftInfo.description,
      tokenURI: nftInfo.tokenURI,
      thumb: nftInfo.thumb,
      attributes: nftInfo.attributes,
      otherSellOrders: otherSellOrders,
    };

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

router.get('/byNft/:chainId/:address/:tokenId', async (req, res) => {
  try {
    let { chainId, address, tokenId } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let token = req.query.token;
    let asc = 1;

    if (req.query.asc != undefined) {
      asc = parseInt(req.query.asc);
    }
    let sellOrders;
    if (token == undefined) {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          tokenId: tokenId,
          collectionAddress: address,
          isActive: true,
        },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      ).sort({ sellId: -1 });
    } else {
      sellOrders = await SellOrder.find(
        {
          chainId: chainId,
          tokenId: tokenId,
          collectionAddress: address,
          isActive: true,
          token: token,
        },
        { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }
      ).sort({ price: asc, sellId: -1 });
    }
    if (!sellOrders) return res.json();

    let data = await Promise.all(
      sellOrders.map(async (sellOrder) => {
        sellOrder = checkSellOrder(chainId, sellOrder.sellId, sellOrder);
        return sellOrder;
      })
    );

    let nftInfo = await getNftInfo(chainId, address, tokenId);

    let result = {
      collectionAddress: address,
      collectionName: nftInfo.collectionName,
      tokenId: tokenId,
      image: nftInfo.image,
      name: nftInfo.name,
      description: nftInfo.description,
      tokenURI: nftInfo.tokenURI,
      thumb: nftInfo.thumb,
      sellOrders: data,
      attributes: nftInfo.attributes,
    };

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
});

const checkSellOrder = async (chainId, sellId, sellOrder) => {
  if (!!sellOrder && sellOrder.amount != 0 && sellOrder.buyers.length == sellOrder.buyTimes.length)
    return sellOrder;

  let instance = getSellOrderListInstance(chainId);

  let sellOrderInfo = await instance.getSellOrderById(sellId);

  if (!sellOrder) {
    await addSellOrder(chainId, sellOrderInfo);
  } else {
    await updateSellOrder(chainId, sellOrderInfo);
  }

  sellOrder = await SellOrder.findOne(
    {
      chainId: chainId,
      sellId: sellId,
    },
    { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 }
  );

  return {
    chainId: sellOrder.chainId,
    sellId: sellOrder.sellId,
    collectionAddress: sellOrder.collectionAddress,
    tokenId: sellOrder.tokenId,
    isActive: sellOrder.isActive,
    amount: sellOrder.amount,
    soldAmount: sellOrder.soldAmount,
    seller: sellOrder.seller,
    price: sellOrder.price,
    token: sellOrder.token,
    sellTime: sellOrder.sellTime,
    buyers: sellOrder.buyers,
    buyTimes: sellOrder.buyTimes,
  };
};

const getOtherSellOrders = async (chainId, sellOrderInfo) => {
  let otherSellOrders = await SellOrder.find(
    {
      chainId: chainId,
      collectionAddress: sellOrderInfo.collectionAddress,
      tokenId: sellOrderInfo.tokenId,
      isActive: true,
      sellId: { $nin: [sellOrderInfo.sellId] },
    },
    { __v: 0, _id: 0, createdAt: 0, updatedAt: 0 }
  ).sort({ sellId: -1 });

  return otherSellOrders;
};

const getNftInfo = async (chainId, collectionAddress, tokenId) => {
  let item;
  let collection = await Collection.findOne({
    chainId: chainId,
    address: collectionAddress,
  });
  if (collection == null) {
    return {
      attributes: null,
      image: null,
      name: null,
      description: null,
      tokenURI: null,
    };
  }
  if (collection.type == 'ERC721Token') {
    item = await ERC721NFT.findOne({
      chainId,
      collectionAddress,
      tokenId,
    });
    // if (!item.thumb) {
    //   let instance = initERC721Single(chainId, collectionAddress);
    //   await updateERC721NFT(chainId, instance, collection.uriFormat, tokenId);

    //   item = await ERC721NFT.findOne(
    //     { chainId: chainId, collectionAddress: collectionAddress, tokenId: tokenId },
    //     { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
    //   );
    // }
  } else if (collection.type == 'ERC1155Token') {
    item = await ERC1155NFT.findOne({
      chainId,
      collectionAddress,
      tokenId,
    });

    if (!item.thumb) {
      let instance = initERC1155Single(chainId, collectionAddress);
      await updateERC1155NFT(chainId, instance, collection.uriFormat, tokenId);

      item = await ERC1155NFT.findOne(
        { chainId: chainId, collectionAddress: collectionAddress, tokenId: tokenId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );
    }
  }

  if (item == null) {
    return {
      attributes: null,
      image: null,
      name: null,
      description: null,
      tokenURI: null,
      thumb: null,
    };
  }
  return {
    collectionName: collection.name,
    collectionAddress: collection.address,
    image: item.image,
    name: item.name,
    description: item.description,
    tokenURI: item.tokenURI,
    thumb: item.thumb,
    attributes: item.attributes,
  };
};

const getFilter = (chainId, address, filter) => {
  try {
    let queryString = JSON.stringify({ chainId: chainId, collectionAddress: address });
    queryString = queryString.substring(0, queryString.length - 1) + ',';
    for (let i = 0; i <= 20; i++) {
      if (filter[i] == undefined) continue;

      let value = JSON.parse(filter[i]);
      if (value.length == undefined) {
        queryString =
          queryString +
          '"$and": [{"attributes.' +
          i +
          '.value": {"$gte": ' +
          value.min +
          '}}, {"attributes.' +
          i +
          '.value": {"$lte": ' +
          value.max +
          '}}]';
        queryString = queryString + ',';
      } else {
        0;
        queryString = queryString + '"attributes.' + i + '.value":';

        queryString = queryString + '{' + '"$in": [';
        for (let j = 0; j < value.length; j++) {
          queryString = queryString + '"' + value[j] + '"';
          if (j < value.length - 1) {
            queryString = queryString + ',';
          } else {
            queryString = queryString + ']';
          }
        }

        queryString = queryString + '},';
      }
    }

    queryString = queryString.substring(0, queryString.length - 1) + '}';

    return JSON.parse(queryString);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = router;
