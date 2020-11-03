// DEFINE THE PATH / HTTP METHOD 

const express = require('express');
const router = express.Router();

const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./local_storage');

router.get('/logout', (req,res,next) => {
    localStorage.clear();
    return res.redirect('/authenticate');
});

const authController = require('../controllers/authenticate');
const eventsController = require('../controllers/events');
const profileController = require('../controllers/profile');

router.get('/authenticate', authController.getAuth);
router.post('/authenticate/:action', authController.postAuth);

router.get('/dashboard', eventsController.getEvents);
router.post('/dashboard/events', eventsController.postAddEvent);

router.get('/profile', profileController.getProfile);
// router.post('/home/profile', profileController.postProfile);
// router.post('/home/event-delete', profileController.postDeleteFromCalendar);
// router.post('/home/event-add', profileController.postAddFromSuggested);

// ALWAYS LAST ROUTE

router.get('*', (req,res,next) => {
    res.status(404).send('<h1>Page not found</h1>')
});

module.exports = router;