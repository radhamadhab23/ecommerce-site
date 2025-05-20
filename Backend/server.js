import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // Importing the auth routes
import { connectDB } from './lib/db.js';   // Importing the database connection function
import cookieParser from 'cookie-parser';// Importing cookie-parser middleware
dotenv.config(); // Allows us to use environment variables

const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable or default to 5000

app.use(express.json()); // Middleware to parse JSON requests
app.use(cookieParser());// Middleware to parse cookies

console.log("process.env.PORT", process.env.PORT);

// Routes
app.use("/api/auth", authRoutes);

// Connect to DB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit process if DB connection fails
});
