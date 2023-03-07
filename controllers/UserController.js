
//MongoDB conncetions
const { connect } = require('mongoose');
const { ObjectId, GridFSBucketReadStream } = require('mongodb');

//Cloudinary Utility. This is our Content Delivery Network
const cloudinary = require('../util/cloudinary')

//Routes to allow for more organized redirection, etc.
const app = require('../routes/routes.js');

//This file contains the database functions (Ex: Search, Adding entry, etc.)
const db = require('../models/db.js');

//Path
const path = require('path');
const fs = require('fs');
const http = require('http');

//Model Schemas
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');

const { totalmem } = require('os');

const UserController = {
    
    //Renders the user home page. If the user is a HOST account, it redirects to the HOST home page.
    getUser: async function(req, res) {
        notifcount = 0
        if(req.session.host)
            res.redirect('/hhome')
        else {
            db.findOne(account, {_id: req.session.user}, {}, function(result) {
                result.notifications.forEach(n => {
                    if(!n.read)
                        notifcount++;
                })
                res.render('./onSession/uhome', {isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, notifcount});
            })
        }
    },


    //Logout
    logoutUser: function(req, res) {
        // Destroy the session and redirect to login page
          if (req.session) {
            //Ends the session
            req.session.destroy(() => {
              res.clearCookie('connect.sid');
              res.redirect('/');
            });
          }
    },

    //Sending message within requests.
    sendMessage: async function(req, res) {

        //Parsing date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();
        today = yyyy+'-'+mm+'-'+dd +' ('+hr+':'+min+')';

        //Stores the username that sent the message and date.
        var message = {
            username: req.session.name,
            sentdate: today
        };

        // If message sent is not attachment
        if(!req.files) {
            console.log('Sending message as plain text.');
            message.content = req.body.content.trim();
            console.log(message);
            db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function(result) {

                //Start of Notification Code
                db.findOne(request, {_id: req.body.reqid}, {}, function(result) { //Find the request in DB to get vars
                    var notification = { //Create notification for a sent message
                        message: "You received a message from \"" + req.session.name +"\" on order on car: \"" + result.car + "\"",
                        read: false,
                        sentdate: today,
                        reqid: result._id    
                    }
                    
                    if(req.session.user != result.userid) //If someone other than user messages, push it into the notifications array of user
                        var query = {_id: result.userid};
                    else { //If the user places a message on his own request, notify HOST
                        var query = {username: "HOST"};
                        console.log("NOTIFYING HOST");
                    }
                    db.updateOne(account, query, {$push: {notifications: notification}}, function(result) {
                        console.log(result)
                        if(req.session.host)
                            res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                        else
                            res.redirect(307, '/uviewpending');
                    });
                });
            });
        }
        // If message sent is attachment
        else {
            console.log('Sending message as attachment.');
            var {file} = req.files;

            var filePath = path.resolve(__dirname,'../public/UPLOADED', file.name);

            console.log(filePath);

            //The attached file is first moved to the UPLOADED folder.
            file.mv(filePath, (error) => {
                //This is cloudinary code that takes that file and uploads it to our cloudinary account
                console.log("File in filesystem");
                cloudinary.uploader.upload(filePath, {
                    resource_type: "raw",
                    use_filename: true
                }).then(function(file) {
                    console.log("Attachment available at: " + file.secure_url);
                    message.content = file.public_id;
                    message.url = file.url;

                    //After the upload
                    console.log(message);

                    //Make a notification about the message, send it as a notification to the people in question.
                    db.updateOne(request, {_id: req.body.reqid}, {$push: {messages: message}}, function() {
                        db.findOne(request, {_id: req.body.reqid}, {}, function(result) {
                            var notification = {
                                message: "You received a message on your order on car: \"" + result.car + "\"",
                                read: false,
                                sentdate: today,
                                reqid: result._id    
                            }
                            if(req.session.user != result.userid) //If someone other than user messages
                                var query = {_id: result.userid};
                            else //If the user places a message on his own request, notify HOST accounts
                                var query = {host: true};

                            db.updateOne(account, query, {$push: {notifications: notification}}, function(result) {
                                console.log(result)
                                if(req.session.host)
                                    res.redirect(307, '/hviewpending'); // status code 307 redirects with original body data
                                else
                                    res.redirect(307, '/uviewpending');
                            });

                        });
                    });
                });
            });
        }
    },


    //Downloads attachment
    download: async function(req, res) {
        var img_url = req.body.img_url;
        var img_name = req.body.img_name;
        var filePath = path.resolve(__dirname,'../public/UPLOADED', img_name);

        console.log(req.body);
    
        const file = fs.createWriteStream(filePath);
        http.get(img_url, function(response) {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                console.log(img_name + " in file system.");
                res.send({filename: img_name});
            });
        });
    },

    //Renders the request creation page
    getUserRequestCreation: async function(req, res) {
        notifcount = 0;

        //This db function thing where we get the result.notifications is only there to render the number next to notifications to inform the user how many unread notifications they have.
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            console.log(typeof result.notifications)
            result.notifications.forEach(n => {
                if(!n.read)
                    notifcount++;
            })
            res.render('./onSession/ucreaterequest', {isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, notifcount});
        })
    },

    submitRequest: async function(req, res) {
        //CCAPDEV thing to get the image dir
        images = req.files.images;
        allimages = true;
        console.log(images.length)
        //This means there's only one photo. 
        //--But since code has been altered to work with arrays, this code basically makes a one element array out of it
        if(!images.length) { 
            images = [];
            images.push(req.files.images)
            console.log("AAA")
        }
        
        images.forEach(n => {
            if(!n.mimetype.startsWith('image'))
                allimages = false;
        })

        if(allimages) {
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
                description: req.body.rdesc.trim(),
                date: today,
                status: 'Pending',
                price: -1,
                paid: 0,
                oustanding: -1,
                paiddate: 'N/A'
            }
            nrequest.images = []

            counter = 0;
            //Without this, the db will update without waiting for the Cloudinary upload function to finish which will result in an empty array for its images
            await new Promise((resolve) => {
                images.forEach(image => {
                    var filePath = path.resolve(__dirname,'../public/UPLOADED', image.name);
    
                    image.mv(filePath,(error) => {
                        cloudinary.uploader.upload(filePath, {
                            tags: 'basic_sample',
                            resource_type: "raw",
                            use_filename: true
                        }).then(function (image) {
                            console.log(filePath);
                            console.log("** File Upload (Promise)");
                            console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                            console.log("* " + image.public_id);
                            console.log("* " + image.url);
                            
                            temp = {
                                image_link: String,
                                image_id: String
                            }
                            temp.image_link = image.url;
                            temp.image_id = image.public_id; 
                            nrequest.images.push(temp)
                            counter++;
                            if(counter == images.length) {
                                resolve()
                            };
                        })
                        .catch(function (err) {
                            console.log();
                            console.log("** File Upload (Promise)");
                            if (err) { console.warn(err); }
                        });
                    })
                })
            })
   
            request.create(nrequest, (error,request) => {
                var notification = { //Create notification for a sent message
                    message: "User \"" + req.session.name + "\" submitted request order on car: \"" + nrequest.car + "\"",
                    read: false,
                    sentdate: today,
                    reqid: request._id    
                }
                
                
                //If the user declines his own request, notify HOST accounts
                console.log("NOTIFYING HOST")
                db.updateOne(account, {host: true}, {$push: {notifications: notification}}, function(result) {
                    console.log(result)
                    res.redirect("/uviewallpending");
                });
            })
        }
        else {
            req.flash('error_msg', 'Only select image files.');
            res.redirect('/createreq');
        }
    },
    
    //Gets the user requests and renders them on a page for the user to view.
    getUserRequests: async function(req, res) {
        var requests = await request.find({userid: req.session.user, status: 'Pending'});
        console.log("requests")
        console.log(requests);
        notifcount = 0;
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            console.log(typeof result.notifications)
            result.notifications.forEach(n => {
                if(!n.read)
                    notifcount++;
            })
            res.render('./onSession/uviewpending', {req: requests.reverse(), isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, notifcount});
        })
    },


    //Renders a specific user request
    renderUserRequest: async function(req, res) {
        notifcount = 0;
        db.findOne(request, {_id: req.body.reqid}, {}, (result) => {
            if (result) {
                var response = {
                    car: result.car,
                    images: result.images,
                    type: result.type,
                    description: result.description,
                    date: result.date,
                    status: result.status,
                    price: result.price,
                    isHost: false,
                    username: req.session.name,
                    fname: req.session.fname, 
                    lname: req.session.lname, 
                    _id: req.body.reqid,
                    messages: result.messages,
                    notifcount: notifcount
                };
                db.findOne(account, {_id: req.session.user}, {}, function(result) {
                    console.log(typeof result.notifications)
                    result.notifications.forEach(n => {
                        if(!n.read)
                            response.notifcount++;
                    })
                    res.render('./onSession/uviewrequest', response);
                })
            }
            else {
                console.log("failed");
            }
        })   
    },


    //Accepts the request with a given quotations by the host.
    acceptRequest: function(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        db.findOne(request, {_id: req.query.reqid}, {}, (result) => {
            // If request has been quoted already
            if (result.price != -1) {
                db.updateOne(request, {_id: req.query.reqid}, {status: "Accepted"}, (result) => {
                    db.findOne(request, {_id: req.query.reqid}, {}, function(result) { //Find the request in DB to get vars
                        console.log(result)
                        var notification = { //Create notification for a sent message
                            message: "User \"" + req.session.name + "\" accepted order on car: \"" + result.car + "\"",
                            read: false,
                            sentdate: today,
                            reqid: result._id    
                        }
                        
                        
                        //If the user declines his own request, notify HOST accounts
                        console.log("NOTIFYING HOST")
                        db.updateOne(account, {host: true}, {$push: {notifications: notification}}, function(result) {
                            console.log(result)
                            res.redirect("/uviewallpending");
                        });
                        
                    });
                });
            }
            else {
                req.flash('error_msg', 'This request has not yet been quoted.');
                res.redirect('/uviewallpending');
            }
        });
        
    },

    //Dclines the request.
    declineRequest: function(req, res) {
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
                
                
                //If the user declines his own request, notify HOST accounts
                console.log("NOTIFYING HOST")
                db.updateOne(account, {host: true}, {$push: {notifications: notification}}, function(result) {
                    console.log(result)
                    res.redirect("/uviewallpending");
                });
                
            });
            
        });
    },


    //Renders the edit page for a given request.
    getEditRequest: function(req, res) {
        notifcount = 0;
        db.findOne(request, {_id: req.body.reqid}, {}, (result) => {
            if (result) {
                db.findOne(account, {_id: req.session.user}, {}, function(acc_result) {
                    acc_result.notifications.forEach(n => {
                        if(!n.read)
                            notifcount++;
                    })
                    res.render("./onSession/ueditrequest", {car: result.car, type: result.type, description: result.description, images: result.images, ogid:req.body.reqid, isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, notifcount});
                })
            }
            else {
                console.log("not found")
            }
        });
    },


    //Commits the changes to the request in the DB
    getEditRequestAction: async function(req, res) {
        //Getting Date
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        today = yyyy+'-'+mm+'-'+dd;

        var updatedReq = {
            car: req.body.rcar,
            type: req.body.rtype,
            description: req.body.rdesc.trim(),
        };

        var notification = { //Create notification for edited request
            message: "User \"" + req.session.name + "\" edited order on car: \"" + updatedReq.car + "\"",
            read: false,
            sentdate: today,
            reqid: req.body.ogid    
        }

        image_links = req.body.image_links;

        //If the edited request only has one new image
        if(!Array.isArray(image_links) && req.body.image_links) {
            image_links = [];
            image_links.push(req.body.image_links)
        }    

        image_ids = req.body.image_ids;

        if(!Array.isArray(image_ids) && req.body.image_ids) {
            image_ids = [];
            image_ids.push(req.body.image_ids)
            console.log("AAA")
        }  

        updatedReq.images = []

        console.log("LINKS AND IDS")
        console.log(image_links)
        console.log(image_ids)
        
        // If no new image
        if(!req.files) {
            if(image_links) {
                console.log("Pushed")
                counter = 0;
                image_links.forEach(n => {
                    temp = {
                        image_link: n,
                        image_id: image_ids[counter]
                    }
                    updatedReq.images.push(temp)
                    counter++;
                })
            }

            console.log("ogid")
            console.log(req.body.ogid)
            console.log(updatedReq)
            console.log("Updating with no new image");
            db.updateOne(request, {_id: req.body.ogid}, updatedReq, (result) => {
                //If the user edits his request, notify HOST accounts
                console.log("NOTIFYING HOST")
                db.updateOne(account, {host: true}, {$push: {notifications: notification}}, function(result) {
                    res.redirect("/uviewallpending");
                });
            });
        }
        // If have new image
        else { 

            console.log('Updating with new image')
            images = req.files.images;

            if(!images.length) {
                images = [];
                images.push(req.files.images)
                console.log("AAA")
            }    

            allimages = true;
            images.forEach(n => {
                if(!n.mimetype.startsWith('image'))
                    allimages = false;
            })

            if(allimages) {
                //Getting Date
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1;
                var yyyy = today.getFullYear();
                today = yyyy+'-'+mm+'-'+dd;

                updatedReq.images = []

                //Pushes images that were unchanged in the edit.
                if(image_links) {
                    console.log("Pushed")
                    counter = 0;
                    image_links.forEach(n => {
                        temp = {
                            image_link: n,
                            image_id: image_ids[counter]
                        }
                        updatedReq.images.push(temp)
                        counter++;
                    })
                }

                counter = 0; 

                //Await so the request isn't changed before the images entered have been uploaded properly
                await new Promise((resolve) => {
                    images.forEach(image => {
                        var filePath = path.resolve(__dirname,'../public/UPLOADED', image.name);
        
                        image.mv(filePath,(error) => {
                            cloudinary.uploader.upload(filePath, {
                                tags: 'basic_sample',
                                resource_type: "raw",
                                use_filename: true
                            }).then(function (image) {
                                console.log(filePath);
                                console.log("** File Upload (Promise)");
                                console.log("* public_id for the uploaded image is generated by Cloudinary's service.");
                                console.log("* " + image.public_id);
                                console.log("* " + image.url);
                                

                                //Gets the links and ids produced by cloudinary and stores it into the request
                                temp = {
                                    image_link: String,
                                    image_id: String
                                }
                                temp.image_link = image.url;
                                temp.image_id = image.public_id; 
                                updatedReq.images.push(temp)
                                counter++;
                                if(counter == images.length) {
                                    resolve()
                                };
                            })
                            .catch(function (err) {
                                console.log();
                                console.log("** File Upload (Promise)");
                                if (err) { console.warn(err); }
                            });
                        })
                    })
                })

                //Updates the request with the new information entered.
                db.updateOne(request, {_id: req.body.ogid}, updatedReq, (result) => {
                    db.updateOne(account, {host: true}, {$push: {notifications: notification}}, function(result) {
                        res.redirect("/uviewallpending");
                    });
                });
            }
            else {
                req.flash('error_msg', 'Only select image files.');
                res.render('./onSession/editreq_holder', {reqid: req.body.ogid})
            }
        }
    },

    //Renders accepted requests.
    getUserAcceptedRequests: async function(req, res) {
        notifcount = 0;
        var requests = await request.find({userid: req.session.user, $or: [{status: 'Accepted'}, {status: 'Settled'}]});
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            console.log(typeof result.notifications)
            result.notifications.forEach(n => {
                if(!n.read)
                    notifcount++;
            })

            requests.forEach(r => {
                if(r.status == "Accepted")
                    r.status = "ONGOING"
                else if(r.status == "Settled")
                    r.status = "FINISHED"
            })

            res.render('./onSession/uviewongoing', {req: requests.reverse(), isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, notifcount}); 
        })
    }, 

    //View notifications
    viewNotifications: async function(req, res) {
        notifcount = 0;
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
                res.render('./onSession/unotifications', {isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, read: read.reverse(), unread: unread.reverse()});
            })
            
        })
    },


    //Contact page.
    viewContact: function(req, res) {
        notifcount = 0;
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            console.log(typeof result.notifications)
            result.notifications.forEach(n => {
                if(!n.read)
                    notifcount++;
            })
            res.render('./onSession/ucontact', {isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, notifcount});
        })
    },

    viewProfile: async function(req, res) {
        notifcount = 0
        db.findOne(account, {_id: req.session.user}, {}, function(result) {
            console.log(typeof result.notifications)
            result.notifications.forEach(n => {
                if(!n.read)
                    notifcount++;
            })
            res.render('./onSession/uviewprofile', {isHost: false, username: req.session.name, fname: req.session.fname, lname: req.session.lname, contact: result.contact, q1: result.questions[0].question, q2: result.questions[1].question, q3: result.questions[2].question, notifcount});
        })
    }
}

module.exports = UserController;