const express = require('express');
const mongoose = require('mongoose');
const { routes } = require('./routes');
const { PORT = 3000 } = process.env;

const app = express();

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connect to db');

  app.use((req, res, next) => {
    req.user = {
      _id: '646df6e042cdb437b221fdc1',
    };
    next();
  });

  app.use(routes);

  await app.listen(PORT);

  console.log(`App listening on port ${PORT}`);
}

main();