const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');

// load env vars
dotenv.config({ path: './config/config.env' });

const errorHandler = require('./middleware/error');
// MongoDB Connection
const connectDB = require('./config/db');
// URL Routes
const bootcamps = require('./routes/bootcamps');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// mount routes
app.use('/api/v1/bootcamps', bootcamps);
// use error middleware
app.use(errorHandler)

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}!`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server and exit process with failure
    server.close(() => process.exit(1));
})
