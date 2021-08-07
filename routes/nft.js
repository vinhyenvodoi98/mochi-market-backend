const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const ERC721NFT = require('../models/ERC721NFT');
const ERC1155NFT = require('../models/ERC1155NFT');
const { isAddress, validChainId } = require('../helpers/verifyAddress');

const { initERC721Single, initERC1155Single } = require('../helpers/blockchain');
const {
  addERC721NFT,
  addERC1155NFT,
  updateERC721NFT,
  updateERC1155NFT,
} = require('../scripts/nft');

router.get('/:chainId/:address', async (req, res) => {
  try {
    let { address, chainId } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let collection, nfts, result;

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);

    if (limit > 20) {
      throw new Errow();
    }

    collection = await Collection.findOne(
      { address, chainId },
      { type: 1, isVerify: 1, name: 1, symbol: 1, address: 1, uriFormat: 1, _id: 0 }
    );

    if (!collection) return res.json();

    if (collection.type === 'ERC721Token') {
      nfts = await ERC721NFT.find(
        { collectionAddress: address, chainId: chainId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      )
        .skip(skip)
        .limit(limit);
    } else if (collection.type === 'ERC1155Token') {
      nfts = await ERC1155NFT.find(
        { collectionAddress: address, chainId: chainId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      )
        .skip(skip)
        .limit(limit);
    }
    result = await nfts.map((nft) => {
      return {
        chainId: nft.chainId,
        collectionAddress: address,
        collectionName: collection.name,
        name: nft.name,
        tokenId: nft.tokenId,
        tokenURI: nft.tokenURI,
        image: nft.image,
        description: nft.description,
        thumb: nft.thumb,
        attributes: nft.attributes,
      };
    });

    return res.json(result);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

router.get('/:chainId/:address/:tokenId', async (req, res) => {
  try {
    var { address, chainId, tokenId } = req.params;
    address = address.toLowerCase();

    if (!isAddress(address)) {
      return res.status(400).json({ msg: 'Address is not valid' });
    }
    if (!validChainId(chainId)) {
      return res.status(400).json({ msg: 'ChainId is not valid' });
    }

    let nft = await checkNft(chainId, address, tokenId);
    return res.json(nft);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

const checkNft = async (chainId, address, tokenId) => {
  address = address.toLowerCase();

  let collection = await Collection.findOne({ address: address, chainId: chainId });
  if (!collection) {
    return null;
  }

  let nft;

  if (collection.type === 'ERC721Token') {
    nft = await ERC721NFT.findOne(
      { chainId: chainId, collectionAddress: address, tokenId: tokenId },
      { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
    );

    if (!nft) {
      let instance = initERC721Single(chainId, address);
      await addERC721NFT(chainId, instance, collection.uriFormat, tokenId);

      nft = await ERC721NFT.findOne(
        { chainId: chainId, collectionAddress: address, tokenId: tokenId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );
    } else if (!nft.thumb) {
      let instance = initERC721Single(chainId, address);
      await updateERC721NFT(chainId, instance, collection.uriFormat, tokenId);

      nft = await ERC721NFT.findOne(
        { chainId: chainId, collectionAddress: address, tokenId: tokenId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );
    }
  } else if (collection.type === 'ERC1155Token') {
    nft = await ERC1155NFT.findOne(
      { chainId: chainId, collectionAddress: address, tokenId: tokenId },
      { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
    );

    if (!nft) {
      let instance = initERC1155Single(chainId, address);
      await addERC1155NFT(chainId, instance, collection.uriFormat, tokenId);
      nft = await ERC1155NFT.findOne(
        { chainId: chainId, collectionAddress: address, tokenId: tokenId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );
    } else if (!nft.thumb) {
      let instance = initERC1155Single(chainId, address);
      await updateERC1155NFT(chainId, instance, collection.uriFormat, tokenId);

      nft = await ERC1155NFT.findOne(
        { chainId: chainId, collectionAddress: address, tokenId: tokenId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );
    }
  }
  return {
    collectionName: collection.name,
    collectionAddress: nft.collectionAddress,
    chainId: nft.chainId,
    tokenId: nft.tokenId,
    name: nft.name,
    image: nft.image,
    description: nft.description,
    thumb: nft.thumb,
    tokenURI: nft.tokenURI,
    attributes: nft.attributes,
  };
};

module.exports = router;
