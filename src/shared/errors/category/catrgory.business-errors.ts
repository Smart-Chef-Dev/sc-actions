export const CategoryBusinessErrors = {
  NotFoundCategory: {
    errorMessage: 'Restaurant not found',
    reason: `Provided restaurant ids doesn't exist in DB`,
  },
  BadRequest: {
    errorMessage: 'Bad request',
    reason: `RestaurantId is not valid`,
  },
};
