const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://dylanmcmullen9:hvZMcRxY73ljXmC3@cluster0.gb6znjn.mongodb.net/Marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    quantity: Number,
    category: String
  });
  
  const Product = mongoose.model('Product', productSchema);
  

  
// Get all products
app.get('/api/products', async (req, res) => {
    try {
      const { name } = req.query;
      if (name) {
        const products = await Product.find({ name: { $regex: name, $options: 'i' } });
        res.json(products);
      } else {
        const products = await Product.find({});
        res.json(products);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not retrieve products' });
    }
  });


// Get a product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve the product' });
    }
});

  // Add new product
  app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category 
        });

        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create the product' });
      }
      
});
  
// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Could not update the product' });
    }
});
// Delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndRemove(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(deletedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Could not delete the product' });
    }
});

// Delete all products
app.delete('/api/products', async (req, res) => {
    try {
        const deletedProducts = await Product.deleteMany({});
        res.json({ message: 'All products deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Could not delete all products' });
    }
});

// Get products by name containing a keyword
app.get('/api/products?name=[kw]', async (req, res) => {
    try {
        const { name } = req.query;
        if (name) {
            // Use Mongoose to find products in the database with names containing the specified keyword
            const products = await Product.find({ name: { $regex: name, $options: 'i' } });
            res.json(products);
        } else {
            // If 'name' is not provided, return an empty array
            res.json([]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not retrieve products' });
    }
});


  
// Add a route for the root URL
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DressStore application.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});