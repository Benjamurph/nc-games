const { selectCategories,
        selectReviewById,
        updateVotes
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