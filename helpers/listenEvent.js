const { getSellOrderListInstance, getNftListInstance } = require('../utils/getContractInstance');
const { provider } = require('../utils/getProvider');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');
const SellOrder = require('../models/SellOrder');
const { initERC721Single } = require('./blockchain');
const { default: axios } = require('axios');
const User = require('../models/User');
const { getContractAddress } = require('../utils/getContractAddress');
const { utils } = require('ethers');

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
        updateERC721FromAcceptedList(nftAddress.toLowerCase(), false);
      }
    };

    checkERC();
  });

  let sellOrderInstance = getSellOrderListInstance();

  sellOrderInstance.on('SellOrderAdded', (seller, sellId, nftAddress, tokenId, price, token) => {
    const saveNft = async () => {
      console.log('Sell Order Added sellId : ' + sellId);
      let isSellExist = await SellOrder.findOne({ sellId: sellId.toString() });
      if (!isSellExist) {
        let nft = await NFT.findOne({ address: nftAddress.toLowerCase() });
        if (!!nft) {
          let sellOrder = new SellOrder({
            sellId: sellId.toString(),
            nftAddress: nft._id,
            tokenId: parseInt(tokenId.toString()),
            seller: seller.toLowerCase(),
            price: parseFloat(utils.formatEther(price.toString())),
            token: token.toLowerCase(),
          });

          await sellOrder.save();
        }
      }
    };
    saveNft();
  });

  sellOrderInstance.on('SellOrderDeactive', (sellId, seller, nftAddress, tokenId, price, token) => {
    const updateNft = async () => {
      try {
        let ketqua = await SellOrder.findOneAndUpdate(
          { sellId: sellId.toString() },
          { status: 'Cancel' }
        );
        console.log({ ketqua });
      } catch (error) {
        console.log({ error });
      }
    };
    console.log('\nCancel SellId :' + sellId + '\n');
    updateNft();
  });

  sellOrderInstance.on(
    'SellOrderCompleted',
    (sellId, seller, buyer, nftAddress, tokenId, price, amount, token) => {
      console.log('\n\n SellOrderCompleted from :' + seller + 'to :', buyer, '\n\n');

      const updateNft = async () => {
        await transferERC(nftAddress, tokenId, seller, buyer);
        // Complete sellorder
        await SellOrder.findOneAndUpdate(
          { sellId: sellId.toString() },
          { status: 'Complete', $push: { buyers: buyer } }
        );
      };

      updateNft();
    }
  );

  sellOrderInstance.on('PriceChanged', (sellId, newPrice) => {
    console.log('\n\n PriceChanged sellId :' + sellId + '\n\n');

    const updatePrice = async () => {
      await SellOrder.findOneAndUpdate(
        { sellId: sellId.toString() },
        { price: parseFloat(utils.formatEther(newPrice.toString())) }
      );
    };

    updatePrice();
  });
};

const openListenERC721Event = (nftAddress) => {
  const instance = initERC721Single(nftAddress);
  const contractAddress = getContractAddress(process.env.CHAIN_ID);

  instance.on('Transfer', (from, to, tokenId) => {
    const saveERC721 = async () => {
      let recordedNFT = await NFT.findOne({ address: nftAddress }).populate({
        path: 'tokens',
        model: ERC721Token,
        match: { tokenId },
      });

      // save erc721 of database don't have
      if (!recordedNFT.tokens[0]) {
        console.log('New nft migrate !!');
        let tokenURI = await instance.tokenURI(tokenId);
        if (tokenURI) {
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

            // save ERC721
            let recordedERC721 = await erc721.save();

            // update NFT
            await NFT.updateOne(
              { _id: recordedNFT._id },
              { $push: { tokens: recordedERC721._id } }
            );

            // already owned by the user?
            let alreadyOwned = await User.findOne({
              address: to.toLowerCase(),
              erc721tokens: { $in: recordedERC721._id },
            });

            if (!alreadyOwned) {
              await User.findOneAndUpdate(
                { address: to.toLowerCase() },
                { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            }
          } catch (error) {
            console.log('TokenUri error !!!');
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
        }
      }
    };

    // user mint token
    if (from === '0x0000000000000000000000000000000000000000') {
      saveERC721();
    }
    // when buy and sell it trigger tranfer to market
    else if (
      from.toLowerCase() !== contractAddress.Market.toLowerCase() &&
      to.toLowerCase() !== contractAddress.Market.toLowerCase()
    ) {
      transferERC(nftAddress, tokenId, from, to);
    }
  });
};

const transferERC = async (nftAddress, tokenId, from, to) => {
  let { tokens } = await NFT.findOne({
    address: nftAddress.toLowerCase(),
  }).populate({
    path: 'tokens',
    model: ERC721Token,
    match: [{ tokenId: parseInt(tokenId.toString()) }],
  });

  // remove erc721 of seller
  let remove = await User.updateOne(
    { address: from.toLowerCase() },
    { $pull: { erc721tokens: tokens[0]._id } }
  );
  // update erc721 for buyer
  let update = await User.updateOne(
    { address: to.toLowerCase() },
    { $push: { erc721tokens: tokens[0]._id } },
    { new: true, upsert: true }
  );
  console.log('nftAddress ' + nftAddress + 'from :' + from + 'to :' + to);
};

module.exports = {
  EventStream: EventStream,
  OldEventStream: OldEventStream,
};
