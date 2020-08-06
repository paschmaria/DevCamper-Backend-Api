const advancedResults = (model, populate) => (req, res, next) => {
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
    query = model.find(JSON.parse(queryStr));

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
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if (populate) {
        query = auery.populate(populate);
    }

    // Executing query
    const results = await query;

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
    
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };
};

module.exports = advancedResults;