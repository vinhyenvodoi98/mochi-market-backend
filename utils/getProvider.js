const { ethers } = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.NETWORK_RPC);
provider.resetEventsBlock(8114472); //replace with newest blocknumber

exports.provider = provider;
