const fs = require('fs');
const axios = require('axios');
const sharp = require('sharp');
const FormData = require('form-data');
require('dotenv').config();

const uploadFileToIpfs = async (data) => {
  try {
    const uploadedData = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data`,
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET,
        ...data.getHeaders(),
      },
    });
    return uploadedData.data.IpfsHash;
  } catch (error) {
    console.log(error);
  }
};

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    (response) =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on('finish', () => resolve(true))
          .on('error', (e) => reject(false));
      })
  );

const downQuality = async (image) => {
  if (image.length > 0) {
    try {
      let thumb = '';
      let nonce = Math.floor(Math.random() * 900000000300000000000) + 1000000000000000;
      let isSuccess = await download_image(image, `thumb${nonce}.png`);
      if (isSuccess) {
        await sharp(`thumb${nonce}.png`).resize(180, 225).toFile(`thumb${nonce}1.png`);
        let formData = new FormData();
        formData.append('file', fs.createReadStream(`thumb${nonce}1.png`));
        const ipfsHash = await uploadFileToIpfs(formData);
        thumb = 'https://storage.mochi.market/ipfs/' + ipfsHash;
      }

      fs.unlinkSync(`thumb${nonce}.png`);
      fs.unlinkSync(`thumb${nonce}1.png`);
      return thumb;
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = {
  downQuality,
};
