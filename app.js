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
  const nftRouter = require('./routes/nft');
  const userRouter = require('./routes/user');
  const sellOrderRouter = require('./routes/sellOrder');

  mongoose.connect(
    process.env.MONGODB_URI,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (error) => {
      if (error) console.log(error);
    }
  );

  mongoose.set('useCreateIndex', true);

  let whitelist = [process.env.ORIGIN_CORS];
  let corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  };

  // app.use(cors());
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/nft', cors(corsOptions), nftRouter);
  app.use('/user', cors(corsOptions), userRouter);
  app.use('/sellOrder', cors(corsOptions), sellOrderRouter);

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
