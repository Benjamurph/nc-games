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
    
});

decribe('404 error handling', () => {
    test('404 status: receives the message "404 route not found." when presented with an invalid path', () => {
        return request(app)
        .get('/api/vategories')
        .expect(404)
        .then(({body}) => {
          expect(body.msg).toBe('404 route not found.');
        });       
      });
});