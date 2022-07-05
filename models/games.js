const db = require('../db/connection');

exports.selectCategories = () => {
    return db.query('SELECT * FROM categories;').then((result) => {
        return result.rows;
    });
};

exports.selectReviewById = (id) => {
    const { review_id } = id;
    return db.query(`SELECT * FROM reviews WHERE review_id = $1;`, [review_id])
    .then((result) => {
        if (!result.rows.length) {
            return Promise.reject({
                status: 404,
                msg: `no review found under id ${review_id}`
            });
        };
        return result.rows[0];
    });
};

exports.updateVotes = (newVotes, id) => {
  const { review_id } = id;
  if (!newVotes.hasOwnProperty('inc_votes') || isNaN(newVotes.inc_votes)) {
    return Promise.reject({
        status: 400,
        msg: 'Invalid patch request, please reformat your patch'
    });
  };
    return db.query(`UPDATE reviews SET votes = votes + $1 WHERE review_id = $2 RETURNING *;`, [newVotes.inc_votes, review_id])
    .then((result) => {
        if (!result.rows.length) {
            return Promise.reject({
                status: 404,
                msg: `no review found under id ${review_id}`
            });
        };
        return result.rows[0];
    });
};