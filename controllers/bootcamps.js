const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    // create a copy of req.query
    const reqQuery = { ...req.query };

    // fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // loop over removeFields and delete them from query
    removeFields.forEach(param => delete reqQuery[param]);

    // create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gte, $lte, etc.)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => `$${match}`);

    // fetch resource
    query = Bootcamp.find(JSON.parse(queryStr));

    // Select Fields to be returned
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const bootcamps = await query;

    // Pagination results
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination,
        data: bootcamps
    });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        next(
            new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        next(
            new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    
    if (!bootcamp) {
        next(
            new ErrorResponse(`Bootcamp with id of ${req.params.id} not found`, 404)
        );
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get latitude and longitude from Geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const long = loc[0].longitude;
    // Calculate radius using radians
    // Divide distance by radius of Earth
    // Earth radius = 3,963 miles / 6378.1 km
    const earthRad = 3963;
    const radius = distance / earthRad;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [long, lat],
                    radius
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
});