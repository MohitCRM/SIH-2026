const mongoose = require('mongoose');

async function main()
{
    await mongoose.connect(process.env.MONGO_DB_CONNECTION_LINK);
}

module.exports = main;