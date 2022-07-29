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
          msg: `No review found under id ${review_id}`,
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

  return db.query(`SELECT * FROM reviews WHERE review_id = $1
  ORDER BY created_at desc;`, [review_id])
  .then((results) => {
    if (!results.rows.length) {
      return Promise.reject({
        status: 404,
        msg: `No review found under id ${review_id}`,
      });
    }
  })
  .then(() => {
    return db
    .query(`SELECT * FROM comments WHERE review_id = $1
            ORDER BY created_at desc;`, [review_id])
    .then((results) => {
      
      return results.rows;
    });
  })
  
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
    });
};

exports.SelectUserByUsername = (user) => {
  return db.query(`SELECT * FROM users WHERE username = $1;`, [user.username])
  .then((result) => {
    if (!result.rows.length) {
      return Promise.reject({
        status: 404,
        msg: `No user found under the username ${user.username}`,
      });
    };
    return result.rows[0];
  });
};

exports.updateCommentVotes = (newVotes, id) => {
  const { comment_id } = id;
  if (!newVotes.hasOwnProperty("inc_votes") || isNaN(newVotes.inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid patch request, please reformat your patch",
    });
  }
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`,
      [newVotes.inc_votes, comment_id]
    )
    .then((result) => {
      if (!result.rows.length) {
        return Promise.reject({
          status: 404,
          msg: `No comment found under id ${comment_id}`,
        });
      }
      return result.rows[0];
    });
};

exports.insertReview = (newReview) => {
  if (
    !newReview.hasOwnProperty("title") ||
    !newReview.hasOwnProperty("owner") ||
    !newReview.hasOwnProperty("review_body") ||
    !newReview.hasOwnProperty("category") ||
    typeof newReview.title !== "string" ||
    typeof newReview.owner !== "string" ||
    typeof newReview.review_body !== "string" ||
    typeof newReview.category !== "string"
  ) {
    return Promise.reject({
      status: 400,
      msg: "Invalid post request, please reformat your post",
    });
  };
  newReview.votes = 0;
  newReview.created_at = new Date(Date.now());
const { title, designer, owner, review_body, category, votes, created_at } = newReview;
return db.query(`INSERT INTO reviews (title, designer, owner, review_body, category, votes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, [title, designer, owner, review_body, category, votes, created_at])
.then((result) => {
  return result.rows[0];
});
};

exports.insertUser = (newUser) => {
  if (
    !newUser.hasOwnProperty("username") ||
    !newUser.hasOwnProperty("name") ||
    typeof newUser.username !== "string" ||
    typeof newUser.name !== "string"
  ) {
    return Promise.reject({
      status: 400,
      msg: "Invalid post request, please reformat your post",
    });
  };

  if (!newUser.avatar_url) {
    newUser.avatar_url = 'https://icon-library.com/images/default-profile-icon/default-profile-icon-6.jpg'
  }
  const {username, name, avatar_url} = newUser;
  return db.query(`INSERT INTO users (username, name, avatar_url) VALUES ($1, $2, $3) RETURNING *;`, [username, name, avatar_url])
  .then((result) => {
    return result.rows[0]
  });
};