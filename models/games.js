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
        return result.rows[0];
    });
};