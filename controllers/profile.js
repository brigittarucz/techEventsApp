const express = require('express');

const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./local_storage');

var utilities = require('../public/js/functions');

const User = require('../models/user');
const Event = require('../models/event');
const dateFormatter = require('date-fns')

function similar_text(a,b) {
    var equivalency = 0;
    var minLength = (a.length > b.length) ? b.length : a.length;    
    var maxLength = (a.length < b.length) ? b.length : a.length;    
    for(var i = 0; i < minLength; i++) {
        if(a[i] == b[i]) {
            equivalency++;
        }
    }

    var weight = equivalency / maxLength;
    return (weight * 100) + "%";
}

exports.getProfile = (req,res,next) => {

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {
        var user = user[0][0];
        var sUserExists = user !== undefined ? true : false;

        if(sUserExists) {
            Event.fetchEvents().then(results => {
                // console.log(typeof(results[0]));
                var aTotalEvents = results[0];
                var aUserEvents = user.events;

                var aSuggestedEvents = [];

                // console.log(user);
                // console.log(aUserEvents);
                // console.log(aTotalEvents);

                utilities.formatSimilarity(user, aTotalEvents);
                utilities.formatDate(user, aTotalEvents);
                utilities.formatPrice(user, aTotalEvents);

                for(const oEvent of aTotalEvents) {
                    if(oEvent.similarity > 10) {
                        aSuggestedEvents.push(oEvent);
                    }
                };

                if(!user.events.length) {
                    res.render('events/profile', {
                        pageTitle: 'Profile',
                        user: user,
                        events: 'Search events',
                        eventsSuggested: aSuggestedEvents,
                        sessionId: localStorage.getItem('sessionId')
                    })  
                } else {
                    aUserEvents = aUserEvents.slice(1, aUserEvents.length - 1);
                    aUserEvents = aUserEvents.replace(/"/g, '');
                    aUserEvents = aUserEvents.split(",");

                    var aCalendarEvents = [];

                    aTotalEvents.forEach(event => {
                    aUserEvents.forEach(userEvent => {
                            if(userEvent == event.id) {
                                aCalendarEvents.push(event);
                            }
                        })
                    })

                   for(let i = 0; i < aCalendarEvents.length; i++) {
                        for(let j = 0; j < aSuggestedEvents.length; j++) {
                            if(aCalendarEvents[i].id === aSuggestedEvents[j].id) {
                                aSuggestedEvents.splice(j, 1);
                                break;
                            }
                        }
                    }

                    utilities.formatPrice(user, aCalendarEvents);

                    res.render('events/profile', {
                        pageTitle: 'Profile',
                        user: user,
                        events: aCalendarEvents,
                        eventsSuggested: aSuggestedEvents,
                        sessionId: localStorage.getItem('sessionId')
                    })   
                }

            }).catch(error => {
                console.log(new Error(error));
                res.redirect('/dashboard');
            })
             
        } else {
            console.log(new Error("Invalid user id"));
            res.redirect('/dashboard');
        }


    }).catch(error => {
        console.log(new Error(error));
        res.redirect('/dashboard');
    })
    
}

exports.postProfile = (req, res, next) => {

    // TODO: check for changes

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {

        var sUserExists = user[0][0] !== undefined ? true : false;
        if(sUserExists) {
            user = user[0][0];
            if(user.email !== req.body.email || user.password !== req.body.password ||
                user.proffesion !== req.body.proffesion || user.interests !== req.body.interests ) {
                    
                    const updatedUser = new User(localStorage.getItem('sessionId'), req.body.email, req.body.password, req.body.proffesion, req.body.interests, user.interests);
                    updatedUser.saveUser().then(res => {
                        console.log(res[0]);
                    }).catch(err => {
                        console.log(err);
                    })

                    res.write("Changes have been made");
                    console.log("Changes have been made");
                    res.end();
                } else {
                    res.status(400);
                    res.setHeader('Content-Type', 'application/json');
                    res.write('{"error": "Changes have not been made"}');
                    res.end();  
                }
        } else {
            res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Invalid user id"}');
            res.end();  
        }


    }).catch(err => {
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.write('{"error": '+ err +'}');
        res.end();
    })

}


exports.postDeleteFromCalendar = (req, res, next) => {

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {
        var aUserEvents = JSON.parse(user[0][0].events);
        for(let i = 0; i < aUserEvents.length; i++) {
            if(aUserEvents[i] === req.body.eventId) {
                aUserEvents.splice(i, 1);
                break;
            }
        }


        User.updateUserEvents(localStorage.getItem('sessionId'), (aUserEvents.length > 0 ? JSON.stringify(aUserEvents) : null)).then( () => {
            return res.redirect('/home/profile');
        }).catch(err => {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": '+ err +'}');
            res.end();
        })

    }).catch(err => {
        res.status(404);
        res.setHeader('Content-Type', 'application/json');
        res.write('{"error": '+ err +'}');
        res.end();
    })
}


exports.postAddFromSuggested = (req, res, next) => {
    
    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {

        // TODO: remove event node from main 

        var sUserExists = user[0][0] !== undefined ? true : false;
        if(sUserExists) {
            user = user[0][0];
            
            // TODO: continue

            utilities.addToEventArray(user, req).then(result => {
                if(!result) {
                    console.log(new Error("Event already exists"))
                }
            });

            // if(user.events === '') {
            //     var aUpdatedEvents = [];
            //     aUpdatedEvents.push(req.body.eventId);
            //     var sUpdatedEvents = JSON.stringify(aUpdatedEvents);
            // } else {
                
            //     // TODO: check if event exists, if not add

            //     var eventExists = 0;

            //     var aUserEvents = JSON.parse(user.events);
            //     aUserEvents.forEach(event => {
            //         if (event === req.body.eventId) {
            //             eventExists = 1;
            //         }
            //     });

            //     if(!eventExists) {
            //         aUserEvents.push(req.body.eventId);
            //         var sUpdatedEvents = JSON.stringify(aUserEvents);
            //     } else {
            //         res.status(400);
            //         res.setHeader('Content-Type', 'application/json');
            //         res.write('{"error": "Event already exists"}');
            //         res.end();  
            //     }
            // }

            User.updateUserEvents(localStorage.getItem('sessionId'), sUpdatedEvents).then( () => {
                return res.redirect('/home/profile');
            }).catch(err => {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.write('{"error": '+ err +'}');
                res.end();
            })

        } else {
            res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Invalid user id"}');
            res.end();  
        }


    }).catch(err => {
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.write('{"error": '+ err +'}');
        res.end();
    })  
      
}