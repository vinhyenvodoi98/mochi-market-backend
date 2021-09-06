const { getSellOrderListInstance } = require('../utils/getContractInstance');
const ERC721NFT = require('../models/ERC721NFT');
const ERC1155NFT = require('../models/ERC1155NFT');
const Collection = require('../models/Collection');
const SellOrder = require('../models/SellOrder');

const { addERC721NFT, addERC1155NFT } = require('./nft');
const { initERC721Single, initERC1155Single } = require('../helpers/blockchain');
const { utils } = require('ethers');

const addSellOrder = async (chainId, sellOrderInfo) => {
  try {
    let sellId = parseInt(sellOrderInfo.sellId);

    let exist = await SellOrder.findOne({ chainId: chainId, sellId: sellId });

    if (!!exist) {
      throw Error('Sell Order already exist');
    }

    let collectionAddress = sellOrderInfo.nftAddress.toLowerCase();
    let tokenId = sellOrderInfo.tokenId.toString();

    console.log('[ADD SELL ORDER] chainId: ' + chainId + ', sellId: ' + sellId);
    let sellOrder = new SellOrder({
      chainId: chainId,
      sellId: sellId,
      collectionAddress: collectionAddress,
      tokenId: tokenId,
      amount: parseInt(sellOrderInfo.amount),
      soldAmount: parseInt(sellOrderInfo.soldAmount),
      seller: sellOrderInfo.seller.toLowerCase(),
      price: parseFloat(utils.formatEther(sellOrderInfo.price.toString())),
      token: sellOrderInfo.token.toLowerCase(),
      isActive: sellOrderInfo.isActive,
      sellTime: parseInt(sellOrderInfo.sellTime.toString()),
      buyers: await sellOrderInfo.buyers.map((buyer) => buyer.toLowerCase()),
      buyTimes: await sellOrderInfo.buyTimes.map((buyTime) => parseInt(buyTime)),
    });
    await sellOrder.save();

    let collectionInfo = await Collection.findOne({
      address: collectionAddress,
      chainId: chainId,
    });

    if (collectionInfo.type == 'ERC721Token') {
      let nft = await ERC721NFT.findOne({
        chainId: chainId,
        collectionAddress: collectionAddress,
        tokenId: tokenId,
      });

      if (!nft) {
        let instance = initERC721Single(chainId, collectionAddress);
        await addERC721NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
      }
    } else if (collectionInfo.type == 'ERC1155Token') {
      let nft = await ERC1155NFT.findOne({
        chainId: chainId,
        collectionAddress: collectionAddress,
        tokenId: tokenId,
      });
      if (!nft) {
        let instance = initERC1155Single(chainId, collectionAddress);
        await addERC1155NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
      }
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const updateSellOrder = async (chainId, sellOrderInfo) => {
  try {
    let sellId = parseInt(sellOrderInfo.sellId);

    let sellOrder = await SellOrder.findOne({ chainId: chainId, sellId: sellId });

    if (!sellOrder) {
      throw Error('Sell Order not exist');
    }

    if (sellOrder.buyers.length > sellOrderInfo.buyers.length) return;

    let collectionAddress = sellOrderInfo.nftAddress.toLowerCase();
    let tokenId = sellOrderInfo.tokenId.toString();

    let mess = '[UPDATE SELL ORDER] chainId: ' + chainId + ', sellId: ' + sellId;

    let change = false;
    if (sellOrder.tokenId !== sellOrderInfo.tokenId.toString()) {
      sellOrder.tokenId = sellOrderInfo.tokenId.toString();
      change = !change ? true : change;
      mess = mess + ', tokenId: ' + sellOrderInfo.tokenId.toString();
    }
    if (parseInt(sellOrder.amount) !== parseInt(sellOrderInfo.amount)) {
      sellOrder.amount = parseInt(sellOrderInfo.amount);
      change = !change ? true : change;
      mess = mess + ', amount: ' + parseInt(sellOrderInfo.amount);
    }
    if (parseInt(sellOrder.soldAmount) !== parseInt(sellOrderInfo.soldAmount)) {
      sellOrder.soldAmount = parseInt(sellOrderInfo.soldAmount);
      change = !change ? true : change;
      mess = mess + ', soldAmount: ' + parseInt(sellOrderInfo.soldAmount);
    }
    if (sellOrder.seller !== sellOrderInfo.seller.toLowerCase()) {
      sellOrder.seller = sellOrderInfo.seller.toLowerCase();
      change = !change ? true : change;
      mess = mess + ', seller: ' + sellOrderInfo.seller.toLowerCase();
    }
    if (sellOrder.price !== parseFloat(utils.formatEther(sellOrderInfo.price.toString()))) {
      sellOrder.price = parseFloat(utils.formatEther(sellOrderInfo.price.toString()));
      change = !change ? true : change;
      mess = mess + ', price: ' + parseFloat(utils.formatEther(sellOrderInfo.price.toString()));
    }
    if (sellOrder.token !== sellOrderInfo.token.toLowerCase()) {
      sellOrder.token = sellOrderInfo.token.toLowerCase();
      change = !change ? true : change;
      mess = mess + ', token: ' + sellOrderInfo.token.toLowerCase();
    }
    if (sellOrder.isActive != sellOrderInfo.isActive) {
      sellOrder.isActive = sellOrderInfo.isActive;
      change = !change ? true : change;
      mess = mess + ', isActive: ' + sellOrderInfo.isActive;
    }
    if (sellOrder.sellTime !== parseInt(sellOrderInfo.sellTime)) {
      sellOrder.sellTime = parseInt(sellOrderInfo.sellTime);
      change = !change ? true : change;
      mess = mess + ', sellTime: ' + parseInt(sellOrderInfo.sellTime);
    }
    if (sellOrder.buyers.length !== sellOrderInfo.buyers.length) {
      sellOrder.buyers = await sellOrderInfo.buyers.map((buyer) => buyer.toLowerCase());
      change = !change ? true : change;
      mess = mess + ', buyers';
    }
    if (sellOrder.buyTimes.length != sellOrderInfo.buyTimes.length) {
      sellOrder.buyTimes = await sellOrderInfo.buyTimes.map((buyTime) => parseInt(buyTime));
      change = !change ? true : change;
      mess = mess + ', buyTimes';
    }

    if (change) {
      console.log(mess);
      await sellOrder.save();
    }

    let collectionInfo = await Collection.findOne({
      address: collectionAddress,
      chainId: chainId,
    });

    if (collectionInfo.type == 'ERC721Token') {
      let nft = await ERC721NFT.findOne({
        chainId: chainId,
        collectionAddress: collectionAddress,
        tokenId: tokenId,
      });

      if (!nft) {
        let instance = initERC721Single(chainId, collectionAddress);
        await addERC721NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
      }
    } else if (collectionInfo.type == 'ERC1155Token') {
      let nft = await ERC1155NFT.findOne({
        chainId: chainId,
        collectionAddress: collectionAddress,
        tokenId: tokenId,
      });
      if (!nft) {
        let instance = initERC1155Single(chainId, collectionAddress);
        await addERC1155NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
      }
    }
    return;
  } catch (err) {
    console.log(err);
    return;
  }
};

const deactiveSellOrder = async (chainId, sellId) => {
  try {
    let sellOrder = await SellOrder.findOne({ chainId: chainId, sellId });

    if (!sellOrder) {
      throw Error('Sell Order not exist');
    }

    console.log('[DEACTIVE SELL ORDER] chainId: ' + chainId + ', sellId: ' + sellId);

    sellOrder.isActive = false;
    await sellOrder.save();
  } catch (err) {
    console.log(err);
    return;
  }
};

const updatePrice = async (chainId, sellId, price) => {
  try {
    sellId = parseInt(sellId);
    let sellOrder = await SellOrder.findOne({ chainId: chainId, sellId: sellId });

    if (!sellOrder) {
      throw Error('Sell Order not exist');
    }

    console.log('[UPDATE PRICE] chainId: ' + chainId + ', sellId: ' + sellId);

    sellOrder.price = parseFloat(utils.formatEther(price.toString()));
    await sellOrder.save();
  } catch (err) {
    console.log(err);
    return;
  }
};

const completeSellOrder = async (chainId, sellId, buyer, buyAmount) => {
  try {
    sellId = parseInt(sellId);
    buyer = buyer.toLowerCase();
    buyAmount = parseInt(buyAmount);

    let sellOrder = await SellOrder.findOne({ chainId: chainId, sellId: sellId });
    if (!sellOrder) {
      throw Error('Sell Order ' + sellId + ' not exist');
    }

    console.log('[COMPLETE SELL ORDER] chainId: ' + chainId + ', sellId: ' + sellId);

    let isActive, soldAmount;
    if (parseInt(sellOrder.soldAmount) + parseInt(buyAmount) == parseInt(sellOrder.amount)) {
      isActive = false;
      soldAmount = parseInt(sellOrder.soldAmount) + parseInt(buyAmount);
    }

    sellOrder.buyers.push(buyer);
    sellOrder.isActive = isActive;
    sellOrder.soldAmount = sellOrder.soldAmount;

    await sellOrder.save();
  } catch (err) {
    console.log(err);
    return;
  }
};

const FetchActiveSellOrder = async (chainId) => {
  try {
    const sellOrderList = getSellOrderListInstance(chainId);

    let availableSellOrderIdList = await sellOrderList.getAvailableSellOrdersIdList();

    for (let i = 0; i < availableSellOrderIdList.resultERC721.length; i += 200) {
      let listIds;
      if (i + 200 <= availableSellOrderIdList.resultERC721.length - 1) {
        listIds = availableSellOrderIdList.resultERC721.slice(i, i + 200);
      } else {
        listIds = availableSellOrderIdList.resultERC721.slice(
          i,
          availableSellOrderIdList.resultERC721.length
        );
      }

      let sellOrdersInfo = await sellOrderList.getSellOrdersByIdList(listIds);

      await Promise.all(
        sellOrdersInfo.map(async (sellOrder) => {
          let item = await SellOrder.findOne({
            chainId: chainId,
            sellId: parseInt(sellOrder.sellId),
          });
          if (!item) {
            await addSellOrder(chainId, sellOrder);
          }
        })
      );
    }

    for (let i = 0; i < availableSellOrderIdList.resultERC1155.length; i += 200) {
      let listIds;
      if (i + 200 <= availableSellOrderIdList.resultERC1155.length - 1) {
        listIds = availableSellOrderIdList.resultERC1155.slice(i, i + 200);
      } else {
        listIds = availableSellOrderIdList.resultERC1155.slice(
          i,
          availableSellOrderIdList.resultERC1155.length
        );
      }

      let sellOrdersInfo = await sellOrderList.getSellOrdersByIdList(listIds);

      await Promise.all(
        sellOrdersInfo.map(async (sellOrder) => {
          let item = await SellOrder.findOne({
            chainId: chainId,
            sellId: parseInt(sellOrder.sellId),
          });
          if (!item) {
            await addSellOrder(chainId, sellOrder);
          }
        })
      );
    }

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const UpdateSellOrderByChainId = async (chainId) => {
  try {
    let sellOrders = await SellOrder.find({ chainId: chainId });
    if (!sellOrders) {
      console.log('Empty');
      process.exit(0);
    }

    const sellOrderList = getSellOrderListInstance(chainId);

    let sellIds = [];

    await sellOrders.map((sellOrder) => {
      if (sellOrder.isActive == true) {
        sellIds.push(sellOrder.sellId);
      }
    });

    for (let i = 0; i < sellIds.length; i += 200) {
      let listIds;
      if (i + 200 <= sellIds.length - 1) {
        listIds = sellIds.slice(i, i + 200);
      } else {
        listIds = sellIds.slice(i, sellIds.length);
      }

      let sellOrdersInfo = await sellOrderList.getSellOrdersByIdList(listIds);

      await Promise.all(
        sellOrdersInfo.map(async (sellOrderInfo) => {
          await updateSellOrder(chainId, sellOrderInfo);
        })
      );
    }

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = {
  FetchActiveSellOrder,
  UpdateSellOrderByChainId,
  deactiveSellOrder,
  updateSellOrder,
  updatePrice,
  addSellOrder,
  completeSellOrder,
};
