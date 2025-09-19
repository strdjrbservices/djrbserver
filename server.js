const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;

app.use(cors({
  origin: ['http://localhost:3000', 'djrbreview.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

let db;

async function connectDB() {
  try {
    const client = new MongoClient(uri, {
      
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db(); 
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/collections', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    console.log('Listing collections...');
    const collections = await db.listCollections().toArray();
    const names = collections.map((c) => c.name);
    res.json(names);
  } catch (err) {
    console.error('Error listing collections:', err);
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/BPL_Mortgage,_LLC', async (req, res) => {
  try {
    const collection = db.collection('BPL_Mortgage,_LLC');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/Best2Lend_LLC', async (req, res) => {
  try {
    const collection = db.collection('Best2Lend_LLC');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/Always_Reject', async (req, res) => {
  try {
    const collection = db.collection('Always_Reject');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/Field_review', async (req, res) => {
  try {
    const collection = db.collection('Field_review');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/Ice_Lender', async (req, res) => {
  try {
    const collection = db.collection('Ice_Lender');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/OCMBC', async (req, res) => {
  try {
    const collection = db.collection('OCMBC');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/2090', async (req, res) => {
  try {
    const collection = db.collection('2090');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/Kind_lending', async (req, res) => {
  try {
    const collection = db.collection('Kind_lending');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get('/api/Desktop_appraisal', async (req, res) => {
  try {
    const collection = db.collection('Desktop_appraisal');
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generic CRUD routes - must be at the end after all specific routes
app.get('/api/:collectionName', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    const collection = db.collection(req.params.collectionName);
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new record
app.post('/api/:collectionName', async (req, res) => {
  try {
    console.log('POST request to:', req.params.collectionName);
    console.log('Request body:', req.body);
    
    if (!db) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    const collection = db.collection(req.params.collectionName);
    const result = await collection.insertOne(req.body);
    console.log('Insert result:', result);
    res.json({ _id: result.insertedId, ...req.body });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update record
app.put('/api/:collectionName/:id', async (req, res) => {
  try {
    console.log('PUT request to:', req.params.collectionName, 'ID:', req.params.id);
    console.log('Request body:', req.body);
    
    if (!db) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    const collection = db.collection(req.params.collectionName);
    const { ObjectId } = require('mongodb');
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    console.log('Update result:', result);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record updated successfully' });
  } catch (err) {
    console.error('PUT error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete record
app.delete('/api/:collectionName/:id', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ message: 'Database not connected' });
    }
    const collection = db.collection(req.params.collectionName);
    const { ObjectId } = require('mongodb');
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
