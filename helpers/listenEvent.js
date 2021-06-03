const { getSellOrderListInstance } = require('../utils/getContractInstance');
const { provider } = require('../utils/getProvider');
const NFT = require('../models/NFT');
const SellOrder = require('../models/SellOrder');

const EventStream = async (fromBlock) => {
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

  provider.resetEventsBlock(!!fromBlock ? fromBlock : 0);
};

module.exports = {
  EventStream: EventStream,
};
