// const mysql = require('mysql2');
// const User = require('../models/user');

// const pool = mysql.createConnection({
//     host: 'mariadb',
//     user: 'root',
//     database: 'techevents_users',
//     password: 'test',
//     port: 3306
// });

// const db = pool.promise();

// describe('Test db', () => {
//     describe('Test db 2', () => {
//         it('Should get 1', (done) => {
//             User.fetchUser('myemail@yahoo.com').then(result => {
//                 console.log(result);
//             })
//         })
//     })
// })

// "test": "nyc mocha --reporter spec",