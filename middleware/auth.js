const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes
exports.protect = asyncHandler( async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure tokens were sent
    if (!token) {
        return next(
            new ErrorResponse('Invalid authorization credentials', 401)
        );
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        return next(
            new ErrorResponse('Invalid authorization credentials', 401)
        );        
    }
})

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse('You do not have the right access level for this action', 403)
            );
        }
        next();
    };
};