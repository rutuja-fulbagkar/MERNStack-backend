import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors"; 
import authRoute from './routes/authRoutes.js'
import productRoute from './routes/productRoutes.js'
import path from 'path';
import {fileURLToPath } from 'url';

// Load environment variables
dotenv.config();
// Connect to the database
connectDB();
 
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => { 
    res.send('Hello, World!');
})
// Middleware to parse JSON request bodies
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api', productRoute);
// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS
app.use(cors());
// Create an HTTP server
const httpServer = createServer(app);
//  Set the port from environment variables
const PORT = process.env.PORT || 8000;
// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});

