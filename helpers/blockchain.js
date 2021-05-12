const axios = require('axios');
const { ethers } = require('ethers');
const ERC721Artifacts = require('../contracts/ERC721.json');
const { provider } = require('../utils/getProvider');
const { getNftListInstance } = require('../utils/getContractInstance');

const getAcceptedNfts = async () => {
  const nftList = getNftListInstance();
  let acceptedNftsAddress = await nftList.getAcceptedNFTs();
  return acceptedNftsAddress;
};

const initERC721 = async (nftList) => {
  let erc721Instances = [];
  if (!!nftList) {
    erc721Instances = await nftList.map(
      (contract) => new ethers.Contract(contract, ERC721Artifacts.abi, provider)
    );
  }
  return erc721Instances;
};

const getNFTDetail = async (contractAddress, id) => {
  const erc721Instances = new ethers.Contract(contractAddress, ERC721Artifacts.abi, provider);
  const token = await erc721Instances.tokenURI(id);
  let req = await axios.get(token);
  return req.data;
};

module.exports = {
  getAcceptedNfts,
  initERC721,
  getNFTDetail,
};
