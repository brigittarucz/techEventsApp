const app = require('../app');
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const { LocalStorage } = require('node-localstorage');
const { fetchUser } = require('../models/user');
const uuid = require('uuid');
const { expect } = require('chai');

// const uniqid = uuid.v4();
// localStorage.setItem('sessionId', user.id);

describe("Business logic", function() {
    // Check for 404
    describe("Checks page flow without authentication", function() {
        it("GET /dashboard", (done) => {
            chai.request(app)
                .get('/dashboard')
                .end((err, res) => {
                    path = res.header.path;
                    res.should.have.status(200);
                    expect(path).to.equal('/authenticate');
                    done();
                })
        })
    })
})