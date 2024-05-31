const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');
const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });
    
    res.send(blog);
  });
  
  app.get('/api/blogs', requireLogin, async (req, res) => {
    /*
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisUrl);
    const util = require('util');
    
    client.get= util.promisify(client.get);

    const cachedBlogs = await client.get('req.user.id');

    if(cachedBlogs){
      console.log('serving from cache');
      return res.send(JSON.parse(cachedBlogs));
    }
    	*/

    const blogs = await Blog
    .find({ _user: req.user.id })
    .cache({key:req.user.id}); // .cache() boolean to test wether to server the data from cache or not 
    

    // console.log('serving from mongodb');
    // client.set('req.user.id',JSON.stringify(blogs));


    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin,cleanCache, async (req, res) => {
    const { title, content,imageUrl } = req.body;

    const blog = new Blog({
      imageUrl,
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);

    } catch (err) {
      res.send(400, err);
    }
    // clearHash(req.user.id);
  });
};