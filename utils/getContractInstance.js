const { ethers } = require('ethers');
const { getContractAddress } = require('./getContractAddress');
const { provider } = require('./getProvider');

require('dotenv').config();

const marketArtifacts = require('../contracts/Market.json');
const nftListArtifacts = require('../contracts/NFTList.json');
const sellOrderListArtifacts = require('../contracts/SellOrderList.json');
const vaultArtifacts = require('../contracts/Vault.json');
const creativeStudioArtifacts = require('../contracts/CreativeStudio.json');
const nftCampaignArtifacts = require('../contracts/NFTCampaign.json');
const addressProviderArtifacts = require('../contracts/AddressesProvider.json');
const mochiArtifacts = require('../contracts/Mochi.json');

let contractAddress = getContractAddress(process.env.CHAIN_ID);

exports.getMarketInstance = () =>
  new ethers.Contract(contractAddress.Market, marketArtifacts.abi, provider);

exports.getNftListInstance = () =>
  new ethers.Contract(contractAddress.NftList, nftListArtifacts.abi, provider);

exports.getSellOrderListInstance = () =>
  new ethers.Contract(contractAddress.SellOrderList, sellOrderListArtifacts.abi, provider);

exports.getVaultInstance = () =>
  new ethers.Contract(contractAddress.Vault, vaultArtifacts.abi, provider);

exports.getCreativeStudioInstance = () =>
  new ethers.Contract(contractAddress.CreativeStudio, creativeStudioArtifacts.abi, provider);

exports.getNftCampaignInstance = () =>
  new ethers.Contract(contractAddress.NFTCampaign, nftCampaignArtifacts.abi, provider);

exports.getAddressProviderInstance = () =>
  new ethers.Contract(contractAddress.AddressesProvider, addressProviderArtifacts.abi, provider);

exports.getMochiInstance = () =>
  new ethers.Contract(contractAddress.Mochi, mochiArtifacts.abi, provider);
