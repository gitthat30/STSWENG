const express = require('express');
const app = express();
const { isPublic, isPrivate, isHost } = require('../middlewares/sessionCheck.js');

const PublicController = require('../controllers/PublicController.js');
const UserController = require('../controllers/UserController.js');
const HostController = require('../controllers/HostController.js');

// [PUBLIC] Account Creation
app.get('/', isPublic, PublicController.getIndex);
app.post('/registeruser', isPublic, PublicController.registerUser);
app.post('/question1', isPublic, PublicController.getQuestion1);
app.post('/question2', isPublic, PublicController.getQuestion2);
app.post('/question3', isPublic, PublicController.getQuestion3);
app.post('/checkforquestion4', isPublic, PublicController.checkforQuestion4);
app.post('/finish', isPublic, PublicController.registerUser2);
app.get('/login', isPublic, PublicController.getLogin);
app.post('/loginpost', isPublic, PublicController.loginUser);
app.get('/register', isPublic, PublicController.getRegister);

// [PUBLIC] Account Recovery
app.get('/forgot', isPublic, PublicController.forgotPassword);
app.post('/chooserecovery', isPublic, PublicController.chooseRecovery);

// [PUBLIC] Email Recovery
app.post('/emailrecovery', isPublic, PublicController.sendEmail);
app.get('/emailfinish', isPublic, PublicController.emailDone);

// [PUBLIC] Security Questions
app.post('/answer1', isPublic, PublicController.getAnswer1);
app.post('/answer2', isPublic, PublicController.getAnswer2);
app.post('/answer3', isPublic, PublicController.getAnswer3);
app.post('/checkanswer4', isPublic, PublicController.getAnswer4);
app.post('/finishanswer4', isPublic, PublicController.finishAnswer4);

app.get('/home', isPrivate, UserController.getUser);
app.get('/hhome', isHost, HostController.getHost);
app.get('/logout', isPrivate, UserController.logoutUser);
app.post("/sendmessage", isPrivate, UserController.sendMessage);
app.post('/downloadFile', isPrivate, UserController.download);

// [CLIENT] Profile View
app.get('/uviewprofile', isPrivate, UserController.viewProfile);
app.post('/confirmPass', isPrivate, UserController.confirmPassword);
app.get('/editprofile', isPrivate, UserController.editProfile);
app.get('/editquestions', isPrivate, UserController.editQuestions);
app.post('/confirmquestions', isPrivate, UserController.confirmQuestions);
app.post('/confirmeditprofile', isPrivate, UserController.confirmeditProfile);
app.get('/deleteaccount', isPrivate, UserController.deleteAccount);

// [CLIENT] Create Estimation Request
app.get("/createreq", isPrivate, UserController.getUserRequestCreation);
app.post("/submitreq", isPrivate, UserController.submitRequest);

// [CLIENT] Pending for Confirmation
app.get("/uviewallpending", isPrivate, UserController.getUserRequests);
app.post("/uviewpending", isPrivate, UserController.renderUserRequest);
app.get("/acceptreq", isPrivate, UserController.acceptRequest);
app.get("/declinereq", isPrivate, UserController.declineRequest);
app.post("/ueditrequest", isPrivate, UserController.getEditRequest);
app.post("/ueditrequestconfirm", isPrivate, UserController.getEditRequestAction);

// [CLIENT] Active Jobs
app.get("/uviewactive", isPrivate, UserController.getUserAcceptedRequests);

//[CLIENT] View Notifications
app.get("/uviewnotifications", isPrivate, UserController.viewNotifications); 

// [CLIENT] View Contact
app.get("/uviewcontact", isPrivate, UserController.viewContact);

// [CLIENT] VIEW FEEDBACK
app.get("/enterFeedback", isPrivate, UserController.enterFeedback);
app.get("/uviewfeedback/:id", isPrivate, UserController.viewFeedBack);

// [HOST] CREATE HOST ACCOUNT
app.get("/hregister", isHost, HostController.newHost);
app.post("/hregisterconfirm", isHost, HostController.registerHost);

// [HOST] VIEW FEEDBACK 
app.post("/hviewfeedback", isHost, HostController.viewFeedBack);
app.get("/henterFeedback", isHost, HostController.enterFeedback);

// [HOST] VIEW PROFILE
app.get('/hviewprofile', isHost, HostController.hviewProfile);

// [HOST] EDIT PROFILE
app.get('/heditprofile', isPrivate, HostController.heditProfile);
app.post('/hconfirmeditprofile', isPrivate, HostController.hconfirmeditProfile);

// [HOST] Customer Estimation Requests
app.get("/hviewallpending", isHost, HostController.getPendingRequests);
app.post("/hviewpending", isHost, HostController.viewRequest);
app.post("/sendquotation", isHost, HostController.sendQuotation);
app.post("/addpaidbalance", isHost, HostController.addPaidBalance);
app.post("/settle", isHost, HostController.settleRequest);
app.get("/deletereq", isHost, HostController.hostDeleteRequest);
app.post("/editoutstanding", isHost, HostController.editOutstanding);

// [HOST] Active Jobs
app.get("/hviewactive", isHost, HostController.viewActiveRequests);
app.get("/viewaddnewjob", isHost, HostController.viewAddNewJob);
app.post("/addnewjob", isHost, HostController.addNewJob);

// [HOST] Generate Report
app.get("/viewgeneratereport", isHost, HostController.viewGenerateReport);
app.get("/generatereport", isHost, HostController.generateReport);

// [HOST] View Suppliers' Contacts
app.get("/viewsuppliers", isHost, HostController.viewSuppliers);

//[HOST] View Notifications
app.get("/hviewnotifications", isHost, HostController.viewNotifications); 

//[HOST] MANAGE USERS
app.get("/hmanageusers", isHost, HostController.manageUsers);
app.get("/hviewUserProfile/:id", isHost, HostController.viewUserProfile);
app.get("/hterminate", isHost, HostController.terminateAccount);

module.exports = app;