const axios = require('axios');
const { ethers } = require('ethers');
const ERC721Artifacts = require('../contracts/ERC721.json');
const ERC1155Artifacts = require('../contracts/MochiERC1155NFT.json');
const { getProvider } = require('../utils/getProvider');
const { getNftListInstance } = require('../utils/getContractInstance');

const getAcceptedNfts = async (chainId) => {
  const nftList = getNftListInstance(chainId);

  let acceptedNftsAddress = await nftList.getAcceptedNFTs();
  let address = { erc721Accepted: [], erc1155Accepted: [] };
  await Promise.all(
    acceptedNftsAddress.map(async (nftAddress) => {
      let isERC1155 = await nftList.isERC1155(nftAddress);
      if (isERC1155) address.erc1155Accepted.push(nftAddress.toLowerCase());
      else address.erc721Accepted.push(nftAddress.toLowerCase());

      return;
    })
  );
  return address;
};

const getAllNFTAddress = async (chainId) => {
  const nftList = getNftListInstance(chainId);

  let allNftsAddress = await nftList.getAllNFTAddress();
  let address = { erc721Addresses: [], erc1155Addresses: [] };
  await Promise.all(
    allNftsAddress.map(async (nftAddress) => {
      let isERC1155 = await nftList.isERC1155(nftAddress);
      if (isERC1155) address.erc1155Addresses.push(nftAddress);
      else address.erc721Addresses.push(nftAddress);

      return;
    })
  );
  return address;
};

const initERC721 = async (addresses, chainId) => {
  let erc721Instances = [];
  let provider = getProvider(chainId);
  if (!!addresses) {
    erc721Instances = await addresses.map(
      (address) => new ethers.Contract(address, ERC721Artifacts.abi, provider)
    );
  }
  return erc721Instances;
};

const initERC1155 = async (addresses, chainId) => {
  let erc1155Instances = [];
  let provider = getProvider(chainId);
  if (!!addresses) {
    erc1155Instances = await addresses.map(
      (address) => new ethers.Contract(address, ERC1155Artifacts.abi, provider)
    );
  }
  return erc1155Instances;
};

const initERC721Single = (chainId, address) => {
  let provider = getProvider(chainId);
  return new ethers.Contract(address, ERC721Artifacts.abi, provider);
};

const initERC1155Single = (chainId, address) => {
  let provider = getProvider(chainId);
  return new ethers.Contract(address, ERC1155Artifacts.abi, provider);
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
  initERC1155,
  initERC721Single,
  initERC1155Single,
  getNFTDetail,
  getOwner,
  getAllNFTAddress,
};
