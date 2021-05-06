// Import env vars defined in the .env file in the root directory
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// Other Imports
import express, { Application, Request, Response, NextFunction } from 'express';
import connectDB from './db';

// Express configuration
const app: Application = express();
const PORT: string | number = process.env.PORT || 5000;

// Connect to database
connectDB(process.env.MONGO_URI);

// // Init middleware
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('hello');
});

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));

// Start app
app.listen(PORT, () => {
    console.log('Server started on port ' + PORT);
});
