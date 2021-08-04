const { utils } = require('ethers');

exports.isAddress = (address) => {
  return utils.isAddress(address);
};
