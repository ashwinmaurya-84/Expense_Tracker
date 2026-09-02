const ApiError = require("../utils/ApiError");



const errorHandler = (err, req, res, next) => {
    console.error(err);


    if (err.name === "TokenExpiredError") {
        err = new ApiError(401, "Token expired");
    }

    if (err.name === "JsonWebTokenError") {
        err = new ApiError(401, "Invalid token");
    }

    if (err.name === "CastError") {
        err = new ApiError(400, "Invalid expense ID");
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;