# Northcoders House of Games API

## Project Background

### The link to nc-games API: https://benjamurph-nc-games.herokuapp.com/api

The purpose of this project was to build an API capable of asccessing application data with the potential use of providing that data to front end architecture.

## Setup

### The link to the nc-games github page: https://github.com/Benjamurph/nc-games

1. Begin by following the link above..
2. Click clone and copy the URL for the repository
3. Open your dev environment and enter the directory where you want to store this project.
4. Type git clone, paste the URL you copied and hit enter.
git clone https://github.com/Benjamurph/-be-nc-games.git
5. Open the project in your code editor and type npm install to install all the project dependencies.
6. Type npm run seed to seed the database.

## Create .env files

Before running this project you will need to create a .env.development file as well as a .env.test file. Add PGDATABASE=nc_games to .env.development, and add PGDATABASE=nc_games_test to your .env.test file.

## Testing

Once you have finished the setup run: npm test to see the tests that have been designed for the project.

## Node and Postgres

Node and Postgres are dependencies for this project, the minumum versions you will require to run this code is:
Node.js v18.2.0 and
Postgres v8.7.3
