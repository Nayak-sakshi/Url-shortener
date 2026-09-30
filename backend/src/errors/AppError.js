class Apperror extends Error {
  constructor(message, statusCode = 500){
    super(message);
    this.statusCode = statusCode;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
    
}

module.exports = Apperror;

