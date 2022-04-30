const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rped8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
  try{
    await client.connect();
    const perfumeCollection = client.db("bottledHeaven").collection("perfumes");

    // get perfumes inventories api
    app.get('/perfumes',async(req,res)=>{
        const query = {};
        const cursor = perfumeCollection.find(query);
        const perfumes = await cursor.toArray();
        res.send(perfumes);
    })

    //  find one perfume from inventories with id api
    app.get('/perfumes/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const perfume = await perfumeCollection.findOne(query);
        res.send(perfume);
    })

    // post new perfume in inventories 
    app.post('/perfumes',async(req,res)=>{
      const newPerfume = req.body;
      const result = await perfumeCollection.insertOne(newPerfume);
      res.send(result);
  })
  }
  finally{
      
  }
}
run().catch(console.dir);
app.get('/',(req,res)=>{
    res.send('Running Bottled Heaven Server');
})
app.listen(port,()=>{
    console.log('Listening to port',port);
})
