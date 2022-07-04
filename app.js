const express = require('express');

const { getCategories,
        getReviewById
      } = require('./controllers/games');

const app = express();
app.use(express.json());

app.get('/api/categories', getCategories);
app.get('/api/reviews/:review_id', getReviewById);

app.all('*', (req, res) => {
    res.status(404).send({ msg: '404 route not found.' });
});


app.use((err, req, res, next) => {
    console.log(err);
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