const express = require('express');
const VerifyAllNetwork = require('../models/VerifyAllNetwork');
const router = express.Router();

router.post('/', async (req, res) => {
  var { address, network } = req.body;
  address = address.toLowerCase();
  try {
    let verifyAllNetwork = new VerifyAllNetwork({
      address,
      network,
    });

    await verifyAllNetwork.save();
    return res.json({ isSuccess: true });
  } catch (err) {
    return res.json({ isSuccess: false });
  }
});

router.get('/', async (req, res) => {
  var { network } = req.query;
  try {
    var verifiedAddress;
    if (!!network) {
      network = parseInt(network);
      verifiedAddress = await VerifyAllNetwork.find({ network });
    } else {
      verifiedAddress = await VerifyAllNetwork.find();
    }
    let arrAdd = verifiedAddress.map((add) => add.address);
    return res.json(arrAdd);
  } catch (err) {
    return res.json([]);
  }
});

router.delete('/:address', async (req, res) => {
  var { address } = req.params;
  address = address.toLowerCase();
  try {
    verifiedAddress = await VerifyAllNetwork.deleteOne({ address });
    if (verifiedAddress.n !== 0) return res.json({ isSuccess: true });
    else return res.json({ isSuccess: false, message: 'address not exists' });
  } catch (err) {
    return res.json({ isSuccess: false });
  }
});

module.exports = router;
