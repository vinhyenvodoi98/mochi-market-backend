const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const ERC721NFT = require('../models/ERC721NFT');
const ERC1155NFT = require('../models/ERC1155NFT');

const axios = require('axios');
const { initERC721Single, initERC1155Single } = require('../helpers/blockchain');
const { getCollectionConfig } = require('./collection');

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

const addERC721NFT = async (chainId, instance, uriFormat, tokenId) => {
  try {
    let collectionAddress = instance.address.toLowerCase();
    chainId = chainId.toString();
    tokenId = tokenId.toString();

    let item = await ERC721NFT.findOne({
      chainId: chainId,
      collectionAddress: collectionAddress,
      tokenId: tokenId,
    });

    if (!!item) throw Error('Item already exist');

    // await instance.ownerOf(tokenId);

    let tokenURI;

    if (uriFormat.length > 0) {
      if (uriFormat.includes('{tokenUri}')) {
        let uriOnBlockchain = await instance.tokenURI(tokenId);
        tokenURI = uriFormat.replace('{tokenUri}', uriOnBlockchain);
      } else if (uriFormat.includes('{id}')) {
        tokenURI = uriFormat.replace('{id}', tokenId);
      }
    } else {
      tokenURI = await instance.tokenURI(tokenId);
      tokenURI = tokenURI.includes('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://storage.mochi.market/ipfs/')
        : tokenURI;
    }

    console.log('[ADD NFT] chainId:', chainId, 'address:', collectionAddress, 'tokenId: ', tokenId);

    let req = await axios.get(tokenURI);

    let thumb = 'none';

    let info = await axios.get(
      `https://api.covalenthq.com/v1/${chainId}/tokens/${collectionAddress}/nft_metadata/${tokenId}/?key=${process.env.COVALENT_KEY}`
    );

    for (let i = 0; i < info.data.data.items.length; i++) {
      if (collectionAddress == info.data.data.items[i].contract_address.toLowerCase())
        if (info.data.data.items[i].nft_data !== null)
          for (let j = 0; j < info.data.data.items[i].nft_data.length; j++) {
            if (info.data.data.items[i].nft_data[j].token_id == tokenId) {
              thumb = info.data.data.items[i].nft_data[j].external_data.image_256;
            }
          }
    }

    let newNFT = new ERC721NFT({
      chainId: chainId,
      tokenId: tokenId,
      tokenURI: tokenURI,
      name: !!req.data.name ? req.data.name : 'Unnamed',
      image: !!req.data.image ? req.data.image : !!req.data.imageUrl ? req.data.imageUrl : '',
      description: !!req.data.description ? req.data.description : '',
      attributes: !!req.data.attributes ? req.data.attributes : [],
      collectionAddress: collectionAddress,
      thumb: thumb,
    });

    await newNFT.save();
    return;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const addERC1155NFT = async (chainId, instance, uriFormat, tokenId) => {
  try {
    let collectionAddress = instance.address.toLowerCase();
    chainId = chainId.toString();
    tokenId = tokenId.toString();

    let item = await ERC1155NFT.findOne({
      chainId: chainId,
      collectionAddress: collectionAddress,
      tokenId: tokenId,
    });

    if (!!item) throw Error('Item already exist');

    let tokenURI;

    if (uriFormat.length > 0) {
      if (uriFormat.includes('{tokenUri}')) {
        let uriOnBlockchain = await instance.uri(tokenId);
        tokenURI = uriFormat.replace('{tokenUri}', uriOnBlockchain);
      } else if (uriFormat.includes('{id}')) {
        tokenURI = uriFormat.replace('{id}', tokenId);
      }
    } else {
      tokenURI = await instance.uri(tokenId);
      tokenURI = tokenURI.includes('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://storage.mochi.market/ipfs/')
        : tokenURI;
    }

    console.log('[ADD NFT] chainId:', chainId, 'address:', collectionAddress, 'tokenId: ', tokenId);

    let req = await axios.get(tokenURI);

    let thumb = 'none';

    let info = await axios.get(
      `https://api.covalenthq.com/v1/${chainId}/tokens/${collectionAddress}/nft_metadata/${tokenId}/?key=${process.env.COVALENT_KEY}`
    );

    for (let i = 0; i < info.data.data.items.length; i++) {
      if (collectionAddress == info.data.data.items[i].contract_address.toLowerCase())
        if (info.data.data.items[i].nft_data !== null)
          for (let j = 0; j < info.data.data.items[i].nft_data.length; j++) {
            if (info.data.data.items[i].nft_data[j].token_id == tokenId) {
              thumb = info.data.data.items[i].nft_data[j].external_data.image_256;
            }
          }
    }

    let newNFT = new ERC1155NFT({
      chainId: chainId,
      tokenId: tokenId,
      tokenURI: tokenURI,
      name: !!req.data.name ? req.data.name : 'Unnamed',
      image: !!req.data.image ? req.data.image : !!req.data.imageUrl ? req.data.imageUrl : '',
      description: !!req.data.description ? req.data.description : '',
      attributes: !!req.data.attributes ? req.data.attributes : [],
      collectionAddress: collectionAddress,
      thumb: thumb,
    });

    await newNFT.save();
    return;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const updateERC721NFT = async (chainId, instance, uriFormat, tokenId) => {
  try {
    let collectionAddress = instance.address.toLowerCase();
    chainId = chainId.toString();
    tokenId = tokenId.toString();

    a = tokenId;

    let tokenURI;

    if (uriFormat.length > 0) {
      if (uriFormat.includes('{tokenUri}')) {
        let uriOnBlockchain = await instance.tokenURI(tokenId);
        tokenURI = uriFormat.replace('{tokenUri}', uriOnBlockchain);
      } else if (uriFormat.includes('{id}')) {
        tokenURI = uriFormat.replace('{id}', tokenId);
      }
    } else {
      tokenURI = await instance.tokenURI(tokenId);
      tokenURI = tokenURI.includes('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://storage.mochi.market/ipfs/')
        : tokenURI;
    }

    console.log(
      '[UPDATE NFT] chainId:',
      chainId,
      'address:',
      collectionAddress,
      'tokenId: ',
      tokenId
    );

    let req = await axios.get(tokenURI);

    let thumb = 'none';

    let info = await axios.get(
      `https://api.covalenthq.com/v1/${chainId}/tokens/${collectionAddress}/nft_metadata/${tokenId}/?key=${process.env.COVALENT_KEY}`
    );

    for (let i = 0; i < info.data.data.items.length; i++) {
      if (collectionAddress == info.data.data.items[i].contract_address.toLowerCase())
        if (info.data.data.items[i].nft_data !== null)
          for (let j = 0; j < info.data.data.items[i].nft_data.length; j++) {
            if (info.data.data.items[i].nft_data[j].token_id == tokenId) {
              thumb = info.data.data.items[i].nft_data[j].external_data.image_256;
            }
          }
    }

    let item = await ERC721NFT.findOne({
      chainId: chainId,
      collectionAddress: collectionAddress,
      tokenId: tokenId,
    });

    item.tokenURI = tokenURI;
    item.name = !!req.data.name ? req.data.name : 'Unnamed';
    item.image = !!req.data.image ? req.data.image : !!req.data.imageUrl ? req.data.imageUrl : '';
    item.description = !!req.data.description ? req.data.description : '';
    item.attributes = !!req.data.attributes ? req.data.attributes : [];
    item.thumb = thumb;

    await item.save();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const updateERC1155NFT = async (chainId, instance, uriFormat, tokenId) => {
  try {
    let collectionAddress = instance.address.toLowerCase();
    chainId = chainId.toString();
    tokenId = tokenId.toString();

    let tokenURI;
    if (uriFormat.length > 0) {
      if (uriFormat.includes('{tokenUri}')) {
        let uriOnBlockchain = await instance.uri(tokenId);
        tokenURI = uriFormat.replace('{tokenUri}', uriOnBlockchain);
      } else if (uriFormat.includes('{id}')) {
        tokenURI = uriFormat.replace('{id}', tokenId);
      }
    } else {
      tokenURI = await instance.uri(tokenId);
      tokenURI = tokenURI.includes('ipfs://')
        ? tokenURI.replace('ipfs://', 'https://storage.mochi.market/ipfs/')
        : tokenURI;
    }

    console.log(
      '[UPDATE NFT] chainId:',
      chainId,
      'address:',
      collectionAddress,
      'tokenId: ',
      tokenId
    );

    let req = await axios.get(tokenURI);

    let thumb = 'none';

    let info = await axios.get(
      `https://api.covalenthq.com/v1/${chainId}/tokens/${collectionAddress}/nft_metadata/${tokenId}/?key=${process.env.COVALENT_KEY}`
    );

    for (let i = 0; i < info.data.data.items.length; i++) {
      if (collectionAddress == info.data.data.items[i].contract_address.toLowerCase())
        if (info.data.data.items[i].nft_data !== null)
          for (let j = 0; j < info.data.data.items[i].nft_data.length; j++) {
            if (info.data.data.items[i].nft_data[j].token_id == tokenId) {
              thumb = info.data.data.items[i].nft_data[j].external_data.image_256;
            }
          }
    }

    let item = await ERC1155NFT.findOne({
      chainId: chainId,
      collectionAddress: collectionAddress,
      tokenId: tokenId,
    });

    item.tokenURI = tokenURI;
    item.name = !!req.data.name ? req.data.name : 'Unnamed';
    item.image = !!req.data.image ? req.data.image : !!req.data.imageUrl ? req.data.imageUrl : '';
    item.description = !!req.data.description ? req.data.description : '';
    item.attributes = !!req.data.attributes ? req.data.attributes : [];
    item.thumb = thumb;

    await item.save();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const initERC721NFT = async (chainId, collectionInfo) => {
  try {
    let collectionAddress = collectionInfo.address.toLowerCase();

    let collectionConfig = getCollectionConfig(chainId, collectionAddress);

    let tokenIdsInfo = collectionConfig.tokenIds;

    if (tokenIdsInfo == null) return;

    let tokenIds;
    if (tokenIdsInfo.length == undefined) {
      let min = tokenIdsInfo.min;
      let max = tokenIdsInfo.max;
      tokenIds = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
        return idx + min;
      });
    } else {
      tokenIds = tokenIdsInfo;
    }

    let instance = initERC721Single(chainId, collectionAddress);

    await Promise.all(
      tokenIds.map(async (tokenId) => {
        let item = await ERC721NFT.findOne({
          chainId: chainId,
          collectionAddress: collectionAddress,
          tokenId: tokenId,
        });
        if (!item) await addERC721NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
      })
    );

    return;
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const initERC1155NFT = async (chainId, collectionInfo) => {
  try {
    let collectionAddress = collectionInfo.address.toLowerCase();

    let collectionConfig = getCollectionConfig(chainId, collectionAddress);

    let tokenIdsInfo = collectionConfig.tokenIds;

    if (tokenIdsInfo == null) return;

    let tokenIds;
    if (tokenIdsInfo.length == undefined) {
      let min = tokenIdsInfo.min;
      let max = tokenIdsInfo.max;
      tokenIds = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
        return idx + min;
      });
    } else {
      tokenIds = tokenIdsInfo;
    }

    let instance = initERC1155Single(chainId, collectionAddress);

    await Promise.all(
      tokenIds.map(async (tokenId) => {
        let item = await ERC1155NFT.findOne({
          chainId: chainId,
          collectionAddress: collectionAddress,
          tokenId: tokenId,
        });
        if (!item) await addERC1155NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
      })
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const InitERC721NFTByCollectionAddress = async (chainId, collectionAddress) => {
  try {
    collectionAddress = collectionAddress.toLowerCase();
    let collectionInfo = await Collection.findOne({ address: collectionAddress, chainId: chainId });

    if (!collectionInfo) throw Error('Invalid collection address');

    if (collectionInfo.type !== 'ERC721Token') throw Error('Invalid collection type');

    await initERC721NFT(chainId, collectionInfo);

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const InitERC1155NFTByCollectionAddress = async (chainId, collectionAddress) => {
  try {
    collectionAddress = collectionAddress.toLowerCase();
    let collectionInfo = await Collection.findOne({ address: collectionAddress, chainId: chainId });

    if (!collectionInfo) throw Error('Invalid collection address');

    if (collectionInfo.type !== 'ERC1155Token') {
      throw Error('Invalid collection type');
    }

    await initERC1155NFT(chainId, collectionInfo);

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const UpdateERC721NFTByCollectionAddress = async (chainId, collectionAddress) => {
  try {
    collectionAddress = collectionAddress.toLowerCase();
    let collectionInfo = await Collection.findOne({ address: collectionAddress, chainId: chainId });

    if (!collectionInfo) throw Error('Invalid collection address');

    if (collectionInfo.type !== 'ERC721Token') throw Error('Invalid collection type');

    let items = await ERC721NFT.find({ chainId: chainId, collectionAddress: collectionAddress });
    let instance = initERC721Single(chainId, collectionAddress);
    await Promise.all(
      items.map(async (item) => {
        await updateERC721NFT(chainId, instance, collectionInfo.uriFormat, item.tokenId);
      })
    );

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};


const UpdateERC721NFTByCollectionAddressAndTokenId = async (chainId, collectionAddress, tokenId) => {
  try {
    collectionAddress = collectionAddress.toLowerCase();
    let collectionInfo = await Collection.findOne({ address: collectionAddress, chainId: chainId });

    if (!collectionInfo) throw Error('Invalid collection address');

    if (collectionInfo.type !== 'ERC721Token') throw Error('Invalid collection type');

    let items = await ERC721NFT.findOne({ chainId: chainId, collectionAddress: collectionAddress, tokenId: tokenId });
    let instance = initERC721Single(chainId, collectionAddress);
    if (items) {
      await updateERC721NFT(chainId, instance, collectionInfo.uriFormat, tokenId);
    } else {
      await addERC721NFT(chainId, instance, collectionInfo.uriFormat, tokenId)
    }


    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const UpdateERC1155NFTByCollectionAddress = async (chainId, collectionAddress) => {
  try {
    collectionAddress = collectionAddress.toLowerCase();
    let collectionInfo = await Collection.findOne({ address: collectionAddress, chainId: chainId });

    if (!collectionInfo) throw Error('Invalid collection address');

    if (collectionInfo.type !== 'ERC1155Token') throw Error('Invalid collection type');

    let items = await ERC1155NFT.find({ chainId: chainId, collectionAddress: collectionAddress });
    let instance = initERC1155Single(chainId, collectionAddress);
    await Promise.all(
      items.map(async (item) => {
        await updateERC1155NFT(chainId, instance, collectionInfo, item.tokenId);
      })
    );

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

const InitAllNFT = async (chainId) => {
  try {
    let erc721Collections = await Collection.find({ chainId: chainId, type: 'ERC721Token' });
    let erc1155Collections = await Collection.find({ chainId: chainId, type: 'ERC1155Token' });
    await Promise.all(
      erc721Collections.map(async (collectionInfo) => {
        await initERC721NFT(chainId, collectionInfo);
      })
    );

    await Promise.all(
      erc1155Collections.map(async (collectionInfo) => {
        await initERC1155NFT(chainId, collectionInfo);
      })
    );

    console.log('DONE');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = {
  InitAllNFT,
  InitERC721NFTByCollectionAddress,
  InitERC1155NFTByCollectionAddress,
  UpdateERC721NFTByCollectionAddress,
  UpdateERC1155NFTByCollectionAddress,
  addERC721NFT,
  addERC1155NFT,
  updateERC721NFT,
  updateERC1155NFT,
  UpdateERC721NFTByCollectionAddressAndTokenId
};
