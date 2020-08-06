const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        next(
            new ErrorResponse(`Course with id of ${req.params.id} not found`, 404)
        );
    }

    res.status(200).json({
        success: true,
        count: courses.length,
        data: course
    });
});

// @desc    Add course
// @route   POST /api/v1/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        next(
            new ErrorResponse(`Bootcamp with id of ${req.params.bootcampId} not found`, 404)
        );
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamp
    });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        next(
            new ErrorResponse(`Course with id of ${req.params.id} not found`, 404)
        );
    };

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        count: courses.length,
        data: course
    });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        next(
            new ErrorResponse(`Course with id of ${req.params.id} not found`, 404)
        );
    };

    await course.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});