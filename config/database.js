const config = {
    port: 4000 || process.env.PORT,
    database: 'mongodb://localhost/shoppingcart',
    options: {
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
        useFindAndModify: false 
    }
  };
  
  // let environment = process.env.NODE_ENV || 'development';
  // console.log('Loaded Configs : '+environment);
module.exports = config;