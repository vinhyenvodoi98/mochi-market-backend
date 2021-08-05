/* eslint-disable no-underscore-dangle */

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();

require('dotenv').config();

async function main() {
  const collectionRouter = require('./routes/collection');
  const nftRouter = require('./routes/nft');
  const userRouter = require('./routes/user');
  const verifyRouter = require('./routes/verify');
  const sellOrderRouter = require('./routes/sellOrder');
  const verifyAllNetworkRouter = require('./routes/verifyAllNetwork');
  const statusRouter = require('./routes/status');

  mongoose.connect(
    process.env.MONGODB_URI,
    { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
    (error) => {
      if (error) console.log(error);
    }
  );

  mongoose.set('useCreateIndex', true);

  const orginCors = process.env.ORIGIN_CORS;
  let whitelist = orginCors.split(',');
  let corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };

  //app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/collection', cors(corsOptions), collectionRouter);
  app.use('/nft', cors(corsOptions), nftRouter);
  app.use('/user', cors(corsOptions), userRouter);
  app.use('/sellOrder', cors(corsOptions), sellOrderRouter);
  app.use('/verify', cors(corsOptions), verifyRouter);
  app.use('/verifyAllNetwork', cors(corsOptions), verifyAllNetworkRouter);
  app.use('/status', statusRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    console.error(err);
    res.status(err.status || 500);
    res.send({ err });
    next();
  });

  console.log('Run completed');
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = app;
