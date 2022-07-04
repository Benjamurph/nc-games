const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data');
const db = require('../db/connection');
const request = require('supertest');
const app = require('../app');

beforeEach(() => {
    return seed(testData);
});

afterAll(() => {
    return db.end();
});

describe('api/categories', () => {
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

    test('404 status: receives the message "404 route not found." when presented with an invalid path', () => {
      return request(app)
      .get('/api/vategories')
      .expect(404)
      .then(({body}) => {
        expect(body.msg).toBe('404 route not found.');
      });        
    });
});

describe('api/reviews/:review_id', () => {
    test('200 status: returns the review that corresponds to the input review_id', () => {
      return request(app)
      .get('/api/reviews/1')
      .expect(200)
      .then(({body}) => {
        expect(body.review).toEqual( {
            review_id: 1,
            title: 'Agricola',
            category: 'euro game',
            designer: 'Uwe Rosenberg',
            owner: 'mallionaire',
            review_body: 'Farmyard fun!',
            review_img_url: 'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png',
            created_at: 'Mon Jan 18 2021 10:00:20 GMT+0000 (Greenwich Mean Time)',
            votes: 1
          });;
      });
    });
    test('400 status: returns the message "400 bad request, please input a valid path." when presented with a path that doesn\'t exist', () => {
        return request(app)
      .get('/api/reviews/999')
      .expect(400)
      .then(({body}) => {
        expect(body.msg).toBe('400 bad request, please input a valid path.');
      });
    });  
    
});

describe('404 error handling', () => {
    test('404 status: receives the message "404 route not found." when presented with an invalid path', () => {
        return request(app)
        .get('/api/vategories')
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe('404 route not found.');
        });       
      });
});