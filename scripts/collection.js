const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const { initERC721Single, initERC1155Single, getAllNFTAddress } = require('../helpers/blockchain');
const { COLLECTION_CONSTANT } = require('../helpers/constant');

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

const InitCollectionsInfo = async (chainId) => {
  try {
    const { erc721Addresses, erc1155Addresses } = await getAllNFTAddress(chainId);

    await Promise.all(
      erc721Addresses.map(async (address) => {
        let exist = await Collection.findOne({
          chainId: chainId,
          address: address.toLowerCase(),
        });
        if (!!exist) {
          await updateCollectionERC721(chainId, address);
        } else {
          await addCollectionERC721(chainId, address);
        }
      })
    );
    await Promise.all(
      erc1155Addresses.map(async (address) => {
        let exist = await Collection.findOne({
          chainId: chainId,
          address: address.toLowerCase(),
        });

        if (!!exist) {
          await updateCollectionERC1155(chainId, address);
        } else {
          await addCollectionERC1155(chainId, address);
        }
      })
    );

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const addCollectionERC721 = async (chainId, collectionAddress) => {
  try {
    collectionAddress = collectionAddress.toLowerCase();

    let exist = await Collection.findOne({
      address: collectionAddress,
      chainId: chainId,
    });

    if (!!exist) {
      throw Error('Collection already exist!');
    }

    console.log('[ADD ERC721 COLLECTION] chainId:', chainId, 'address:', collectionAddress);

    let instance = initERC721Single(chainId, collectionAddress);

    let { name, symbol, uriFormat, isAccepted } = await checkCollectionInfo(chainId, instance);

    let collection = new Collection({
      chainId: chainId,
      name: name,
      symbol: symbol,
      address: collectionAddress,
      type: 'ERC721Token',
      uriFormat: uriFormat,
      isAccepted: isAccepted,
    });

    await collection.save();
  } catch (err) {
    console.log(err);
    return;
  }
};

const addCollectionERC1155 = async (chainId, collectionAddress) => {
  collectionAddress = collectionAddress.toLowerCase();

  let exist = await Collection.findOne({
    address: collectionAddress,
    chainId: chainId,
  });

  if (!!exist) {
    throw Error('Collection already exist!');
  }

  console.log('[ADD ERC1155 COLLECTION] chainId: ', chainId, ' address: ', collectionAddress);

  let instance = initERC1155Single(chainId, collectionAddress);

  let { name, symbol, uriFormat, isAccepted } = await checkCollectionInfo(chainId, instance);

  let collection = new Collection({
    chainId: chainId,
    name: name,
    symbol: symbol,
    address: collectionAddress,
    type: 'ERC1155Token',
    uriFormat: uriFormat,
    isAccepted: isAccepted,
  });

  await collection.save();
};

const updateCollectionERC721 = async (chainId, collectionAddress) => {
  collectionAddress = collectionAddress.toLowerCase();

  console.log('[UPDATE ERC721 COLLECTION] chainId:', chainId, 'address:', collectionAddress);

  let instance = initERC721Single(chainId, collectionAddress);

  let { name, symbol, uriFormat, isAccepted } = await checkCollectionInfo(chainId, instance);

  await Collection.findOneAndUpdate(
    { chainId: chainId, address: collectionAddress },
    {
      name: name,
      symbol: symbol,
      uriFormat: uriFormat,
      isAccepted: isAccepted,
    }
  );

  return;
};

const updateCollectionERC1155 = async (chainId, collectionAddress) => {
  collectionAddress = collectionAddress.toLowerCase();

  console.log('[UPDATE ERC1155 COLLECTION] chainId:', chainId, ' address:', collectionAddress);

  let instance = initERC1155Single(chainId, collectionAddress);

  let { name, symbol, uriFormat, isAccepted } = await checkCollectionInfo(chainId, instance);

  await Collection.findOneAndUpdate(
    { chainId: chainId, address: collectionAddress },
    {
      name: name,
      symbol: symbol,
      uriFormat: uriFormat,
      isAccepted: isAccepted,
    }
  );

  return;
};

const checkCollectionInfo = async (chainId, instance) => {
  let collectionAddress = instance.address.toLowerCase();

  let collectionConfig = getCollectionConfig(chainId, collectionAddress);
  let name, symbol, uriFormat;

  if (collectionConfig.name == null || collectionConfig.symbol == null) {
    name = await instance.name();
    symbol = await instance.symbol();
  }

  uriFormat = collectionConfig.uriFormat == null ? '' : collectionConfig.uriFormat;
  isAccepted = collectionConfig.isAccepted == null ? false : collectionConfig.isAccepted;

  return {
    name: name,
    symbol: symbol,
    uriFormat: uriFormat,
    isAccepted: isAccepted,
  };
};

const getCollectionConfig = (chainId, collectionAddress) => {
  collectionAddress = collectionAddress.toLowerCase();

  for (let i = 0; i < COLLECTION_CONSTANT.length; i++) {
    if (
      chainId == COLLECTION_CONSTANT[i].chainId &&
      COLLECTION_CONSTANT[i].address === collectionAddress
    ) {
      return {
        chainId: chainId,
        address: COLLECTION_CONSTANT[i].address ? COLLECTION_CONSTANT[i].address : null,
        name: COLLECTION_CONSTANT[i].name ? COLLECTION_CONSTANT[i].name : null,
        symbol: COLLECTION_CONSTANT[i].symbol ? COLLECTION_CONSTANT.symbol : null,
        type: COLLECTION_CONSTANT[i].type ? COLLECTION_CONSTANT.type : null,
        tokenIds: COLLECTION_CONSTANT[i].tokenIds ? COLLECTION_CONSTANT[i].tokenIds : null,
        uriFormat: COLLECTION_CONSTANT[i].uriFormat ? COLLECTION_CONSTANT[i].uriFormat : null,
        isAccepted: COLLECTION_CONSTANT[i].isAccepted ? COLLECTION_CONSTANT[i].isAccepted : null,
      };
    }
  }

  return {
    chainId: null,
    address: null,
    name: null,
    symbol: null,
    type: null,
    tokenIds: null,
    uriFormat: null,
    isAccepted: null,
  };
};

module.exports = {
  InitCollectionsInfo,
  getCollectionConfig,
  addCollectionERC721,
  addCollectionERC1155,
};
