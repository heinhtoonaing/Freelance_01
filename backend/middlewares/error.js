class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Log the error for debugging
  console.error(err); 

  // Set default values for message and statusCode
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // Handle specific error types
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  } else if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  } else if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, try again!`;
    err = new ErrorHandler(message, 400);
  } else if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired, try again!`;
    err = new ErrorHandler(message, 400);
  }

  // Return the response with the error message and status code
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
  });
};

export default ErrorHandler;
