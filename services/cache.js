const mongoose = require('mongoose');
const redis = require('redis');
const keys = require('../config/keys');
const util = require('util');
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;
// sudo service redis-server start
mongoose.Query.prototype.cache = function(options={}){
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function () {
    // console.log('I am about to run a query');
    // console.log(this.getQuery());
    // console.log(this.mongooseCollection.name());
    if(!this.useCache){
        return exec.apply(this,arguments);
    };
    const key = JSON.stringify(Object.assign({},this.getQuery(),{
        collection:this.mongooseCollection.name
    }));

    const cacheValue = await client.hget(this.hashKey,key);

    if(cacheValue){
        // console.log(this);    
        // const doc = new this.model(JSON.parse(cacheValue));
        // return JSON.parse(cacheValue);

        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) 
            ? doc.map(d=>new this.model(d))
            : new this.model(doc);
    }
    
    const result = await exec.apply(this,arguments);
    client.hset(this.hashKey,key,JSON.stringify(result)); 
    return result;

}

module.exports={
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey));
    }
}