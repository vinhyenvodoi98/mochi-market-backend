const { ethers } = require('ethers');
const { getContractAddress } = require('./getContractAddress');
const { getProvider } = require('./getProvider');

require('dotenv').config();

const marketArtifacts = require('../contracts/Market.json');
const nftListArtifacts = require('../contracts/NFTList.json');
const sellOrderListArtifacts = require('../contracts/SellOrderList.json');
const vaultArtifacts = require('../contracts/Vault.json');
const creativeStudioArtifacts = require('../contracts/CreativeStudio.json');
const nftCampaignArtifacts = require('../contracts/NFTCampaign.json');
const addressProviderArtifacts = require('../contracts/AddressesProvider.json');
const MochiERC721NFT = require('../contracts/MochiERC721NFT.json');

exports.getMarketInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.Market, marketArtifacts.abi, provider);
};

exports.getNftListInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.NftList, nftListArtifacts.abi, provider);
};

exports.getSellOrderListInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.SellOrderList, sellOrderListArtifacts.abi, provider);
};

exports.getVaultInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.Vault, vaultArtifacts.abi, provider);
};

exports.getCreativeStudioInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.CreativeStudio, creativeStudioArtifacts.abi, provider);
};

exports.getNftCampaignInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.NFTCampaign, nftCampaignArtifacts.abi, provider);
};

exports.getAddressProviderInstance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(
    contractAddress.AddressesProvider,
    addressProviderArtifacts.abi,
    provider
  );
};
exports.getMochiERC721Instance = (chainId) => {
  let contractAddress = getContractAddress(chainId);
  let provider = getProvider(chainId);
  return new ethers.Contract(contractAddress.Mochi, MochiERC721NFT.abi, provider);
};
