//using promises

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))

      .catch((error) => next(error));
  };
};
export default asyncHandler;



// //using try-catch method

// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (error) {
//     res.status(error.code || 500);
//     message: error.message;

// }
// };
