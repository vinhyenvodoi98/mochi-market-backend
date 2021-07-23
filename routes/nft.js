const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const ERC721NFT = require('../models/ERC721NFT');
const ERC1155NFT = require('../models/ERC1155NFT');

const { initERC721Single, initERC1155Single } = require('../helpers/blockchain');
const { addERC721NFT, addERC1155NFT } = require('../scripts/nft');

router.get('/:chainId/:address', async (req, res) => {
  try {
    let { address, chainId } = req.params;
    address = address.toLowerCase();
    let collection, nfts;

    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);

    if (limit > 20) {
      throw new Errow();
    }

    collection = await Collection.findOne(
      { address, chainId },
      { type: 1, isVerify: 1, name: 1, symbol: 1, address: 1, uriFormat: 1, _id: 0 }
    );

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

    return res.json({ nfts });
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

router.get('/:chainId/:address/:tokenId', async (req, res) => {
  try {
    var { address, chainId, tokenId } = req.params;
    address = address.toLowerCase();
    let nft = await checkNft(chainId, address, tokenId);
    return res.json(nft);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

const checkNft = async (chainId, address, tokenId) => {
  address = address.toLowerCase();

  let nft;

  let collection = await Collection.findOne({ address: address, chainId: chainId });
  if (collection == null) {
    return;
  }

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
    }
    return nft;
  } else if (collection.type === 'ERC1155Token') {
    nft = await ERC1155NFT.findOne(
      { chainId: chainId, collectionAddress: address, tokenId: tokenId },
      { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
    );

    if (nft == null) {
      let instance = initERC1155Single(chainId, address);
      await addERC1155NFT(chainId, instance, collection.uriFormat, tokenId);
      nft = await ERC1155NFT.findOne(
        { chainId: chainId, collectionAddress: address, tokenId: tokenId },
        { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 }
      );
    }

    return nft;
  }
};

module.exports = router;
