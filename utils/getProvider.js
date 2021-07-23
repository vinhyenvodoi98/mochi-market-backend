const { ethers } = require('ethers');
require('dotenv').config();
const { NETWORK_CONSTANT } = require('../helpers/constant');

exports.getProvider = (chainId) => {
  let rpc, newestBlock;
  for (let i = 0; i < NETWORK_CONSTANT.length; i++) {
    if (chainId === NETWORK_CONSTANT[i].chainId) {
      rpc = NETWORK_CONSTANT[i].rpc;
      newestBlock = NETWORK_CONSTANT[i].newestBlock;
      break;
    }
  }
  let provider = new ethers.providers.JsonRpcProvider(rpc);
  provider.resetEventsBlock(newestBlock);
  return provider;
};
