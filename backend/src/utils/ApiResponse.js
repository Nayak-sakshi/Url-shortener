class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  // Static helper — sends the response directly
  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json(
      new ApiResponse(statusCode, message, data)
    );
  }

  static error(res, message = "Something went wrong", statusCode = 500, data = null) {
    return res.status(statusCode).json(
      new ApiResponse(statusCode, message, data)
    );
  }
}

module.exports = ApiResponse;