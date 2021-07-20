const mongoose = require('mongoose');
const axios = require('axios');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');
const ERC1155Token = require('../models/ERC1155Token');
const User = require('../models/User');
const SellOrder = require('../models/SellOrder');

const {
  getAcceptedNfts,
  initERC721,
  getOwner,
  initERC721Single,
  initERC1155Single,
} = require('../helpers/blockchain');
const { getSellOrderListInstance, getNftListInstance } = require('../utils/getContractInstance');
const { utils } = require('ethers');
const { downQuality } = require('../utils/reduceImage');

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

let updateThumb = async (image, imgType) => {
  return new Promise(async (resolve, reject) => {
    try {
      let thumb = await downQuality(image, imgType);
      resolve(thumb);
    } catch (error) {
      reject(false);
    }
  });
};

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
      // it will break if undefined
      for (let i = 1; ; i++) {
        let tokenURI;
        try {
          tokenURI = await instance.tokenURI(i);
          if (tokenURI.length === 0) break;
        } catch (error) {
          break;
        }
        if (tokenURI) {
          try {
            let req = await axios.get(tokenURI);

            let erc721 = new ERC721Token({
              tokenId: i,
              tokenURI: tokenURI,
              name: !!req.data.name ? req.data.name : 'Unnamed',
              image: !!req.data.image ? req.data.image : '',
              description: !!req.data.description ? req.data.description : '',
              attributes: !!req.data.attributes ? req.data.attributes : [],
              nft: recordedNFT.id,
            });

            // save ERC721
            let recordedERC721 = await erc721.save();

            // update NFT
            await NFT.updateOne(
              { _id: recordedNFT._id },
              { $push: { tokens: recordedERC721._id } }
            );
            console.log('nft : ' + ERC721token.name + ': id : ' + i);
            // update owner
            let ownerAddress = await getOwner(ERC721token.addressToken, i);

            // update owner
            await User.findOneAndUpdate(
              { address: ownerAddress.toLowerCase() },
              { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } catch (error) {
            let erc721 = new ERC721Token({
              tokenId: i,
              tokenURI: tokenURI,
              name: 'Unnamed',
              image: '',
              description: '',
              attributes: [],
              nft: recordedNFT.id,
            });

            // save ERC721
            let recordedERC721 = await erc721.save();

            // update NFT
            await NFT.updateOne(
              { _id: recordedNFT._id },
              { $push: { tokens: recordedERC721._id } }
            );
            console.log('nft : ' + ERC721token.name + ': id : ' + i);
            // update owner
            let ownerAddress = await getOwner(ERC721token.addressToken, i);

            // update owner
            await User.findOneAndUpdate(
              { address: ownerAddress.toLowerCase() },
              { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
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

const fetchErc1155 = async (nftAddress) => {
  const instance = await initERC1155Single(nftAddress);
  // Save ERC721 basic info
  let name = await instance.name();
  let symbol = await instance.symbol();
  let addressToken = instance.address.toLowerCase();

  let nft = new NFT({
    name,
    symbol,
    address: addressToken,
    onModel: 'ERC1155Token',
  });

  await nft.save();

  for (let i = 1; ; i++) {
    let tokenURI;
    try {
      tokenURI = await instance.uri(i);
      if (tokenURI.length === 0) break;
    } catch (error) {
      break;
    }
    if (tokenURI) {
      let req = await axios.get(tokenURI);

      let erc1155 = new ERC1155Token({
        tokenId: i,
        tokenURI: tokenURI,
        name: !!req.data.name ? req.data.name : 'Unnamed',
        image: !!req.data.image ? req.data.image : '',
        description: !!req.data.description ? req.data.description : '',
        attributes: !!req.data.attributes ? req.data.attributes : [],
        nft: nft.id,
      });

      // save ERC1155
      await erc1155.save();

      // update NFT
      await NFT.updateOne({ _id: nft._id }, { $push: { tokens: erc1155._id } });
      console.log(`Erc1155 name : ${name} tokenId : ${i}`);
    }
  }
};

const fetchErc721 = async () => {
  const nftList = await getAcceptedNfts();
  const erc721Instances = await initERC721(nftList);

  await Promise.all(
    erc721Instances.map(async (instance) => {
      return await getERC721(instance);
    })
  );

  console.log('DONE');
  process.exit(0);
};

const fetchNftByAddress = async (nftAddress) => {
  const instance = await initERC721Single(nftAddress);
  await getERC721(instance);
  console.log('DONE');
  process.exit(0);
};

const fetchSellOrder = async () => {
  const sellOrderList = getSellOrderListInstance();

  let availableSellOrderIdList = await sellOrderList.getAvailableSellOrdersIdList();
  let availableSellOrders721 = await sellOrderList.getSellOrdersByIdList(
    availableSellOrderIdList.resultERC721
  );
  let availableSellOrders1155 = await sellOrderList.getSellOrdersByIdList(
    availableSellOrderIdList.resultERC1155
  );

  let availableSellOrders = availableSellOrders721.concat(availableSellOrders1155);

  const saveSellOrderList = (availableSellOrder) => {
    return new Promise(async (resolve, reject) => {
      let nft = await NFT.findOne(
        { address: availableSellOrder.nftAddress.toLowerCase() },
        'onModel'
      );
      if (!!nft) {
        let sellOrder = new SellOrder({
          sellId: availableSellOrder.sellId.toString(),
          nftAddress: nft._id,
          address: availableSellOrder.nftAddress.toLowerCase(),
          onModel: nft.onModel.toString(),
          tokenId: parseInt(availableSellOrder.tokenId.toString()),
          amount: availableSellOrder.amount.toString(),
          soldAmount: availableSellOrder.soldAmount.toString(),
          seller: availableSellOrder.seller.toLowerCase(),
          price: parseFloat(utils.formatEther(availableSellOrder.price.toString())),
          token: availableSellOrder.token.toLowerCase(),
          isActive: availableSellOrder.isActive,
          sellTime: parseInt(availableSellOrder.sellTime.toString()),
          buyers: availableSellOrder.buyers,
          buyTimes: availableSellOrder.buyTimes,
        });
        console.log('sellOrderId: ' + sellOrder.sellId);
        let sellOrderId = await sellOrder.save();
        resolve(sellOrderId);
      } else reject('');
    });
  };

  await Promise.all(
    availableSellOrders.map(async (availableSellOrder) => {
      return await saveSellOrderList(availableSellOrder);
    })
  );
};

const reduceImageQuality721 = async (nftAddress, tokenId) => {
  var ercImages;
  if (!nftAddress) ercImages = await ERC721Token.find({}, 'image tokenId thumb');
  else {
    if (!tokenId) {
      ercImages = await NFT.find(
        { address: nftAddress.toLowerCase() },
        'tags name symbol address onModel'
      ).populate({
        path: 'tokens',
        model: ERC721Token,
        select: ['tokenId', 'image', 'thumb'],
      });

      ercImages = ercImages[0].tokens;
    } else {
      ercImages = await NFT.find(
        { address: nftAddress.toLowerCase() },
        'tags name symbol address onModel'
      ).populate({
        path: 'tokens',
        model: ERC721Token,
        match: { tokenId },
        select: ['tokenId', 'image', 'thumb'],
      });

      ercImages = ercImages[0].tokens;
    }
  }

  for (let i = 0; i < ercImages.length; i++) {
    if (
      !!ercImages[i].image &&
      ercImages[i].image.length > 0 &&
      (!ercImages[i].thumb || ercImages[i].thumb.length === 0)
    ) {
      let thumb = await updateThumb(ercImages[i].image);
      if (thumb) {
        await ERC721Token.findOneAndUpdate({ _id: ercImages[i]._id }, { thumb });
        console.log('Down quality tokenId :' + ercImages[i].tokenId);
      }
    }
  }

  console.log('DONE');
  process.exit(0);
};

const reduceImageQuality1155 = async (nftAddress, tokenId) => {
  var ercImages;
  if (!nftAddress) ercImages = await ERC1155Token.find({}, 'image tokenId thumb');
  else {
    if (!tokenId) {
      ercImages = await NFT.find(
        { address: nftAddress.toLowerCase() },
        'tags name symbol address onModel'
      ).populate({
        path: 'tokens',
        model: ERC1155Token,
        select: ['tokenId', 'image', 'thumb'],
      });

      ercImages = ercImages[0].tokens;
    } else {
      ercImages = await NFT.find(
        { address: nftAddress.toLowerCase() },
        'tags name symbol address onModel'
      ).populate({
        path: 'tokens',
        model: ERC1155Token,
        match: { tokenId },
        select: ['tokenId', 'image', 'thumb'],
      });

      ercImages = ercImages[0].tokens;
    }
  }

  for (let i = 0; i < ercImages.length; i++) {
    if (
      !!ercImages[i].image &&
      ercImages[i].image.length > 0 &&
      (!ercImages[i].thumb || ercImages[i].thumb.length === 0)
    ) {
      let thumb = await updateThumb(ercImages[i].image, 'gif');
      if (thumb) {
        await ERC1155Token.findOneAndUpdate({ _id: ercImages[i]._id }, { thumb });
        console.log('Down quality tokenId :' + ercImages[i].tokenId);
      }
    }
  }

  console.log('DONE');
  process.exit(0);
};

// update the nft undefined
const updateUndefinedImage = async (nftAddress) => {
  // if not enter nftAddress
  let undefinedImg;
  if (!!nftAddress) {
    undefinedImg = await NFT.find(
      { address: nftAddress.toLowerCase() },
      'address onModel'
    ).populate({
      path: 'tokens',
      model: ERC721Token,
      match: { name: 'Unnamed' },
      select: ['tokenURI', 'name', 'tokenId'],
    });

    undefinedImg = undefinedImg[0].tokens;
  } else {
    undefinedImg = await ERC721Token.find({ name: 'Unnamed' }, 'tokenURI name tokenId');
  }

  for (let i = 0; i < undefinedImg.length; i++) {
    let req = await axios.get(undefinedImg[i].tokenURI);
    let thumb = '';
    if (!!req.data.image) thumb = await updateThumb(req.data.image);

    if (!!req.data.name && req.data.name !== 'Unnamed') {
      console.log('i : ' + i);

      await ERC721Token.updateOne(
        { _id: undefinedImg[i]._id },
        {
          name: !!req.data.name ? req.data.name : 'Unnamed',
          image: !!req.data.image ? req.data.image : '',
          description: !!req.data.description ? req.data.description : '',
          attributes: !!req.data.attributes ? req.data.attributes : [],
          thumb,
        }
      );
      console.log('nft : ' + undefinedImg[i].name + ': id : ' + undefinedImg[i].tokenId);
    }
  }
};

const main = async () => {
  var myArgs = process.argv.slice(2);
  if (myArgs[0] === 'erc721') await fetchErc721();
  else if (myArgs[0] === 'erc1155') await fetchErc1155(myArgs[1]);
  else if (myArgs[0] === 'nftAddress') await fetchNftByAddress(myArgs[1]);
  else if (myArgs[0] === 'imgDown721') await reduceImageQuality721(myArgs[1], myArgs[2]);
  else if (myArgs[0] === 'imgDown1155') await reduceImageQuality1155(myArgs[1], myArgs[2]);
  else if (myArgs[0] === 'sellOrder') await fetchSellOrder();
  else if (myArgs[0] === 'updateUndefined') await updateUndefinedImage(myArgs[1]);
  process.exit(1);
};

main();
