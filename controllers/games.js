const { selectCategories,
        selectReviewById,
        updateVotes,
        selectUsers,
        selectReviews
      } = require('../models/games');

exports.getCategories = (req, res, next) => {
    selectCategories().then((categories) => {
        res.status(200).send({ categories });
    })
    .catch((err) => {
        next(err);
    });
};

exports.getReviewById = (req, res, next) => {
    selectReviewById(req.params).then((review) => {
        review.created_at = `${review.created_at}`;
        res.status(200).send({ review });
    })
    .catch(next);
};

exports.updateReview = (req, res, next) => {
    updateVotes(req.body, req.params).then((review) => {
        review.created_at = `${review.created_at}`;
        res.status(200).send({ review });
    })
    .catch(next);
};

exports.getUsers= (req, res, next) => {
    selectUsers().then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
  };

  exports.getReviews = (req, res, next) => {
    selectReviews().then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
  };