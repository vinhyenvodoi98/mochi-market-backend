const mongoose = require('mongoose');
const axios = require('axios');
const NFT = require('../models/NFT');
const { getAcceptedNfts, initERC721 } = require('../helpers/blockchain');

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

const addressUser = '0x763f7825251563191C055cBB003743085072f3F8';

const main = async () => {
  try {
    const nftList = await getAcceptedNfts();
    const erc721Instances = await initERC721(nftList);

    let getERC721 = async (instance) => {
      let ERC721token = {};
      let balance = await instance.balanceOf(addressUser);
      if (balance > 0) {
        ERC721token.balanceOf = await instance.balanceOf(addressUser);
        ERC721token.name = await instance.name();
        ERC721token.symbol = await instance.symbol();
        ERC721token.addressToken = instance.address;
        ERC721token.tokens = [];

        for (let i = 0; i < ERC721token.balanceOf; i++) {
          let token = {};
          token.index = parseInt(await instance.tokenOfOwnerByIndex(addressUser, i));
          token.tokenURI = await instance.tokenURI(token.index);
          try {
            let req = await axios.get(token.tokenURI);
            token.detail = req.data;
            ERC721token.tokens.push(token);
          } catch (error) {
            token.detail = { name: 'Unnamed', description: '' };
            ERC721token.tokens.push(token);
          }
        }
      }
    };

    let erc721Tokens = await Promise.all(
      erc721Instances.map((instance) => {
        getERC721(instance);
      })
    );

    erc721Tokens = erc721Tokens.filter(function (el) {
      return el != null;
    });

    for (let i = 0; i < erc721Tokens.length; i++) {
      let NFTData = new NFT({
        address: addressUser,
        addressToken: erc721Tokens[i].addressToken,
        name: erc721Tokens[i].name,
        symbol: erc721Tokens[i].symbol,
        tokens: erc721Tokens[i].tokens,
      });

      await NFTData.save();
      console.log('DONE');
      process.exit(0);
    }
  } catch (err) {
    console.log({ err });
    process.exit(1);
  }
};

main();
