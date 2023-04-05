//Setting the required stuff. See other controllers, these are repeated!
const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const feedback = require('../models/Feedback.js');
const { totalmem } = require('os');
const bcrypt = require('../util/bcrypt')

const HostController = {

    //Get host home page
    getHost: async function(req, res) {
        console.log(req.session.name);

        var today = new Date();
        var date = today.toLocaleString('default', {year:"numeric", month:"long", day:"numeric"});

        var num_pending = await request.find({status: 'Pending'}).count();
        var num_active = await request.find({status: 'Accepted'}).count();

        var notifcount = 0;
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            result.notifications.forEach(n => {
                if(!n.read)
                    notifcount++;
            })
            res.render('./onSession/hhome', {isHost: true, username: req.session.name, notifcount, date, num_pending, num_active});
        })
    },

    //Show pending requests by users.
    getPendingRequests: async function(req, res) {
        var requests = await request.find({status: 'Pending'});
        res.render('./onSession/hpendingrequests', {req: requests.reverse(), isHost: true, username: req.session.name});
    },
 

    //Renders a specific request. Sames as the one in the UserController, but this one contains functions that only the HOST has access to. (See the hbs it renders and compare it to the user's for more info!)
    viewRequest: async function(req, res) {
        if(!req.body.reqid)
            console.log("ASFIONASOFN")

        db.findOne(request, {_id: req.body.reqid}, {}, async (result) => {
            if (result) {        
                var response = {
                    car: result.car,
                    type: result.type,
                    images: result.images,
                    description: result.description,
                    client_username: result.username,
                    contact: result.contact,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: true,
                    username: req.session.name,
                    _id: req.body.reqid,
                    messages: result.messages
                };        
                res.render('./onSession/hviewrequest', response) 
            }
            else {
                console.log("failed");
            }
        })     
    },


    //Assigns a quotation to a specific request.
    sendQuotation: async function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        console.log(req.body.reqid)
        db.updateOne(request, {_id: req.body.reqid}, {price: req.body.price, outstanding: req.body.price}, (result) => {
            db.findOne(request, {_id: req.body.reqid}, {}, async (result) => {
                if (result) {        
                    var response = {
                        car: result.car,
                        type: result.type,
                        images: result.images,
                        description: result.description,
                        client_username: result.username,
                        contact: result.contact,
                        date: result.date,
                        status: result.status,
                        price: result.price,
                        isHost: true,
                        username: req.session.name,
                        _id: req.body.reqid,
                        messages: result.messages
                    };
                    
                    var notification = { //Create notification 
                        message: "User \"" + req.session.name + "\" sent quotation on order on car: \"" + result.car + "\"",
                        read: false,
                        sentdate: today,
                        reqid: result._id    
                    }
                    
                     //Notify user that order has quotation
                    db.updateOne(account, {_id: result.userid}, {$push: {notifications: notification}}, function(result) {
                        console.log(result)
                        res.render('./onSession/hviewrequest', response) 
                    });

                    
                }
                else {
                    console.log("failed");
                }
            })  
        });
    },

    //Adds an amount to the balance of a request.
    addPaidBalance: async function(req, res) {
        var amountPaid = req.body.amount;
        db.updateOne(request, {_id: req.body.reqid}, {$inc: {paid: amountPaid, outstanding: (-1 * amountPaid)}}, (result) => {
            res.redirect('/hviewactive');
        });
    },

    //When a request is fully paid, the host can then settle the request, marking it as a finished transaction.
    settleRequest: async function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        db.updateOne(request, {_id: req.body.reqid}, {status: 'Settled', paiddate: today}, (result) => {
            console.log("Settled request");
            res.redirect('/hviewactive');
        });
    },

    
    editOutstanding: function(req, res) {
        db.updateOne(request, {_id: req.body.reqid}, {outstanding: req.body.editedOutstanding}, (result) => {
            console.log("Edited oustanding balance of " + req.body.reqid + " to " + req.body.editedOutstanding);
            res.redirect('/hviewactive');
        });
    },
    
    //View active requests sent by users.
    viewActiveRequests: async function(req, res) {
        var requests = await request.find({status: 'Accepted'});
        res.render('./onSession/hactiverequests', {req: requests.reverse(), isHost: true, username: req.session.name});
    },

    //Manually addes a job. This is a function requested by the customer for onsite transactions.
    viewAddNewJob: function(req, res) {
        res.render('./onSession/hnewjob', {isHost: true, username: req.session.name});
    },

    addNewJob: function(req, res) {
        var today = new Date()

        var nrequest = {
            username: req.body.customer,
            contact: req.body.contact,
            car: req.body.model,
            type: req.body.rtype,
            date: today,
            price: req.body.price,
            paid: req.body.paid,
            paiddate: 'N/A',
        }

        nrequest.outstanding = nrequest.price - nrequest.paid;

        if(req.body.finished == "1") {
            nrequest.status = "Settled";
            nrequest.paiddate = today;
        }
        else
            nrequest.status = "Accepted";

        request.create(nrequest, (error,request) => {
            console.log(request);
            res.redirect("/hviewactive");
        })
    },

    //Renders the finanacial report page.
    viewGenerateReport: async function(req, res) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = today.getMonth() + 1;
        res.render('./onSession/hreport', {date: yyyy+'-'+mm, isHost: true, username: req.session.name});
    },

    //Generates a financial report based on the dates entered by the user.
    generateReport: async function(req, res) {
        var requests = await request.find();
        var starty = parseInt(req.query.start.substring(0,4));
        var startm = parseInt(req.query.start.substring(5,7));
        var endy = parseInt(req.query.end.substring(0,4));
        var endm = parseInt(req.query.end.substring(5,7));
        var revenue = 0;
        var outstanding = 0;
        var total = 0;
        var settled = 0;

        console.log("Requested start: " + starty + "/" + startm)
        console.log("Requested end: " + endy + "/" + endm)

        requests.forEach(r => {
            tempdate = new Date(r.date); // month is 0 indexed using getMonth()
            if(tempdate.getFullYear() >= starty && tempdate.getMonth() + 1 >= startm && tempdate.getFullYear() <= endy && tempdate.getMonth() + 1 <= endm) {
                if(r.status == 'Accepted' || r.status == 'Settled') {
                    revenue += r.paid;
                    total += r.price;
                    if(r.status == 'Accepted')
                        outstanding += r.outstanding;
                    if(r.status == 'Settled')
                        settled += 1;
                }
            }
        })

        var start = new Date();
        start.setMonth(startm - 1);

        var end = new Date();
        end.setMonth(endm - 1);

        var startDate = start.toLocaleString('en-US', {month: 'long'}) + " " + starty
        var endDate = end.toLocaleString('en-US', {month: 'long'}) + " " + endy

        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = today.getMonth() + 1;
        
        res.render('./onSession/hreport', {date: yyyy+'-'+mm, total, settled, outstanding, revenue, startDate, endDate, isHost: true, username: req.session.name});
    },

    viewSuppliers: async function(req, res) {
        res.render('./onSession/hsuppliers', {isHost: true, username: req.session.name});
    },


    //Delete a request. Notifies the user as a notification after this is done.
    hostDeleteRequest: async function(req, res) {
        console.log("Here")
        //Getting Date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;
        
        db.updateOne(request, {_id: req.query.reqid}, {status: "Deleted"}, (error) => {
            console.log(req.query.reqid)
            db.findOne(request, {_id: req.query.reqid}, {}, function(result) { //Find the request in DB to get vars
                console.log(result)
                var notification = { //Create notification for a sent message
                    message: "User \"" + req.session.name + "\" declined order on car: \"" + result.car + "\"",
                    read: false,
                    sentdate: today,
                    reqid: result._id    
                }
                
                 //If someone other than user declines, push it into the notifications array of user
                db.updateOne(account, {_id: result.userid}, {$push: {notifications: notification}}, function(result) {
                    console.log(result)
                    res.redirect("/hviewallpending");
                });
            });
            
        });
    },
    
    viewNotifications: async function(req, res) {
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            read = [];
            unread = [];

            result.notifications.forEach(n => {
                if(!n.read)
                    read.push(n)
                else
                    unread.push(n)
            })
        
            db.updateOne(account, {_id: req.session.user}, {$set: {"notifications.$[].read": true}}, (result) => { //Sets all notifications as read
                res.render('./onSession/hnotifications', {isHost: true, username: req.session.name, read: read.reverse(), unread: unread.reverse()});
            })
        })
    },

    viewFeedBack: function(req,res) {
        var request_id = req.body.request_id;
        console.log(request_id);
    db.findMany(feedback, {Request_id: request_id}, "username feedback", function(result){
            const data = result;
            var AllFeedBack = []
            data.forEach((i) => {
                AllFeedBack.push({username: i.username, feedback: i.feedback})
                console.log (AllFeedBack)
            })
            db.findOne(request, {_id: request_id}, "username car type", function(result){
                var client = result.username;
                var carModel = result.car;
                var jobType = result.type;
                res.render ('./onSession/hviewfeedback', {isHost: false, feedbackcard: AllFeedBack, id:request_id, car: carModel, Type: jobType, client: client});
            })
        })
    },
    
    enterFeedback: function(req,res){
        var userFeedback = req.query.feedback;
        var username = req.session.name;
        var request_id = req.query.request;
        console.log(request_id);
        console.log(userFeedback)
        var newFeedback = {
            Request_id: request_id,
            username: username,
            feedback: userFeedback
        }
        console.log(newFeedback);
        db.insertOne(feedback, newFeedback, function(){
            console.log("Successful Add")
            res.redirect('./onSession/uviewfeedback')
        })

    },

    newHost: async function (req, res) {
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            read = [];
            unread = [];

            result.notifications.forEach(n => {
                if(!n.read)
                    read.push(n)
                else
                    unread.push(n)
            })

            res.render('./onSession/hregister', {isHost: true, username: req.session.name})
        })
    },

    registerHost: async function(req, res) {
        if(req.body.q1 == req.body.q2 || req.body.q1 == req.body.q3 || req.body.q2 == req.body.q3) {
            req.flash("error_msg", "Please make sure each question is distinct!")
            res.redirect('/hregister')
        }
        else {
            //Gets the values entered
            newaccount = {
                fname: req.body.fname.trim(),
                lname: req.body.lname.trim(),
                username: req.body.name.trim(),
                password: null,
                questions: null,
                contact: req.body.contact.trim(),
                email: req.body.email.trim(),
                host: true
            }

            console.log(req.body)
            console.log(newaccount)

            //DB function looks for a matching username, contact number and or email...
            db.findOne(account, { $or: [{username: newaccount.user}, {contact: newaccount.contact}, {email: newaccount.email}]}, {}, async (result) => {

                //If found, account creation is stopped.
                if (result) {
                    console.log(result);
                    if (result.username == newaccount.user)
                        req.flash('error_msg', 'User already exists. Please login.');
                    else if (result.contact == newaccount.con)
                        req.flash('error_msg', 'This contact number is already registered.');
                    else if (result.email == newaccount.email)
                        req.flash('error_msg', 'This email is already registered.');
                    res.redirect('/hregister');
                }
                else { //Else, we proceed with the next step in creating an account
                    questions = []

                    questions.push (
                        {
                          question: req.body.q1,
                          answer: req.body.a1
                        }
                      )
                    
                    questions.push (
                        {
                            question: req.body.q2,
                            answer: req.body.a2
                        }
                    )
                    
                    questions.push (
                        {
                            question: req.body.q3,
                            answer: req.body.a3
                        }
                    )
                    
                    if(req.body.q4)
                        questions.push (
                            {
                                question: req.body.q4,
                                answer: req.body.a4
                            }
                        )
                    
                    newaccount.questions = questions

                    encrypted = await new Promise((resolve) => {
                        resolve(bcrypt.hash(req.body.pass.trim()))
                    })

                    newaccount.password = encrypted
                    account.create(newaccount)

                    req.flash('success_msg', 'Host Account successfully created.');
                    res.redirect('/hregister')
                }
            }) 
        }
    }
}

module.exports = HostController;