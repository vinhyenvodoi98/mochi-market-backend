// const mongoose = require('mongoose');
// const axios = require('axios');
// const Collection = require('../models/Collection');
// const ERC721NFT = require('../models/ERC721NFT');
// const ERC1155NFT = require('../models/ERC1155NFT');
// const SellOrder = require('../models/SellOrder');
// const { COLLECTION_CONSTANT } = require('../helpers/constant');
// const {
//   getAcceptedNfts,
//   initERC721,
//   initERC1155,
//   initERC721Single,
//   initERC1155Single,
// } = require('../helpers/blockchain');
// const { getSellOrderListInstance } = require('../utils/getContractInstance');
// const { utils } = require('ethers');
// const { downQuality } = require('../utils/reduceImage');

// require('dotenv').config();

// mongoose.connect(
//   process.env.MONGODB_URI,
//   { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
//   (error) => {
//     if (error) console.log(error);
//   }
// );
// mongoose.set('useCreateIndex', true);

// const updateThumb = async (image, imgType) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let thumb = await downQuality(image, imgType);
//       resolve(thumb);
//     } catch (error) {
//       reject(false);
//     }
//   });
// };

// const fetchAllNFT = async (chainId) => {
//   try {
//     let erc721Collections = await Collection.find({ chainId: chainId, type: 'ERC721Token' });
//     let erc1155Collections = await Collection.find({ chainId: chainId, type: 'ERC1155Token' });

//     await Promise.all(
//       erc721Collections.map(async (collection) => {
//         await fetchNFTERC721ByCollectionAddress(chainId, collection.address);
//       })
//     );

//     await Promise.all(
//       erc1155Collections.map(async (collection) => {
//         await fetchNFTERC1155ByCollectionAddress(chainId, collection.address);
//       })
//     );

//     console.log('DONE');
//     process.exit(0);
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// };

// const fetchNFTERC721ByCollectionAddress = async (chainId, collectionAddress) => {
//   try {
//     collectionAddress = collectionAddress.toLowerCase();
//     let instance = initERC721Single(chainId, collectionAddress);
//     let tokenIdsInfo = getTokenIds(chainId, collectionAddress);

//     if (tokenIdsInfo === undefined) {
//       return;
//     }

//     if (tokenIdsInfo.length == undefined) {
//       let min = tokenIdsInfo.min;
//       let max = tokenIdsInfo.max;
//       let tokenIds = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
//         return idx + min;
//       });

//       // for (let i = 0; i < tokenIds.length; i += 100) {
//       //   let listIds;
//       //   if (i + 100 <= tokenIds.length - 1) {
//       //     listIds = tokenIds.slice(i, i + 100);
//       //   } else {
//       //     listIds = tokenIds.slice(i, tokenIds.length);
//       //   }

//       //   await Promise.all(
//       //     listIds.map(async (tokenId) => {
//       //       await addERC721NFT(chainId, instance, tokenId);
//       //     })
//       //   );
//       // }

//       await Promise.all(
//         tokenIds.map(async (tokenId) => {
//           await addERC721NFT(chainId, instance, tokenId);
//         })
//       );
//     } else {
//       // for (let i = 0; i < tokenIdsInfo.length; i += 100) {
//       //   let listIds;
//       //   if (i + 100 <= tokenIdsInfo.length - 1) {
//       //     listIds = tokenIdsInfo.slice(i, i + 100);
//       //   } else {
//       //     listIds = tokenIdsInfo.slice(i, tokenIdsInfo.length);
//       //   }
//       //   await Promise.all(
//       //     listIds.map(async (tokenId) => {
//       //       await addERC721NFT(chainId, instance, tokenId);
//       //     })
//       //   );
//       // }

//       await Promise.all(
//         tokenIdsInfo.map(async (tokenId) => {
//           await addERC721NFT(chainId, instance, tokenId);
//         })
//       );
//     }
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// };

// const fetchNFTERC1155ByCollectionAddress = async (chainId, collectionAddress) => {
//   try {
//     collectionAddress = collectionAddress.toLowerCase();
//     let instance = initERC1155Single(chainId, collectionAddress);
//     let tokenIdsInfo = getTokenIds(chainId, collectionAddress);

//     if (tokenIdsInfo === undefined) {
//       return;
//     }

//     if (tokenIdsInfo.length == undefined) {
//       let min = tokenIdsInfo.min;
//       let max = tokenIdsInfo.max;
//       let tokenIds = Array.apply(null, { length: max + 1 - min }).map(function (_, idx) {
//         return idx + min;
//       });

//       // for (let i = 0; i < tokenIds.length; i += 100) {
//       //   let listIds;
//       //   if (i + 100 <= tokenIds.length - 1) {
//       //     listIds = tokenIds.slice(i, i + 100);
//       //   } else {
//       //     listIds = tokenIds.slice(i, tokenIds.length);
//       //   }

//       //   await Promise.all(
//       //     listIds.map(async (tokenId) => {
//       //       await addERC721NFT(chainId, instance, tokenId);
//       //     })
//       //   );
//       // }

//       await Promise.all(
//         tokenIds.map(async (tokenId) => {
//           await addERC1155NFT(chainId, instance, tokenId);
//         })
//       );
//     } else {
//       // for (let i = 0; i < tokenIdsInfo.length; i += 100) {
//       //   let listIds;
//       //   if (i + 100 <= tokenIdsInfo.length - 1) {
//       //     listIds = tokenIdsInfo.slice(i, i + 100);
//       //   } else {
//       //     listIds = tokenIdsInfo.slice(i, tokenIdsInfo.length);
//       //   }
//       //   await Promise.all(
//       //     listIds.map(async (tokenId) => {
//       //       await addERC721NFT(chainId, instance, tokenId);
//       //     })
//       //   );
//       // }

//       await Promise.all(
//         tokenIdsInfo.map(async (tokenId) => {
//           await addERC1155NFT(chainId, instance, tokenId);
//         })
//       );
//     }
//     return;
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// };

// const fetchActiveSellOrder = async (chainId) => {
//   try {
//     const sellOrderList = getSellOrderListInstance(chainId);

//     let availableSellOrderIdList = await sellOrderList.getAvailableSellOrdersIdList();
//     let availableSellOrders721 = await sellOrderList.getSellOrdersByIdList(
//       availableSellOrderIdList.resultERC721
//     );
//     let availableSellOrders1155 = await sellOrderList.getSellOrdersByIdList(
//       availableSellOrderIdList.resultERC1155
//     );

//     let availableSellOrders = availableSellOrders721.concat(availableSellOrders1155);

//     await Promise.all(
//       availableSellOrders.map(async (sellOrder) => {
//         await addSellOrder(chainId, sellOrder);
//       })
//     );

//     console.log('DONE');
//     process.exit(0);
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// };

// const fetchAllSellOrder = async (chainId) => {
//   try {
//     const sellOrderList = getSellOrderListInstance(chainId);

//     let sellOrderCount = parseInt(await sellOrderList.getSellOrderCount());

//     for (let i = 0; i < sellOrderCount; i += 100) {
//       let sellIds;
//       if (i + 100 <= sellOrderCount - 1) {
//         sellIds = Array.apply(null, { length: 100 }).map(function (_, idx) {
//           return idx + i;
//         });
//       } else {
//         sellIds = Array.apply(null, { length: sellOrderCount - i }).map(function (_, idx) {
//           return idx + i;
//         });
//       }
//       let sellOrders = await sellOrderList.getSellOrdersByIdList(sellIds);
//       console.log('From: ', sellIds[0], ' To: ', sellIds[sellIds.length - 1]);

//       for (let j = 0; j < sellOrders.length; j++) {
//         await addSellOrder(chainId, sellOrders[j]);
//       }
//     }

//     console.log('DONE');
//     process.exit(0);
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// };

// const reduceImageQuality721 = async (nftAddress, tokenId) => {
//   var ercImages;
//   if (!nftAddress) ercImages = await ERC721Token.find({}, 'image tokenId thumb');
//   else {
//     if (!tokenId) {
//       ercImages = await NFT.find(
//         { address: nftAddress.toLowerCase() },
//         'tags name symbol address onModel'
//       ).populate({
//         path: 'tokens',
//         model: ERC721Token,
//         select: ['tokenId', 'image', 'thumb'],
//       });

//       ercImages = ercImages[0].tokens;
//     } else {
//       ercImages = await NFT.find(
//         { address: nftAddress.toLowerCase() },
//         'tags name symbol address onModel'
//       ).populate({
//         path: 'tokens',
//         model: ERC721Token,
//         match: { tokenId },
//         select: ['tokenId', 'image', 'thumb'],
//       });

//       ercImages = ercImages[0].tokens;
//     }
//   }

//   for (let i = 0; i < ercImages.length; i++) {
//     if (
//       !!ercImages[i].image &&
//       ercImages[i].image.length > 0 &&
//       (!ercImages[i].thumb || ercImages[i].thumb.length === 0)
//     ) {
//       let thumb = await updateThumb(ercImages[i].image);
//       if (thumb) {
//         await ERC721Token.findOneAndUpdate({ _id: ercImages[i]._id }, { thumb });
//         console.log('Down quality tokenId :' + ercImages[i].tokenId);
//       }
//     }
//   }

//   console.log('DONE');
//   process.exit(0);
// };

// const reduceImageQuality1155 = async (nftAddress, tokenId) => {
//   var ercImages;
//   if (!nftAddress) ercImages = await ERC1155Token.find({}, 'image tokenId thumb');
//   else {
//     if (!tokenId) {
//       ercImages = await NFT.find(
//         { address: nftAddress.toLowerCase() },
//         'tags name symbol address onModel'
//       ).populate({
//         path: 'tokens',
//         model: ERC1155Token,
//         select: ['tokenId', 'image', 'thumb'],
//       });

//       ercImages = ercImages[0].tokens;
//     } else {
//       ercImages = await NFT.find(
//         { address: nftAddress.toLowerCase() },
//         'tags name symbol address onModel'
//       ).populate({
//         path: 'tokens',
//         model: ERC1155Token,
//         match: { tokenId },
//         select: ['tokenId', 'image', 'thumb'],
//       });

//       ercImages = ercImages[0].tokens;
//     }
//   }

//   for (let i = 0; i < ercImages.length; i++) {
//     if (
//       !!ercImages[i].image &&
//       ercImages[i].image.length > 0 &&
//       (!ercImages[i].thumb || ercImages[i].thumb.length === 0)
//     ) {
//       let thumb = await updateThumb(ercImages[i].image, 'gif');
//       if (thumb) {
//         await ERC1155Token.findOneAndUpdate({ _id: ercImages[i]._id }, { thumb });
//         console.log('Down quality tokenId :' + ercImages[i].tokenId);
//       }
//     }
//   }

//   console.log('DONE');
//   process.exit(0);
// };

// // update the nft undefined
// const updateUndefinedImage = async (nftAddress) => {
//   // if not enter nftAddress
//   let undefinedImg;
//   if (!!nftAddress) {
//     undefinedImg = await NFT.find(
//       { address: nftAddress.toLowerCase() },
//       'address onModel'
//     ).populate({
//       path: 'tokens',
//       model: ERC721Token,
//       match: { name: 'Unnamed' },
//       select: ['tokenURI', 'name', 'tokenId'],
//     });
//     undefinedImg = undefinedImg[0].tokens;
//   } else {
//     undefinedImg = await ERC721Token.find({ name: 'Unnamed' }, 'tokenURI name tokenId');
//   }
//   for (let i = 0; i < undefinedImg.length; i++) {
//     let req = await axios.get(undefinedImg[i].tokenURI);
//     let thumb = '';
//     if (!!req.data.image) thumb = await updateThumb(req.data.image);
//     if (!!req.data.name && req.data.name !== 'Unnamed') {
//       console.log('i : ' + i);
//       await ERC721Token.updateOne(
//         { _id: undefinedImg[i]._id },
//         {
//           name: !!req.data.name ? req.data.name : 'Unnamed',
//           image: !!req.data.image ? req.data.image : '',
//           description: !!req.data.description ? req.data.description : '',
//           attributes: !!req.data.attributes ? req.data.attributes : [],
//           thumb,
//         }
//       );
//       console.log('nft : ' + undefinedImg[i].name + ': id : ' + undefinedImg[i].tokenId);
//     }
//   }
// };

// // update only nft info
// const updateOnlyNftInfo = async () => {
//   const { erc721, erc1155 } = await getAcceptedNfts();

//   const nftInfo = async (nftAddress, onModel) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let recordedNFT = await NFT.findOne({ address: nftAddress.toLowerCase() });
//         if (!recordedNFT) {
//           let instance;
//           if (onModel === 'ERC1155Token') instance = await initERC1155Single(nftAddress);
//           else instance = await initERC721Single(nftAddress);

//           // Save ERC basic info
//           let name = await instance.name();
//           let symbol = await instance.symbol();
//           let addressToken = instance.address.toLowerCase();

//           let nft = new NFT({
//             name,
//             symbol,
//             address: addressToken,
//             onModel: onModel,
//           });

//           await nft.save();
//           console.log('nft name: ', name);
//         }
//         resolve();
//       } catch (error) {
//         reject();
//       }
//     });
//   };

//   await Promise.all(
//     erc721.map(async (instance) => {
//       return await nftInfo(instance, 'ERC721Token');
//     })
//   );

//   await Promise.all(
//     erc1155.map(async (instance) => {
//       return await nftInfo(instance, 'ERC1155Token');
//     })
//   );

//   console.log('DONE');
//   process.exit(0);
// };

// const initCollectionsInfo = async (chainId) => {
//   try {
//     const { erc721Addresses, erc1155Addresses } = await getAcceptedNfts(chainId);
//     const erc721Instances = await initERC721(erc721Addresses, chainId);
//     const erc1155Instances = await initERC1155(erc1155Addresses, chainId);

//     await Promise.all(
//       erc721Instances.map(async (instance) => {
//         await addCollectionERC721(chainId, instance);
//       })
//     );
//     await Promise.all(
//       erc1155Instances.map(async (instance) => {
//         await addCollectionERC1155(chainId, instance);
//       })
//     );

//     console.log('DONE');
//     process.exit(0);
//   } catch (err) {
//     console.log(err);
//     process.exit(1);
//   }
// };

// const addCollectionERC721 = async (chainId, instance) => {
//   let collectionAddress = instance.address.toLowerCase();
//   let recordedCollection = await Collection.findOne({
//     address: collectionAddress,
//     chainId: chainId,
//   });

//   if (!recordedCollection) {
//     console.log(
//       'Add ERC721 Collection chainId: ',
//       chainId,
//       ' address: ',
//       instance.address.toLowerCase()
//     );

//     let name = await instance.name();
//     let symbol = await instance.symbol();
//     let uriFormat = getUriFormat(chainId, collectionAddress);

//     let collection = new Collection({
//       chainId: chainId,
//       name: name,
//       symbol: symbol,
//       address: collectionAddress,
//       type: 'ERC721Token',
//       uriFormat: uriFormat,
//     });

//     await collection.save();
//   } else {
//     console.log(
//       'Update ERC721 Collection chainId: ',
//       chainId,
//       ' address: ',
//       instance.address.toLowerCase()
//     );

//     let name = await instance.name();
//     let symbol = await instance.symbol();
//     let uriFormat = getUriFormat(chainId, collectionAddress);

//     recordedCollection.name = name;
//     recordedCollection.symbol = symbol;
//     recordedCollection.uriFormat = uriFormat;
//     await recordedCollection.save();
//   }
//   return;
// };

// const addCollectionERC1155 = async (chainId, instance) => {
//   let collectionAddress = await instance.address.toLowerCase();

//   let recordedCollection = await Collection.findOne({
//     chainId: chainId,
//     address: collectionAddress,
//   });
//   if (!recordedCollection) {
//     console.log('Add ERC1155 Collection chainId: ', chainId, ' address: ', collectionAddress);

//     let name = await instance.name();
//     let symbol = await instance.symbol();
//     let uriFormat = getUriFormat(chainId, collectionAddress);

//     let collection = new Collection({
//       chainId: chainId,
//       name: name,
//       symbol: symbol,
//       address: collectionAddress,
//       type: 'ERC1155Token',
//       uriFormat: uriFormat,
//     });

//     await collection.save();
//   } else {
//     console.log(
//       'Update ERC1155 Collection chainId: ',
//       chainId,
//       ' address: ',
//       instance.address.toLowerCase()
//     );

//     let name = await instance.name();
//     let symbol = await instance.symbol();
//     let uriFormat = getUriFormat(chainId, collectionAddress);

//     recordedCollection.name = name;
//     recordedCollection.symbol = symbol;
//     recordedCollection.uriFormat = uriFormat;
//     await recordedCollection.save();
//   }
// };

// const addERC721NFT = async (chainId, instance, tokenId) => {
//   try {
//     let collectionAddress = await instance.address.toLowerCase();
//     chainId = chainId.toString();
//     tokenId = tokenId.toString();
//     let item = await ERC721NFT.findOne({
//       chainId: chainId,
//       collectionAddress: collectionAddress,
//       tokenId: tokenId,
//     });

//     if (!!item) return;

//     // await instance.ownerOf(tokenId);

//     let { uriFormat } = await Collection.findOne({
//       chainId: chainId,
//       address: collectionAddress,
//     });

//     let tokenURI =
//       uriFormat.length > 0 ? uriFormat.replace('{id}', tokenId) : await instance.tokenURI(tokenId);

//     tokenURI = tokenURI.includes('ipfs://')
//       ? tokenURI.replace('ipfs://', 'https://storage.mochi.market/ipfs/')
//       : tokenURI;
//     console.log(
//       ' Add NFT chainId: ',
//       chainId,
//       ' address: ',
//       collectionAddress,
//       ' TokenId: ',
//       tokenId
//     );
//     let req = await axios.get(tokenURI);

//     let newNFT = new ERC721NFT({
//       chainId: chainId,
//       tokenId: tokenId,
//       tokenURI: tokenURI,
//       name: !!req.data.name ? req.data.name : 'Unnamed',
//       image: !!req.data.image ? req.data.image : '',
//       description: !!req.data.description ? req.data.description : '',
//       attributes: !!req.data.attributes ? req.data.attributes : [],
//       collectionAddress: collectionAddress,
//     });

//     await newNFT.save();
//     return;
//   } catch (err) {
//     console.log(err);
//     return;
//   }
// };

// const addERC1155NFT = async (chainId, instance, tokenId) => {
//   try {
//     let item = await ERC1155NFT.findOne({
//       chainId: chainId,
//       collectionAddress: instance.address.toLowerCase(),
//       tokenId: tokenId,
//     });

//     if (!!item) return;

//     // await instance.balanceOf('0x0000000000000000000000000000000000000001', tokenId);

//     let { uriFormat } = await Collection.findOne({
//       chainId: chainId,
//       address: instance.address.toLowerCase(),
//     });

//     let tokenURI =
//       uriFormat.length > 0 ? uriFormat.replace('{id}', tokenId) : await instance.uri(tokenId);

//     tokenURI = tokenURI.includes('ipfs://')
//       ? tokenURI.replace('ipfs://', 'https://storage.mochi.market/ipfs/')
//       : tokenURI;

//     console.log(
//       ' Add NFT chainId: ',
//       chainId,
//       ' address: ',
//       instance.address.toLowerCase(),
//       ' TokenId: ',
//       tokenId.toString()
//     );
//     let req = await axios.get(tokenURI);

//     let newNFT = new ERC1155NFT({
//       chainId: chainId,
//       tokenId: tokenId.toString(),
//       tokenURI: tokenURI,
//       name: !!req.data.name ? req.data.name : 'Unnamed',
//       image: !!req.data.image ? req.data.image : '',
//       description: !!req.data.description ? req.data.description : '',
//       attributes: !!req.data.attributes ? req.data.attributes : [],
//       collectionAddress: instance.address.toLowerCase(),
//     });

//     await newNFT.save();

//     return;
//   } catch (err) {
//     console.log(err);
//     return;
//   }
// };

// const addSellOrder = async (chainId, sellOrderInfo) => {
//   try {
//     let sellId = parseInt(sellOrderInfo.sellId);

//     let collection = await Collection.findOne({
//       address: sellOrderInfo.nftAddress.toLowerCase(),
//       chainId: chainId,
//     });

//     if (collection !== null) {
//       if (collection.type === 'ERC721Token') {
//         let instance = initERC721Single(chainId, sellOrderInfo.nftAddress);
//         await addERC721NFT(chainId, instance, sellOrderInfo.tokenId);
//       } else if (collection.type === 'ERC1155Token') {
//         let instance = initERC1155Single(chainId, sellOrderInfo.nftAddress);
//         await addERC1155NFT(chainId, instance, sellOrderInfo.tokenId);
//       }
//     }

//     let exist = await SellOrder.findOne({ chainId: chainId, sellId: sellId });

//     if (exist == null) {
//       console.log('Add SellOrder  chainId: ' + chainId + ', sellOrderId: ' + sellId);
//       let sellOrder = new SellOrder({
//         chainId: chainId,
//         sellId: sellId,
//         collectionAddress: sellOrderInfo.nftAddress.toLowerCase(),
//         tokenId: sellOrderInfo.tokenId.toString(),
//         amount: parseInt(sellOrderInfo.amount),
//         soldAmount: parseInt(sellOrderInfo.soldAmount),
//         seller: sellOrderInfo.seller.toLowerCase(),
//         price: parseFloat(utils.formatEther(sellOrderInfo.price.toString())),
//         token: sellOrderInfo.token.toLowerCase(),
//         isActive: sellOrderInfo.isActive,
//         sellTime: parseInt(sellOrderInfo.sellTime.toString()),
//         buyers: await sellOrderInfo.buyers.map((buyer) => buyer.toLowerCase()),
//         buyTimes: await sellOrderInfo.buyTimes.map((buyTime) => parseInt(buyTime)),
//       });
//       await sellOrder.save();
//     } else {
//       console.log('Update SellOrder chainId: ' + chainId + ', sellOrderId: ' + sellId);
//       exist.chainId = chainId;
//       exist.sellId = sellId;
//       exist.collectionAddress = sellOrderInfo.nftAddress.toLowerCase();
//       exist.tokenId = sellOrderInfo.tokenId.toString();
//       exist.amount = parseInt(sellOrderInfo.amount);
//       exist.soldAmount = parseInt(sellOrderInfo.soldAmount);
//       exist.seller = sellOrderInfo.seller.toLowerCase();
//       exist.price = parseFloat(utils.formatEther(sellOrderInfo.price.toString()));
//       exist.token = sellOrderInfo.token.toLowerCase();
//       exist.isActive = sellOrderInfo.isActive;
//       exist.sellTime = sellOrderInfo.sellTime;
//       exist.buyers = await sellOrderInfo.buyers.map((buyer) => buyer.toLowerCase());
//       exist.buyTimes = await sellOrderInfo.buyTimes.map((buyTime) => parseInt(buyTime));

//       await exist.save();
//     }
//     return;
//   } catch (err) {
//     console.log(err);
//     return;
//   }
// };

// const deactiveSellOrder = async (chainId, sellId) => {
//   console.log('Deactive SellOrder chainId: ' + chainId + ', sellOrderId: ' + parseInt(sellId));
//   await SellOrder.findOneAndUpdate(
//     { chainId: chainId, sellId: parseInt(sellId) },
//     { isActive: false }
//   );
// };

// const buySellOrder = async (chainId, sellOrderInfo) => {
//   await addSellOrder(chainId, sellOrderInfo);
// };

// const getUriFormat = (chainId, collectionAddress) => {
//   for (let i = 0; i < COLLECTION_CONSTANT.length; i++) {
//     if (
//       chainId == COLLECTION_CONSTANT[i].chainId &&
//       COLLECTION_CONSTANT[i].address === collectionAddress
//     ) {
//       return COLLECTION_CONSTANT[i].uriFormat;
//     }
//   }
//   return '';
// };

// const updatePrice = async (chainId, sellId, price) => {
//   sellId = parseInt(sellId);

//   console.log('Update price SellOrder chaiId: ' + chainId + ', sellOrderId: ' + sellId);
//   await SellOrder.findOneAndUpdate(
//     { chainId, sellId },
//     { price: parseFloat(utils.formatEther(price.toString())) }
//   );
// };

// const getTokenIds = (chainId, collectionAddress) => {
//   for (let i = 0; i < COLLECTION_CONSTANT.length; i++) {
//     if (
//       chainId === COLLECTION_CONSTANT[i].chainId &&
//       collectionAddress === COLLECTION_CONSTANT[i].address
//     ) {
//       return COLLECTION_CONSTANT[i].tokenIds;
//     }
//   }
// };

// module.exports = {
//   initCollectionsInfo,
//   fetchNFTERC721ByCollectionAddress,
//   fetchNFTERC1155ByCollectionAddress,
//   fetchAllNFT,
//   fetchActiveSellOrder,
//   fetchAllSellOrder,

//   addCollectionERC721,
//   addCollectionERC1155,
//   addSellOrder,
//   deactiveSellOrder,
//   updatePrice,
//   buySellOrder,
//   addERC721NFT,
//   addERC1155NFT,
// };
