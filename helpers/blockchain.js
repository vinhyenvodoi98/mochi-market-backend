const axios = require('axios');
const { ethers } = require('ethers');
const ERC721Artifacts = require('../contracts/ERC721.json');
const ERC1155Artifacts = require('../contracts/MochiERC1155NFT.json');
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

const initERC721Single = (nftAddress) => {
  return new ethers.Contract(nftAddress, ERC721Artifacts.abi, provider);
};

const initERC1155Single = (nftAddress) => {
  return new ethers.Contract(nftAddress, ERC1155Artifacts.abi, provider);
};

const getNFTDetail = async (contractAddress, id) => {
  const erc721Instances = new ethers.Contract(contractAddress, ERC721Artifacts.abi, provider);
  const token = await erc721Instances.tokenURI(id);
  let req = await axios.get(token);
  return req.data;
};

const getOwner = async (contractAddress, id) => {
  const erc721Instances = new ethers.Contract(contractAddress, ERC721Artifacts.abi, provider);
  const ownerAddress = await erc721Instances.ownerOf(id);
  return ownerAddress;
};

module.exports = {
  getAcceptedNfts,
  initERC721,
  initERC721Single,
  initERC1155Single,
  getNFTDetail,
  getOwner,
};
