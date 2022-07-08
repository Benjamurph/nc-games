const { selectCategories,
        selectReviewById,
        updateVotes,
        selectUsers,
        selectReviews,
        selectCommentsByReviewId,
        insertComment,
        removeCommentById,
        SelectUserByUsername,
        updateCommentVotes,
        insertReview
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
    const { sort_by, order, category, limit, p } = req.query;

    selectReviews(sort_by, order, category).then((reviews) => {
      totalCount = reviews.length;
      if(p) {
        if(isNaN(+p)) {
          return Promise.reject({
            status: 400,
            msg: `Limit or page must be a number`,
          });
        }
      }
      if (limit) {
        if (isNaN(+limit)) {
          return Promise.reject({
            status: 400,
            msg: `Limit or page must be a number`,
          });
        };
        const result = [];
        let startPoint = limit * p - limit;
        let endPoint = limit * p;
        if (!p) {
          startPoint = 0;
          endPoint = limit;
        }
        for (let i = startPoint; i < endPoint; i++) {
          if(reviews[i]) {
            result.push(reviews[i]);
          }
        }
        reviews = result;
        res.status(200).send({ total_count: totalCount, reviews });
      } else res.status(200).send({ total_count: totalCount, reviews });
    })
    .catch((err) => {
      next(err);
    });
  };

  
exports.getCommentsByReviewId = (req, res, next) => {
  const { limit, p } = req.query;
    selectCommentsByReviewId(req.params).then((comments) => {
      comments.created_at = `${comments.created_at}`;
      if(p) {
        if(isNaN(+p)) {
          return Promise.reject({
            status: 400,
            msg: `Limit or page must be a number`,
          });
        }
      }
      if (limit) {
        if (isNaN(+limit)) {
          return Promise.reject({
            status: 400,
            msg: `Limit or page must be a number`,
          });
        };
        const result = [];
        let startPoint = limit * p - limit;
        let endPoint = limit * p;
        if (!p) {
          startPoint = 0;
          endPoint = limit;
        }
        for (let i = startPoint; i < endPoint; i++) {
          if(comments[i]) {
            result.push(comments[i]);
          }
        }
        comments = result;
        res.status(200).send({ comments });
      } else res.status(200).send({ comments });
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
  };

  exports.getUserByUsername = (req, res, next) => {
    SelectUserByUsername(req.params).then((user) => {
      res.status(200).send({ user })
    })
    .catch(next);
  };

  
exports.updateComment = (req, res, next) => {
  updateCommentVotes(req.body, req.params).then((comment) => {
      comment.created_at = `${comment.created_at}`;
      res.status(200).send({ comment });
  })
  .catch(next);
};

exports.postReview = (req, res, next) => {
  insertReview(req.body).then((review) => {
    review.created_at = `${review.created_at}`;
    res.status(201).send({review});
  })
  .catch(next);
};