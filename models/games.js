const db = require("../db/connection");
const categories = require("../db/data/test-data/categories");

exports.selectCategories = () => {
  return db.query("SELECT * FROM categories;").then((result) => {
    return result.rows;
  });
};

exports.selectReviewById = (id) => {
  const { review_id } = id;
  return db
    .query(
      `SELECT reviews.*, COUNT(comments.review_id) AS comment_count FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;`,
      [review_id]
    )
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          status: 404,
          msg: `no review found under id ${review_id}`,
        });
      }
      result.rows[0].comment_count = parseInt(result.rows[0].comment_count);
      return result.rows[0];
    });
};

exports.updateVotes = (newVotes, id) => {
  const { review_id } = id;
  if (!newVotes.hasOwnProperty("inc_votes") || isNaN(newVotes.inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid patch request, please reformat your patch",
    });
  }
  return db
    .query(
      `UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *;`,
      [newVotes.inc_votes, review_id]
    )
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          status: 404,
          msg: `no review found under id ${review_id}`,
        });
      }
      return result.rows[0];
    });
};

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then((results) => {
    return results.rows;
  });
};

exports.selectReviews = (sort_by = "created_at", order = "desc", category) => {
  const sortOptions = [
    "review_id",
    "title",
    "designer",
    "owner",
    "review_img_url",
    "review_body",
    "category",
    "created_at",
    "votes",
    "comment_count",
  ];
  
  const sortOrder = ["asc", "desc", "ASC", "DESC"];
  const categoryList = [];
  let where = `WHERE reviews.category = $1`
  if(!category) {
      where = '';
  };

  if (!sortOptions.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: `Invalid sort query, ${sort_by} does not exist`,
    });
  };

  if (!sortOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: `Invalid sort order query`,
    });
  };

  return db
  .query("SELECT categories.slug FROM categories;")
  .then((result) => {
    result.rows.forEach((category) => {
      categoryList.push(category.slug);
    });
  })
  .then(() => {
    let queryString =
     `SELECT reviews.*, COUNT(comments.review_id) AS comment_count
      FROM reviews
      LEFT JOIN comments ON reviews.review_id = comments.review_id`;
    if (category) {
      queryString +=
       ` WHERE reviews.category = $1
         GROUP BY reviews.review_id
         ORDER BY ${sort_by} ${order};`;

      return db.query(queryString, [category]).then((result) => {
        if (!result.rows.length && !categoryList.includes(category)) {
          return Promise.reject({
            status: 404,
            msg: `No reviews found under the category name: ${category}`,
          });
        }
        return result.rows;
      });
    } else {
      queryString += ` GROUP BY reviews.review_id ORDER BY ${sort_by} ${order};`;
      return db.query(queryString).then((result) => {
        return result.rows;
      });
    };
  });
};

exports.selectCommentsByReviewId = (id) => {
  const { review_id } = id;
  return db
    .query(`SELECT * FROM comments WHERE review_id = $1;`, [review_id])
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({
          status: 404,
          msg: `no review found under id ${review_id}`,
        });
      }
      return results.rows;
    });
};

exports.insertComment = (newComment, id) => {
  if (
    !newComment.hasOwnProperty("body") ||
    !newComment.hasOwnProperty("author") ||
    typeof newComment.body !== "string" ||
    typeof newComment.author !== "string"
  ) {
    return Promise.reject({
      status: 400,
      msg: "Invalid post request, please reformat your post",
    });
  }
  newComment.votes = 0;
  newComment.review_id = id.review_id;
  newComment.created_at = new Date(Date.now());
  const { body, author, votes, review_id, created_at } = newComment;
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          status: 404,
          msg: `no review found under id ${review_id}`,
        });
      };

      return db
        .query(
          `INSERT INTO comments (body, author, votes, review_id, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
          [body, author, votes, review_id, created_at]
        )
        .then((result) => {
          return result.rows[0];
        });
    });
};

exports.removeCommentById = (id) => {
    const { comment_id } = id;

    return db.query('DELETE FROM comments WHERE comment_id = $1 RETURNING *;', [comment_id])
    .then((result) => {
        if (!result.rows.length) {
            return Promise.reject({
              status: 404,
              msg: `No comment found under id ${comment_id}`,
            });
          };
        return result.rows[0];
    });
};
