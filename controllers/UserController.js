const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');
const app = require('../routes/routes.js');
const db = require('../models/db.js');
const path = require('path');
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');
const { totalmem } = require('os');

const UserController = {
    getUser: async function(req, res) {
        console.log(req.session.name);
        res.render('./onSession/uhome', {isHost: false, username: req.session.name});
    },

    logoutUser: function(req, res) {
        // Destroy the session and redirect to login page
          if (req.session) {
            req.session.destroy(() => {
              res.clearCookie('connect.sid');
              res.redirect('/');
            });
          }
    },

    sendMessage: function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();
        today = yyyy+'-'+mm+'-'+dd +' ('+hr+':'+min+')';

        var message = {
            username: req.session.name,
            content: req.body.content,
            sentdate: today
        };

        console.log("msg")
        console.log(req.body.reqid)
        console.log("msg")

        db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function() {
            if(req.session.host)
                res.redirect('/hviewpending?reqid=' + req.body.reqid);
            else
                res.redirect('/uviewpending?reqid=' + req.body.reqid);
        });
    },

    getUserRequestCreation: async function(req, res) {
        res.render('./onSession/ucreaterequest', {isHost: false, username: req.session.name});
    },

    submitRequest: async function(req, res) {
        //CCAPDEV thing to get the image dir
        const {image} = req.files;

        if(image.mimetype.startsWith('image')) {
            //Getting Date
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            today = yyyy+'-'+mm+'-'+dd;

            var nrequest = {
                userid: req.session.user,
                username: req.session.name,
                contact: req.session.contact,
                car: req.body.rcar,
                type: req.body.rtype,
                description: req.body.rdesc,
                image: 'uploaded/'+image.name,
                date: today,
                status: 'Pending',
                price: -1,
                paid: 0,
                oustanding: -1,
                paiddate: 'N/A'
            }

            image.mv(path.resolve(__dirname,'../public/uploaded',image.name),(error) => {
                request.create(nrequest, (error,request) => {
                    res.redirect('/home');
                })
            })   
        }
        else {
            req.flash('error_msg', 'Only select image files.');
            res.redirect('/createreq');
        }
    },
    
    getUserRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Pending'});
        console.log("requests")
        console.log(requests);
        res.render('./onSession/uviewpending', {req: requests, isHost: false, username: req.session.name});
    },

    renderUserRequest: async function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            if (result) {
                var response = {
                    car: result.car,
                    image: result.image,
                    type: result.type,
                    description: result.description,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: false,
                    username: req.session.name,
                    _id: req.query.reqid,
                    messages: result.messages
                };
                res.render('./onSession/uviewrequest', response)
            }
            else {
                console.log("failed");
            }
        })   
    },

    acceptRequest: function(req, res) {
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            // If request has been quoted already
            if (result.price != -1) {
                db.updateOne(request, {_id: req.query.reqid}, {status: "Accepted"}, (result) => {
                    res.redirect('/uviewallpending');
                });
            }
            else {
                req.flash('error_msg', 'This request has not yet been quoted.');
                res.redirect('/uviewallpending');
            }
        });
        
    },

    declineRequest: function(req, res) {
        db.deleteOne(request, {_id: req.query.reqid}, (error) => {
            res.redirect("/uviewallpending");
        });
    },

    getEditRequest: function(req, res) {
        console.log(req.query.reqid);
        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            if (result) {
                res.render("./onSession/ueditrequest", {image: result.image, car: result.car, type: result.type, description: result.description, ogid:result._id, isHost: false, username: req.session.name});
            }
            else {
                console.log("not found")
            }
        });
    },

    getEditRequestAction: function(req, res) {
        var updatedReq = {
            car: req.body.rcar,
            type: req.body.rtype,
            description: req.body.rdesc,
        };

        // If no new image
        if(!req.files) {
            console.log("Updating with no new image");
            db.updateOne(request, {_id: req.body.ogid}, updatedReq, (result) => {
                res.redirect('/uviewallpending');
            });
        }
        // If have new image
        else {
            console.log('Updating with new image')
            const {image} = req.files;
            if(image.mimetype.startsWith('image')) {
                //Getting Date
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;
                var yyyy = today.getFullYear();
                today = yyyy+'-'+mm+'-'+dd;

                updatedReq['image'] = 'uploaded/'+image.name

                image.mv(path.resolve(__dirname,'../public/uploaded',image.name),(error) => {
                    db.updateOne(request, {_id: req.body.ogid}, updatedReq, (result) => {
                        res.redirect('/uviewallpending');
                    });
                })
            }
            else {
                req.flash('error_msg', 'Only select image files.');
                res.redirect('/ueditrequest?reqid=' + req.body.ogid);
            }
        }
        
    },

    getUserAcceptedRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Accepted'});
        res.render('./onSession/uviewongoing', {req: requests, isHost: false, username: req.session.name}); 
    },
}

module.exports = UserController;