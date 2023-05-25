const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).send({ message: 'Unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    console.log('decoded', decoded);
    req.decoded = decoded;
    next();
  })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rped8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
  try {
    client.connect();
    const perfumeCollection = client.db("bottledHeaven").collection("perfumes");

    // Auth for JWT token
    app.post('/login', async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
      });
      res.send({ accessToken });
    })

    // get perfumes inventories api
    app.get('/perfumes', async (req, res) => {
      const query = req.query;
      const cursor = perfumeCollection.find(query);
      const perfumes = await cursor.toArray();
      res.send(perfumes);
    })

    //  find one perfume from inventories with id api
    app.get('/perfumes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const perfume = await perfumeCollection.findOne(query);
      res.send(perfume);
    })

    //  update quantity
    app.put('/perfumes/:id', async (req, res) => {
      const id = req.params.id;
      const updatedInventory = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedInventory.quantity
        }
      };
      const result = await perfumeCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })

    // post new perfume in inventories 
    app.post('/perfumes', async (req, res) => {
      const newPerfume = req.body;
      const result = await perfumeCollection.insertOne(newPerfume);
      res.send(result);
    })

    // delete perfume by id from inventories
    app.delete('/perfumes/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = perfumeCollection.deleteOne(query);
      res.send(result);
    })
  }
  finally {

  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Running Bottled Heaven Server');
})
app.listen(port, () => {
  console.log('Listening to port', port);
})
