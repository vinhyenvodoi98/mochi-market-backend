const mongoose = require('mongoose');
const axios = require('axios');
const NFT = require('../models/NFT');
const ERC721Token = require('../models/ERC721Token');
const User = require('../models/User');
const { getAcceptedNfts, initERC721, getOwner } = require('../helpers/blockchain');

require('dotenv').config();

mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

const fetchErc721 = async () => {
  try {
    const nftList = await getAcceptedNfts();
    const erc721Instances = await initERC721(nftList);

    let getERC721 = (instance) => {
      return new Promise(async (resolve) => {
        let ERC721token = {};

        // Save ERC721 basic info
        ERC721token.name = await instance.name();
        ERC721token.symbol = await instance.symbol();
        ERC721token.addressToken = instance.address;

        let nft = new NFT({
          name: ERC721token.name,
          symbol: ERC721token.symbol,
          address: ERC721token.addressToken,
          onModel: 'ERC721Token',
        });

        let recordedNFT = await nft.save();

        ERC721token.tokens = [];
        // max 999999 id, it will break if undefined
        for (let i = 1; i < 999999; i++) {
          let tokenURI = await instance.tokenURI(i);
          if (tokenURI) {
            console.log({ tokenURI });
            try {
              let req = await axios.get(tokenURI);

              let erc721 = new ERC721Token({
                tokenId: i,
                tokenURI: tokenURI,
                name: !!req.data.name ? req.data.name : 'Unnamed',
                image: !!req.data.image ? req.data.image : '',
                description: !!req.data.description ? req.data.description : '',
                nft: recordedNFT.id,
              });

              // save ERC721
              let recordedERC721 = await erc721.save();

              // update NFT
              await NFT.updateOne(
                { _id: recordedNFT._id },
                { $push: { tokens: recordedERC721._id } }
              );

              // update owner
              let ownerAddress = await getOwner(ERC721token.addressToken, i);
              console.log({ ownerAddress });
              // update owner

              await User.findOneAndUpdate(
                { address: ownerAddress },
                { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            } catch (error) {
              let erc721 = new ERC721Token({
                tokenId: i,
                tokenURI: tokenURI,
                name: 'Unnamed',
                image: '',
                description: 'error',
                nft: recordedNFT.id,
              });

              // save ERC721
              let recordedERC721 = await erc721.save();

              // update NFT
              await NFT.updateOne(
                { _id: recordedNFT._id },
                { $push: { tokens: recordedERC721._id } }
              );

              // update owner
              let ownerAddress = await getOwner(ERC721token.addressToken, i);

              await User.findOneAndUpdate(
                { address: ownerAddress },
                { expire: new Date(), $push: { erc721tokens: recordedERC721._id } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
            }
          } else break;
        }
        resolve(ERC721token);
      });
    };

    await Promise.all(
      erc721Instances.map(async (instance) => {
        return await getERC721(instance);
      })
    );

    console.log('DONE');
    process.exit(0);
  } catch (error) {
    console.log({ err });
  }
};

const main = async () => {
  var myArgs = process.argv.slice(2);
  if (myArgs[0] === 'erc721') await fetchErc721();
  // else if(myArgs[0]==='erc1155') ...
  process.exit(1);
};

main();
