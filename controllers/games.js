const { selectCategories,
        selectReviewById,
        updateVotes,
        selectUsers,
        selectReviews,
        selectCommentsByReviewId,
        insertComment,
        removeCommentById
      } = require('../models/games');

const endpoints = require('../endpoints.json') ;


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
    const { sort_by, order, category } = req.query;

    selectReviews(sort_by, order, category).then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
  };

  
exports.getCommentsByReviewId = (req, res, next) => {
    selectCommentsByReviewId(req.params).then((comments) => {
      comments.created_at = `${comments.created_at}`;
      res.status(200).send({ comments })
    })
    .catch(next);
  };

  exports.postComment= (req, res, next) => {
    insertComment(req.body, req.params).then((comment) => {
        comment.created_at = `${comment.created_at}`;
      res.status(201).send({ comment })
    })
    .catch(next);
  };

  exports.deleteCommentById = (req, res, next) => {
    removeCommentById(req.params).then((comment) => {
      res.status(204).send({})
    })
    .catch(next);
  };

  exports.getApi = (req, res, next) => {
    res.status(200).send(endpoints);
  }