const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.khpqtwr.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    // JWT
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1hr",
      });
      res.send({ token });
    });

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
      const service = await cursor.limit(3).sort({ _id: -1 }).toArray();
      res.send(service);
    });

    // get all data from db
    app.get("/allService", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const service = await cursor.sort({ _id: -1 }).toArray();
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
      const allReviewer = await cursor.sort({ date: -1 }).toArray();
      res.send(allReviewer);
    });
    //  only my reviev (find with email)
    app.get("/userReview", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log(decoded, req.query.email);
      // console.log("inside api", decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "forbiden" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query);
      const userReview = await cursor.sort({ date: -1 }).toArray();
      res.send(userReview);
    });

    // put get data  method
    app.get("/usersReview/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await reviewCollection.findOne(query);
      res.send(user);
    });

    // put update method
    app.put("/usersReview/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updated = req.body;
      const option = { upsert: true };
      const updateReview = {
        $set: {
          rating: updated.rating,
          message: updated.message,
        },
      };

      const result = await reviewCollection.updateOne(
        filter,
        updateReview,
        option
      );
      res.send(result);
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

// sports db server
