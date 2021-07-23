const { getSellOrderListInstance, getNftListInstance } = require('../utils/getContractInstance');

const { addCollectionERC1155, addCollectionERC721 } = require('../scripts/collection');

const {
  addSellOrder,
  deactiveSellOrder,
  updateSellOrder,
  updatePrice,
} = require('../scripts/sellOrder');

const EventStream = async (chainId) => {
  console.log('Listen event on: ', chainId);

  let nftListInstance = getNftListInstance(chainId);

  nftListInstance.on('NFTAccepted', (nftAddress) => {
    const checkERC = async () => {
      try {
        let isERC1155 = await nftListInstance.isERC1155(nftAddress);
        if (isERC1155) {
          await addCollectionERC1155(chainId, nftAddress);
        } else {
          await addCollectionERC721(chainId, nftAddress);
        }
      } catch (err) {
        console.log({ err });
      }
    };

    checkERC();
  });

  let sellOrderInstance = getSellOrderListInstance(chainId);

  sellOrderInstance.on('SellOrderAdded', (seller, sellId, nftAddress, tokenId, price, token) => {
    const saveSellOrder = async () => {
      try {
        await addSellOrder(chainId, {
          seller: seller,
          sellId: sellId,
          amount: 0,
          soldAmount: 0,
          nftAddress: nftAddress,
          tokenId: tokenId,
          price: price,
          token: token,
          buyers: [],
          buyTimes: [],
          isActive: true,
          sellTime: Date.now() / 1000,
        });
      } catch (err) {
        console.log({ err });
      }
    };
    saveSellOrder();
  });

  sellOrderInstance.on('SellOrderDeactive', (sellId) => {
    const cancleSellOrder = async () => {
      try {
        await deactiveSellOrder(chainId, sellId);
      } catch (error) {
        console.log({ error });
      }
    };
    cancleSellOrder();
  });

  sellOrderInstance.on(
    'SellOrderCompleted',
    (sellId, seller, buyer, nftAddress, tokenId, price, amount, token) => {
      const buy = async () => {
        try {
          let sellOrderInfo = await sellOrderInstance.getSellOrderById(sellId);
          await updateSellOrder(chainId, sellOrderInfo);
        } catch (err) {
          console.log({ err });
        }
      };

      buy();
    }
  );

  sellOrderInstance.on('PriceChanged', (sellId, newPrice) => {
    const priceChange = async () => {
      try {
        await updatePrice(chainId, sellId, newPrice);
      } catch (err) {
        console.log(err);
      }
    };
    priceChange();
  });
};

const main = async () => {
  await EventStream('56');
  await EventStream('137');
  await EventStream('97');
};

main();
