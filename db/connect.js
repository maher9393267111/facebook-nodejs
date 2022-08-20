const mongoose = require("mongoose");

url = process.env.MONGO_URI;


const connectDB = (url) => {
    mongoose.connect(
        url
       
        ,
         {
       useNewUrlParser: true,
       useUnifiedTopology: true,
      
    }).then(() => {
        console.log('MongoDB connected');
    })
};

module.exports = connectDB;