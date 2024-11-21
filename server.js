import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/dbs.js";
import cors from "cors"; 
n

// Load environment variables
dotenv.config();
// Connect to the database
connectDB();
 
const app = express();
// app.get('/', (req, res) => { 
//     res.send('Hello, World!');
// })
// Middleware to parse JSON request bodies
app.use(express.json());
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

