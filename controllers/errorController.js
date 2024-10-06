const errorController = {}

errorController.triggerError = (req, res, next) => {
  const error = new Error("This is an intentional 500 error.");
  error.status = 500;
  next(error);
};

module.exports = errorController