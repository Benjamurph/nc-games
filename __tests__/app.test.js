const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const db = require('../db/connection');
const request = require('supertest');
const app = require('../app');
const endpoints = require('../endpoints.json') ;

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('GET api/categories', () => {
    describe('happy path', () => {
        test('200 status: returns an array containing all the categories', () => {
            return request(app)
            .get('/api/categories')
            .expect(200)
            .then(({body}) => {
                body.categories.forEach(category => {
                    expect(category).toHaveProperty('description');
                    expect(category).toHaveProperty('slug');
                });
                expect(body.categories.length).toBe(4);
            });
        });
    });
    describe('error handling', () => {
        test('404 status: receives the message "404 route not found." when presented with an invalid path', () => {
      return request(app)
      .get('/api/vategories')
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('404 route not found.');
      });        
    });
  });   
});

describe('GET api/reviews/:review_id', () => {
    describe('happy paths', () => {
        test('200 status: returns the review that corresponds to the input review_id, including comment count', () => {
            return request(app)
            .get('/api/reviews/2')
            .expect(200)
            .then(({body}) => {
              expect(body.review).toEqual({
                review_id: 2,
                title: 'Jenga',
                category: 'dexterity',
                designer: 'Leslie Scott',
                owner: 'philippaclaire9',
                review_body: 'Fiddly fun for all the family',
                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                created_at: "Mon Jan 18 2021 10:01:41 GMT+0000 (Greenwich Mean Time)",
                votes: 5,
                comment_count: 3
              });
            });
          });
    });
    describe('error handling', () => {
        test('404 status: returns the message "no review found under id __" when presented with a path that doesn\'t exist', () => {
            return request(app)
          .get('/api/reviews/999')
          .expect(404)
          .then(({body}) => {
            expect(body.msg).toBe('no review found under id 999');
          });
        });  
        test('400 status: returns a bad path request', () => {
            return request(app)
            .get('/api/reviews/notanumber')
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request');
            });
        });
    });
});

describe('PATCH api/reviews/:review_id', () => {
    describe('happy path', () => {
        test('PATCH 200: updates an existing review to increase or decrease the review\'s votes by the given amount', () => {
          const newVote = {
            inc_votes : 1
          }
          return request(app)
          .patch('/api/reviews/1')
          .send(newVote)
          .expect(200)
          .then(({body}) => {
            expect(body.review).toEqual({
                review_id: 1,
                title: 'Agricola',
                category: 'euro game',
                designer: 'Uwe Rosenberg',
                owner: 'mallionaire',
                review_body: 'Farmyard fun!',
                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                created_at: 'Mon Jan 18 2021 10:00:20 GMT+0000 (Greenwich Mean Time)',
                votes: 2
              });
          });
        });
        test('PATCH 200: updates an existing review to increase or decrease the review/s votes by the given amount, ignores extra properties on the patch', () => {
          const newVote = {
              inc_votes: 1,
              name: 'Mitch'
            }
            return request(app)
          .patch('/api/reviews/1')
          .send(newVote)
          .expect(200)
          .then(({body}) => {
              expect(body.review).toEqual({
                review_id: 1,
                title: 'Agricola',
                category: 'euro game',
                designer: 'Uwe Rosenberg',
                owner: 'mallionaire',
                review_body: 'Farmyard fun!',
                review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
                created_at: 'Mon Jan 18 2021 10:00:20 GMT+0000 (Greenwich Mean Time)',
                votes: 2
              });
          });
      });
    });
    describe('error handling', () => {
        test('404 status: returns the message "No review found under id __" when presented with a path that doesn\'t exist', () => {
            const newVote = {
                inc_votes : 1
              }
            return request(app)
          .patch('/api/reviews/999')
          .send(newVote)
          .expect(404)
          .then(({body}) => {
            expect(body.msg).toBe('No review found under id 999');
          });
        });  
        test('400 status: returns a bad path request', () => {
            const newVote = {
                inc_votes : 1
              }
            return request(app)
            .patch('/api/reviews/notanumber')
            .send(newVote)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request');
            });
        });
        test('400 status: returns the message "Invalid patch request, please reformat your patch" when the patch does not contain "inc_votes"', () => {
            const newVote = {
                name: 'Mitch'
              }
              return request(app)
            .patch('/api/reviews/1')
            .send(newVote)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Invalid patch request, please reformat your patch');
            });
        });
        test('400 status: returns the message "Invalid patch request, please reformat your patch" when vote_count is of the wrong type', () => {
            const newVote = {
                inc_votes: 'cat',
              }
              return request(app)
            .patch('/api/reviews/1')
            .send(newVote)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('Invalid patch request, please reformat your patch');
            });
        });
    });
});

describe('GET api/users', () => {
  describe('happy path', () => {
    test('GET 200: responds with an array of users', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body}) => {
          expect(body.users.length).toBe(4);
          body.users.forEach(user => {
            expect(user).toHaveProperty('username');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('avatar_url');
          });
        });
    });
  });
});

describe('GET api/reviews', () => {
  describe('happy path', () => {
    test('200 status: returns an array of reviews, including comment_count, reviews are sorted by created_at by default', () => {
      return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({body}) => {
        expect(body.reviews.length).toBe(13);
        expect(body.reviews).toBeSortedBy('created_at', {descending: true})
        body.reviews.forEach(review => {
          expect(review).toHaveProperty('review_id');
          expect(review).toHaveProperty('title');
          expect(review).toHaveProperty('designer');
          expect(review).toHaveProperty('owner');
          expect(review).toHaveProperty('review_img_url');
          expect(review).toHaveProperty('review_body');
          expect(review).toHaveProperty('category');
          expect(review).toHaveProperty('created_at');
          expect(review).toHaveProperty('votes');
          expect(review).toHaveProperty('comment_count');
        });
      });
    });
    test('200 status: reviews can be sorted by any valid column ascending or descending', () => {
      return request(app)
      .get('/api/reviews?sort_by=review_id')
      .expect(200)
      .then(({body}) => {
        expect(body.reviews).toBeSortedBy('review_id', {descending: true});
      });
    });
    test('200 status: reviews can be sorted by ascending', () => {
      return request(app)
      .get('/api/reviews?order=asc')
      .expect(200)
      .then(({body}) => {
        expect(body.reviews).toBeSortedBy('created_at', {ascending: true});
      });
    });
    test('200 status: reviews can be sorted by ascending with a non-default sort_by', () => {
      return request(app)
      .get('/api/reviews?sort_by=votes&order=asc')
      .expect(200)
      .then(({body}) => {
        expect(body.reviews).toBeSortedBy('votes', {ascending: true});
      });
    });
    test('200 status: able to use a search term to respond with only reviews belonging to the input category', () => {
      return request(app)
      .get('/api/reviews?category=social+deduction')
      .expect(200)
      .then(({body}) => {
        body.reviews.forEach(review => {
          expect(review.category).toEqual('social deduction');
        });
      });
    });
    test('200 status: returns an empty array when the input category exists but is not included in any of the reviews', () => {
      return request(app)
      .get("/api/reviews")
      .query({category: "children's games"})
      .expect(200)
      .then(({body}) => {
         expect(body.reviews).toEqual([]);
      });
    });
    test('200 status: returns an array containing a limited number of reviews when a limit query is added', () => {
      return request(app)
      .get("/api/reviews?limit=10")
      .expect(200)
      .then(({body}) => {
         expect(body.reviews.length).toBe(10)
      });
    });
    test('200 status: returns an array containing a limited number of reviews when a limit query is added', () => {
      return request(app)
      .get("/api/reviews?limit=10&p=2")
      .expect(200)
      .then(({body}) => {
         expect(body.reviews.length).toBe(3);
      });
    });
    
  });
  describe('error handling', () => {
    test('400 status: returns the message "Invalid sort query, ___ does not exist" when that column doesn\t exist', () => {
      return request(app)
      .get('/api/reviews?sort_by=totes')
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('Invalid sort query, totes does not exist');
      });
    });
    test('400 status: returns the message "Invalid sort order query" when asked to be sorted by something other that asc or desc', () => {
      return request(app)
      .get('/api/reviews?order=asce')
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('Invalid sort order query');
      });
    });
    test('404 status: returns the message "No reviews found under the category name: ____" when asked to filter a categort that doesn\'t exist', () => {
      return request(app)
      .get('/api/reviews?category=category')
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('No reviews found under the category name: category');
      });
    });
    test('400 status: returns the message "Limit or page must be a number" when limit is not a number', () => {
      return request(app)
      .get("/api/reviews?limit=ten")
      .expect(400)
      .then(({body}) => {
         expect(body.msg).toBe('Limit or page must be a number');
      });
    });
    test('400 status: returns the message "Limit or page must be a number" when page is not a number', () => {
      return request(app)
      .get("/api/reviews?limit=10&p=one")
      .expect(400)
      .then(({body}) => {
         expect(body.msg).toBe('Limit or page must be a number');
      });
    });
  });
});

describe('GET api/reviews/:review_id/comments', () => {
  describe('happy path', () => {
    test('200 status: responds with an array of comments belonging to the review id', () => {
      return request(app)
      .get('/api/reviews/2/comments')
      .expect(200)
      .then(({body}) => {
        expect(body.comments.length).toBe(3)
        body.comments.forEach(comment => {
          expect(comment).toHaveProperty('comment_id');
          expect(comment).toHaveProperty('body');
          expect(comment).toHaveProperty('votes');
          expect(comment).toHaveProperty('author');
          expect(comment).toHaveProperty('review_id');
          expect(comment).toHaveProperty('created_at');
        });
      });
    });
    test('200 status: responds with a limited array of comments', () => {
      return request(app)
      .get('/api/reviews/2/comments?limit=2')
      .expect(200)
      .then((body) => {
        expect(body._body.comments.length).toBe(2);
      });
      });
      test('200 status: responds with a limited array of comments seperated into pages', () => {
        return request(app)
        .get('/api/reviews/2/comments?limit=2&p=2')
        .expect(200)
        .then((body) => {
          expect(body._body.comments.length).toBe(1);
        });
        });
  });
  describe('error handling', () => {
    test('404 status: returns the message "No review found under id __" when presented with a path that does not exist', () => {
      return request(app)
      .get('/api/reviews/999/comments')
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('No review found under id 999');
      });
    });
    test('400 status: responds with the messasge "Limit or page must be a number" if page is not a number', () => {
      return request(app)
      .get('/api/reviews/2/comments?limit=2&p=two')
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Limit or page must be a number');
      });
      });
      test('400 status: responds with the messasge "Limit or page must be a number" if limit is not a number', () => {
        return request(app)
        .get('/api/reviews/2/comments?limit=two&p=2')
        .expect(400)
        .then((body) => {
          expect(body._body.msg).toBe('Limit or page must be a number');
        });
        });
  });
});

describe('POST api/reviews/:review_id/comments', () => {
  describe('happy path', () => {
    test('201 status: adds a comment belonging to the input review_id and returns the added comment', () => {
      const newComment = {
        body: 'You SUCK at making board games!',
        author: 'philippaclaire9',
      };
      return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(201)
      .then(({body}) => {
        expect(body.comment).toHaveProperty('comment_id');
        expect(body.comment).toHaveProperty('body');
        expect(body.comment).toHaveProperty('votes');
        expect(body.comment).toHaveProperty('author');
        expect(body.comment).toHaveProperty('review_id');
        expect(body.comment).toHaveProperty('created_at');
      });
    });
  });
  describe('error handling', () => {
    test('404 status: returns the message "no review found under id __" when presented with a path that does not exist', () => {
      const newComment = {
        body: 'You SUCK at making board games!',
        author: 'philippaclaire9',
      };
      return request(app)
      .post('/api/reviews/999/comments')
      .send(newComment)
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('no review found under id 999');
      });
    });
    test('400 status: returns the message "Invalid post request, please reformat your post" when the new comment has no author or body', () => {
      const newComment = {
        body: 'You SUCK at making board games!'
        };
        return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(400)
      .then(({body}) => {
          expect(body.msg).toBe('Invalid post request, please reformat your post');
      });
  });
    test('400 status: returns the message "Invalid post request, please reformat your post" when the new comment has a body or author that\'s not a sring', () => {
      const newComment = {
        body: 'You SUCK at making board games!',
        author: 9
        };
        return request(app)
      .post('/api/reviews/1/comments')
      .send(newComment)
      .expect(400)
      .then(({body}) => {
          expect(body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: returns the message "bad request" when review_id is not a number', () => {
      const newComment = {
        body: 'You SUCK at making board games!',
        author: 'philippaclaire9'
        };
        return request(app)
      .post('/api/reviews/notanumber/comments')
      .send(newComment)
      .expect(400)
      .then(({body}) => {
          expect(body.msg).toBe('bad request');
      });
    });
  });
});

describe('DELETE api/comments/:comment_id', () => {
  describe('happy path', () => {
    test('204 status: deletes the given comment by comment_id', () => {
      return request(app)
      .delete('/api/comments/1')
      .expect(204)
      .then((body) => {
        return db.query('SELECT * FROM comments WHERE comment_id = 1;')
        .then((result) => {
          expect(result.rows.length).toBe(0);
        });
      });
    });
  });
  describe('error handling', () => {
    test('404 status: returns a message "No comment found under id 999" when the input comment_id does not exist', () => {
      return request(app)
      .delete('/api/comments/999')
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('No comment found under id 999');
      });
    });
    test('400 status: returns a message "bad request" when the input comment_id is not a number', () => {
      return request(app)
      .delete('/api/comments/notanumber')
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('bad request');
      });
    });
  });
});

describe('GET /api', () => {
  test('200 status: returns a json file containing all the api endpoints', () => {
    return request(app)
    .get('/api')
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual(endpoints);
    });
  });
});

describe('GET /api/users/:username', () => {
  describe('happy path', () => {
    test('200 status: responds with the user object belonging to the passed username', () => {
      return request(app)
      .get('/api/users/mallionaire')
      .expect(200)
      .then((body) => {
        expect(body._body.user).toEqual({
          username: 'mallionaire',
          name: 'haz',
          avatar_url:
            'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
        });
      });
    });
  });
  describe('error handling', () => {
    test('404 status: returns the message "No user found under the username ___" when there are no users with the input username', () => {
      return request(app)
      .get('/api/users/ballionaire')
      .expect(404)
      .then((body) => {
        expect(body._body.msg).toBe('No user found under the username ballionaire');
      });
    });
  });
});

describe('PATCH /api/comments/:comment_id', () => {
  describe('happy path', () => {
    test('200 status: updates an existing comment to increase or decrease the comment\'s votes by the given amount', () => {
      const newVotes = { inc_votes: 1 };
      return request(app)
      .patch('/api/comments/1')
      .send(newVotes)
      .expect(200)
      .then((body) => {
        expect(body._body.comment).toEqual({
          comment_id: 1,
          body: 'I loved this game too!',
          votes: 17,
          author: 'bainesface',
          review_id: 2,
          created_at: 'Wed Nov 22 2017 12:43:33 GMT+0000 (Greenwich Mean Time)'
        });
      });
    });
    test('200 status: updates an existing comment to increase or decrease the comment\'s votes by the given amount, ignores other properties on the patch', () => {
      const newVotes = { inc_votes: 1, body: 'new body' };
      return request(app)
      .patch('/api/comments/1')
      .send(newVotes)
      .expect(200)
      .then((body) => {
        expect(body._body.comment).toEqual({
          comment_id: 1,
          body: 'I loved this game too!',
          votes: 17,
          author: 'bainesface',
          review_id: 2,
          created_at: 'Wed Nov 22 2017 12:43:33 GMT+0000 (Greenwich Mean Time)'
        });
      });
    });
  });
  describe('error handling', () => {
    test('404 status: returns the message "No comment found under id __" when presented with a path that doesn\'t exist', () => {
      const newVotes = { inc_votes: 1 };
      return request(app)
      .patch('/api/comments/999')
      .send(newVotes)
      .expect(404)
      .then((body) => {
        expect(body._body.msg).toEqual('No comment found under id 999')
      });
    });
    test('400 status: returns the mmessage "bad request" when comment_id is not a number', () => {
      const newVotes = { inc_votes: 1 };
      return request(app)
      .patch('/api/comments/number')
      .send(newVotes)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('bad request')
      });
    });
    test('400 status: returns the message "Invalid patch request, please reformat your patch" when given a patch that does not include inc_votes', () => {
      const newVotes = { inc_motes: 1 };
      return request(app)
      .patch('/api/comments/1')
      .send(newVotes)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid patch request, please reformat your patch')
      });
    });
    test('400 status: returns the message "Invalid patch request, please reformat your patch" when given a patch in which inc_votes is not a number', () => {
      const newVotes = { inc_votes: 'number' };
      return request(app)
      .patch('/api/comments/1')
      .send(newVotes)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid patch request, please reformat your patch')
      });
    });
  });
});

describe('POST /api/reviews', () => {
  describe('happy path', () => {
    test('201 status: responds with the newly added review', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(201)
      .then((body) => {
        expect(body._body.review).toHaveProperty('review_id');
        expect(body._body.review).toHaveProperty('title');
        expect(body._body.review).toHaveProperty('designer');
        expect(body._body.review).toHaveProperty('owner');
        expect(body._body.review).toHaveProperty('review_body');
        expect(body._body.review).toHaveProperty('category');
        expect(body._body.review).toHaveProperty('votes');
        expect(body._body.review).toHaveProperty('created_at');
      });
    });
  });
  describe('error handling', () => {
    test('400 status: responds with the message "Invalid post request, please reformat your post" when a title is missing', () => {
      const newReview = {
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });

    test('400 status: responds with the message "Invalid post request, please reformat your post" when a owner is missing', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when a review_body is missing', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when a category is missing', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down."
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
     test('400 status: responds with the message "Invalid post request, please reformat your post" when the title is not a string', () => {
      const newReview = {
        title: 1,
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when the owner is not a string', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        owner: 3,
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when the review_body is not a string', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_body: 4,
        category: 'dexterity'
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when the category is not a string', () => {
      const newReview = {
        title: 'Culture a Love of Agriculture With Agricola',
        designer: 'Uwe Rosenberg',
        owner: 'mallionaire',
        review_body: "Few games are equiped to fill a player with such a defined sense of mild-peril, but a friendly game of Jenga will turn the mustn't-make-it-fall anxiety all the way up to 11! Fiddly fun for all the family, this game needs little explaination. Whether you're a player who chooses to play it safe, or one who lives life on the edge, eventually the removal of blocks will destabilise the tower and all your Jenga dreams come tumbling down.",
        category: 5
      };
      return request(app)
      .post('/api/reviews')
      .send(newReview)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
  });
});

describe('POST api/users', () => {
  describe('happy path', () => {
    test('201 status: adds a new user and returns the added user', () => {
      const newUser = {
        username: 'new user',
        name: 'Guy',
      };
      return request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .then(({body}) => {
        expect(body.user).toHaveProperty('username');
        expect(body.user).toHaveProperty('name');
        expect(body.user).toHaveProperty('avatar_url');
      });
    });
  });
  describe('error handling', () => {
    test('400 status: responds with the message "Invalid post request, please reformat your post" when a username is missing', () => {
      const newUser = {
        name: 'me'
      };
      return request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when a name is missing', () => {
      const newUser = {
        username: 'me'
      };
      return request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when username is not a string', () => {
      const newUser = {
        username: 1,
        name: 'me'
      };
      return request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
    test('400 status: responds with the message "Invalid post request, please reformat your post" when name is not a string', () => {
      const newUser = {
        username: 'me',
        name: 1
      };
      return request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .then((body) => {
        expect(body._body.msg).toBe('Invalid post request, please reformat your post');
      });
    });
  });
});