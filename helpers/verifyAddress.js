const { utils } = require('ethers');

exports.isAddress = (address) => {
  return utils.isAddress(address);
};

exports.validChainId = (chainId) => {
  return chainId == '56' || chainId == '97' || chainId == '137';
};
