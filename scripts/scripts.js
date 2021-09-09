const { InitCollectionsInfo } = require('./collection');
const {
  InitAllNFT,
  InitERC721NFTByCollectionAddress,
  InitERC1155NFTByCollectionAddress,
  UpdateERC721NFTByCollectionAddress,
  UpdateERC1155NFTByCollectionAddress,
  UpdateERC721NFTByCollectionAddressAndTokenId
} = require('./nft');
const { FetchActiveSellOrder, UpdateSellOrderByChainId } = require('./sellOrder');

const main = async () => {
  var myArgs = process.argv.slice(2);
  switch (myArgs[0]) {
    case 'initCollectionsInfo':
      await InitCollectionsInfo(myArgs[1]);
    case 'initAllNft':
      await InitAllNFT(myArgs[1]);
    case 'initErc721Nft':
      await InitERC721NFTByCollectionAddress(myArgs[1], myArgs[2]);
    case 'initErc1155Nft':
      await InitERC1155NFTByCollectionAddress(myArgs[1], myArgs[2]);
    case 'updateErc721Nft':
      await UpdateERC721NFTByCollectionAddress(myArgs[1], myArgs[2]);
    case 'updateErc1155Nft':
      await UpdateERC1155NFTByCollectionAddress(myArgs[1], myArgs[2]);
    case 'activeSellOrder':
      await FetchActiveSellOrder(myArgs[1]);
    case 'updateSellOrder':
      await UpdateSellOrderByChainId(myArgs[1]);
    case 'updateErc721NftById':
      await UpdateERC721NFTByCollectionAddressAndTokenId(myArgs[1], myArgs[2], myArgs[3])
    // case 'allSellOrder':
    //   await fetchAllSellOrder(myArgs[1]);
    // case 'allNft':
    //   await updateOnlyNftInfo();
    // case 'imgDown721':
    //   await reduceImageQuality721(myArgs[1], myArgs[2]);
    // case 'imgDown1155':
    //   await reduceImageQuality1155(myArgs[1], myArgs[2]);
    // case 'updateUndefined':
    //   await updateUndefinedImage(myArgs[1]);
    default:
      console.log('\n\n   initCollectionsInfo [chainId]');
      console.log('\n\n   initAllNft [chainId]');
      console.log('\n\n   initErc721Nft [chainId] [address]');
      console.log('\n\n   initErc1155Nft [chainId] [address]');
      console.log('\n\n   updateErc721Nft [chainId] [address]');
      console.log('\n\n   updateErc1155ft [chainId] [address]');
      console.log('\n\n   activeSellOrder [chainId]');
      console.log('\n\n   updateSellOrder [chainId]');
      process.exit(0);
  }
};

main();
