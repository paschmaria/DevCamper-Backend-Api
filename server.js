const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');
// MongoDB Connection
const connectDB = require('./config/db');

// load env vars
dotenv.config({ path: './config/config.env' });

// URL Routes
const auth = require('./routes/auth');
const courses = require('./routes/courses');
const bootcamps = require('./routes/bootcamps');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// file uploading
app.use(fileUpload());

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
