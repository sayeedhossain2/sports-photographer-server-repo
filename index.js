const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.khpqtwr.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    // 1st database and collection
    const serviceCollection = client
      .db("sportsPhotographer")
      .collection("service");
    // 2nd database and collection
    const reviewCollection = client
      .db("sportsPhotographer")
      .collection("review");

    // post data from site
    app.post("/AddService", async (req, res) => {
      const AddService = req.body;
      const result = await serviceCollection.insertOne(AddService);
      res.send(result);
    });

    //   get 3 data using limit from db
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const service = await cursor.limit(3).toArray();
      res.send(service);
    });

    // get all data from db
    app.get("/allService", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const service = await cursor.toArray();
      res.send(service);
    });

    // get specific data using id from db
    app.get("/singleService/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleService = await serviceCollection.findOne(query);
      res.send(singleService);
    });

    // review data post from client to db
    app.post("/review", async (req, res) => {
      const reviewer = req.body;
      const result = await reviewCollection.insertOne(reviewer);
      res.send(result);
    });

    // review all data get from db
    app.get("/allReview", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const allReviewer = await cursor.toArray();
      res.send(allReviewer);
    });
    //  only my reviev (find with email)
    app.get("/userReview", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const userReview = await cursor.toArray();
      res.send(userReview);
    });

    app.put("/usersReview/:id", (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
    });

    //  delete method
    app.delete("/reviewUser/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("sports photographer server is running");
});

app.listen(port, () => {
  console.log(`sports photographer server running on ${port}`);
});

// storts bd server
