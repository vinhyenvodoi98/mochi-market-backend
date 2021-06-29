const mongoose = require('mongoose');
const axios = require('axios');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');
const User = require('../models/User');
const SellOrder = require('../models/SellOrder');

const { getAcceptedNfts, initERC721, getOwner } = require('../helpers/blockchain');
const { getSellOrderListInstance } = require('../utils/getContractInstance');
const { utils } = require('ethers');

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

const fetchErc721 = async () => {
  const nftList = await getAcceptedNfts();
  const erc721Instances = await initERC721(nftList);

  let getERC721 = async (instance) => {
    return new Promise(async (resolve, reject) => {
      try {
        let ERC721token = {};

        // Save ERC721 basic info
        ERC721token.name = await instance.name();
        ERC721token.symbol = await instance.symbol();
        ERC721token.addressToken = instance.address.toLowerCase();

        let nft = new NFT({
          name: ERC721token.name,
          symbol: ERC721token.symbol,
          address: ERC721token.addressToken.toLowerCase(),
          onModel: 'ERC721Token',
        });

        let recordedNFT = await nft.save();

        ERC721token.tokens = [];
        // max 999999 id, it will break if undefined
        for (let i = 1; i < 999999; i++) {
          let tokenURI;
          try {
            tokenURI = await instance.tokenURI(i);
          } catch (error) {
            break;
          }
          if (tokenURI) {
            let cid = tokenURI.split('/');
            tokenURI = 'https://storage.mochi.market/ipfs/' + cid[cid.length - 1];
            try {
              let req = await axios.get(tokenURI);

              let erc721 = new ERC721Token({
                tokenId: i,
                tokenURI: tokenURI,
                name: !!req.data.name ? req.data.name : 'Unnamed',
                image: !!req.data.image ? req.data.image : '',
                description: !!req.data.description ? req.data.description : '',
                nft: recordedNFT.id,
              });

              // save ERC721
              let recordedERC721 = await erc721.save();

              // update NFT
              await NFT.updateOne(
                { _id: recordedNFT._id },
                { $push: { tokens: recordedERC721._id } }
              );

              // update owner
              let ownerAddress = await getOwner(ERC721token.addressToken, i);
              console.log({ ownerAddress });
              // update owner

              await User.findOneAndUpdate(
                { address: ownerAddress.toLowerCase() },
                { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            } catch (error) {
              reject(error);
              console.log(error);
            }
          } else {
            reject();
            break;
          }
        }
        resolve();
      } catch (err) {
        reject();
      }
    });
  };

  await Promise.all(
    erc721Instances.map(async (instance) => {
      return await getERC721(instance);
    })
  );

  console.log('DONE');
  process.exit(0);
};

const fetchSellOrder = async () => {
  const sellOrderList = getSellOrderListInstance();
  let availableSellOrderIdList = await sellOrderList.getAvailableSellOrdersIdList();
  let availableSellOrders = await sellOrderList.getSellOrdersByIdList(
    availableSellOrderIdList.resultERC721
  );

  const saveSellOrderList = (availableSellOrder) => {
    return new Promise(async (resolve) => {
      let nft = await NFT.findOne({ address: availableSellOrder.nftAddress.toLowerCase() });

      let sellOrder = new SellOrder({
        sellId: availableSellOrder.sellId.toString(),
        nftAddress: nft._id,
        tokenId: parseInt(availableSellOrder.tokenId.toString()),
        amount: availableSellOrder.amount.toString(),
        soldAmount: availableSellOrder.soldAmount.toString(),
        seller: availableSellOrder.seller.toLowerCase(),
        price: parseFloat(utils.formatEther(availableSellOrder.price.toString())),
        token: availableSellOrder.token.toLowerCase(),
        isActive: availableSellOrder.isActive,
        sellTime: availableSellOrder.sellTime.toString(),
        buyers: availableSellOrder.buyers,
        buyTimes: availableSellOrder.buyTimes,
      });
      console.log('sellOrderId: ' + sellOrder.sellId);
      let sellOrderId = await sellOrder.save();
      resolve(sellOrderId);
    });
  };

  await Promise.all(
    availableSellOrders.map(async (availableSellOrder) => {
      return await saveSellOrderList(availableSellOrder);
    })
  );
};

const main = async () => {
  var myArgs = process.argv.slice(2);
  if (myArgs[0] === 'erc721') await fetchErc721();
  // else if(myArgs[0]==='erc1155') ...
  else if (myArgs[0] === 'sellOrder') await fetchSellOrder();
  process.exit(1);
};

main();
