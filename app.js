const { application } = require('express');
const express = require('express');
const cors = require('cors');

const { getCategories,
        getReviewById,
        updateReview,
        getUsers,
        getReviews,
        getCommentsByReviewId,
        postComment,
        deleteCommentById,
        getApi,
        getUserByUsername,
        updateComment,
        postReview
      } = require('./controllers/games');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/categories', getCategories);
app.get('/api/reviews/:review_id', getReviewById);
app.patch('/api/reviews/:review_id', updateReview);
app.get('/api/users', getUsers);
app.get('/api/reviews', getReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);
app.post('/api/reviews/:review_id/comments', postComment);
app.delete('/api/comments/:comment_id', deleteCommentById);
app.get('/api', getApi);
app.get('/api/users/:username', getUserByUsername);
app.patch('/api/comments/:comment_id', updateComment);
app.post('/api/reviews', postReview);

app.all('*', (req, res) => {
    res.status(404).send({ msg: '404 route not found.' });
});


app.use((err, req, res, next) => {
    // console.log(err);
    if(err.status) {
        res.status(err.status).send({ msg: err.msg });
    } else if(err.code === '22P02') {
        res.status(400).send({ msg: 'bad request' });
    } else next(err);
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal server error'});
});

module.exports = app;