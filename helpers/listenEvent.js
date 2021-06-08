const { getSellOrderListInstance, getNftListInstance } = require('../utils/getContractInstance');
const { provider } = require('../utils/getProvider');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');
const SellOrder = require('../models/SellOrder');
const { initERC721Single } = require('./blockchain');
const { default: axios } = require('axios');
const User = require('../models/User');

const OldEventStream = async () => {
  let nfts = await NFT.find({}, 'address');
  nfts.forEach((nft) => openListenERC721Event(nft.address));
};

const EventStream = async () => {
  let nftListInstance = getNftListInstance();

  nftListInstance.on('NFTAccepted', (nftAddress) => {
    const checkERC = async () => {
      let isERC1155 = await nftListInstance.isERC1155(nftAddress);
      if (isERC1155) {
        console.log(nftAddress + ': is erc1155');
      } else {
        updateERC721FromAcceptedList(nftAddress);
      }
    };

    checkERC();
  });

  nftListInstance.on('NFTAdded', (nftAddress, isErc1155) => {
    if (isErc1155) {
      console.log(nftAddress + ': is erc1155');
    } else {
      updateERC721FromAcceptedList(nftAddress);
      openListenERC721Event(nftAddress);
    }
  });

  let sellOrderInstance = getSellOrderListInstance();

  sellOrderInstance.on('SellOrderAdded', (seller, sellId, nftAddress, tokenId, price, token) => {
    const saveNft = async () => {
      let isSellExist = await SellOrder.findOne({ sellId: sellId.toString() });
      if (!isSellExist) {
        let nft = await NFT.findOne({ address: nftAddress });
        if (!!nft) {
          let sellOrder = new SellOrder({
            sellId: sellId.toString(),
            nftAddress: nft._id,
            tokenId: parseInt(tokenId.toString()),
            seller,
            price: price.toString(),
            token,
            isActive: true,
          });

          await sellOrder.save();
        }
      }
    };

    saveNft();
  });

  sellOrderInstance.on('SellOrderDeactive', (seller, sellId, nftAddress, tokenId, price, token) => {
    const UpdateNft = async () => {
      await SellOrder.findOneAndUpdate({ sellId: sellId.toString() }, { isActive: false });
    };
    updateNft();
  });
};

const updateERC721FromAcceptedList = async (nftAddress) => {
  try {
    let isNFTExist = await NFT.findOne({ address: nftAddress });
    if (!isNFTExist) {
      const instance = initERC721Single(nftAddress);

      let erc721token = {};
      erc721token.name = await instance.name();
      erc721token.symbol = await instance.symbol();
      erc721token.addressToken = instance.address;

      let nft = new NFT({
        name: erc721token.name,
        symbol: erc721token.symbol,
        address: erc721token.addressToken,
        onModel: 'ERC721Token',
      });

      let recordedNFT = await nft.save();

      erc721token.tokens = [];
      // max 999999 id, it will break if undefined
      for (let i = 1; i < 999999; i++) {
        let tokenURI = await instance.tokenURI(i);
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
            let ownerAddress = await getOwner(erc721token.addressToken, i);
            console.log({ ownerAddress });
            // update owner

            await User.findOneAndUpdate(
              { address: ownerAddress },
              { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );
          } catch (error) {
            console.log({ error });
          }
        } else break;
      }
    }
    // else {
    //   console.log(nftAddress + ': is exits in databasse');
    // }
  } catch (error) {
    console.log({ error });
  }
};

const openListenERC721Event = (nftAddress) => {
  const instance = initERC721Single(nftAddress);

  instance.on('Transfer', (from, to, tokenId) => {
    const saveERC721 = async () => {
      let recordedNFT = await NFT.findOne({ address: nftAddress }).populate({
        path: 'tokens',
        model: ERC721Token,
        match: { tokenId },
      });

      // save erc721 of database don't have
      if (!recordedNFT.tokens[0]) {
        let tokenURI = await instance.tokenURI(tokenId);
        if (tokenURI) {
          let cid = tokenURI.split('/');
          tokenURI = 'https://storage.mochi.market/ipfs/' + cid[cid.length - 1];
          try {
            let req = await axios.get(tokenURI);

            let erc721 = new ERC721Token({
              tokenId,
              tokenURI: tokenURI,
              name: !!req.data.name ? req.data.name : 'Unnamed',
              image: !!req.data.image ? req.data.image : '',
              description: !!req.data.description ? req.data.description : '',
              nft: recordedNFT._id,
            });

            console.log(erc721);

            // save ERC721
            let recordedERC721 = await erc721.save();

            // update NFT
            await NFT.updateOne(
              { _id: recordedNFT._id },
              { $push: { tokens: recordedERC721._id } }
            );

            // already owned by the user?
            let alreadyOwned = await User.findOne({
              address: to,
              erc721tokens: { $in: recordedERC721._id },
            });

            if (!alreadyOwned) {
              await User.findOneAndUpdate(
                { address: to },
                { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            }
          } catch (error) {
            console.log({ error });
          }
        }
      }
    };

    // user mint token
    if (from === '0x0000000000000000000000000000000000000000') {
      saveERC721();
    }
  });
};

module.exports = {
  EventStream: EventStream,
  OldEventStream: OldEventStream,
};
