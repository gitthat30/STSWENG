//MongoDB conncetions
const { connect } = require('mongoose');
const { ObjectId } = require('mongodb');

//Routes to allow for more organized redirection, etc.
const app = require('../routes/routes.js');

//This file contains the database functions (Ex: Search, Adding entry, etc.)
const db = require('../models/db.js');
const bcrypt = require('../util/bcrypt')
//Path
const path = require('path');

//Model Schemas
const account = require('../models/Accounts.js');
const request = require('../models/Requests.js');

//Nodemailer Utility for Email Password Recovery
const email = require('../util/nodemailer.js')

//I won't lie, I have no idea what these are for, hahaha
const { totalmem } = require('os');
const { localsAsTemplateData } = require('hbs');



const PublicController = {

    //This renders the home page
    getIndex: async function(req, res) {
        
        //This creates a HOST account if there is none. This is so there will never be a time when a HOST account doesn't exist.
        db.findOne(account, {username: 'HOST', host: true}, {}, async (result) => {
            if (result) {
                res.render('login');
            }
            else {
                password = '1234567890'

                hashed = await bcrypt.hash(password)

                console.log(result);
                newuser = {
                    username: 'HOST',
                    password: hashed,
                    host: true,
                }

                account.create(newuser);
                res.render('login');
            }
        })     
        
    },


    //Login function
    loginUser: async function(req, res) {

        //Gets the values entered
        var user = req.body.name;
        var pass = req.body.pass;

        console.log("Here")
        //Finds the username entered in the db, checks the password entered if it matches the one in the DB, then logs the user in if they match.
        dbquery = await new Promise((resolve, reject) => {
            db.findOne(account, {username: user}, {}, (result) => {
                if (!result)
                    reject()
                else
                    resolve(result)
            })
        }).catch(() => {
            console.log("error")
        })
        
        if(!dbquery) {
            req.flash('error_msg', 'User not found.');   
            res.redirect('/login');
        }
        else {
            console.log("Here2")
            test = await new Promise((resolve) => {
                resolve(bcrypt.compare(pass, dbquery.password));
            })


            console.log("hash comparison =", test)
            if(test) {
                req.session.user = dbquery._id;
                req.session.name = dbquery.username;
                req.session.fname = dbquery.fname;
                req.session.lname = dbquery.lname;
                req.session.host = dbquery.host;
                req.session.contact = dbquery.contact;
                console.log(req.session);

                if(result.host)
                    res.redirect('/hhome');
                else 
                    res.redirect('/home');
            }
            else {
                req.flash('error_msg', 'User Credentials entered wrong.');   
                res.redirect('/login');
            }
        }
    },

    //Registers a new user
    registerUser: async function(req, res) {
        encrpyted = await bcrypt.hash(req.body.pass.trim()) //Hashing the password

        //Gets the values entered
        newaccount = {
            fname: req.body.fname.trim(),
            lname: req.body.lname.trim(),
            user: req.body.name.trim(),
            pass: encrpyted,
            con: req.body.contact.trim(),
            email: req.body.email.trim()
        }

        //DB function looks for a matching username, contact number and or email...
        db.findOne(account, { $or: [{username: newaccount.user}, {contact: newaccount.con}, {email: newaccount.email}]}, {}, (result) => {

            //If found, account creation is stopped.
            if (result) {
                console.log(result);
                if (result.username == newaccount.user)
                    req.flash('error_msg', 'User already exists. Please login.');
                else if (result.contact == newaccount.con)
                    req.flash('error_msg', 'This contact number is already registered.');
                else if (result.email == newaccount.email)
                    req.flash('error_msg', 'This email is already registered.');
                res.redirect('/register');
            }
            else { //Else, we proceed with the next step in creating an account
                console.log("RENDER")

                //This redirects to the page where a user can select their security questions for their account recovery.
                res.render('register1', newaccount);
            }
        })  
    },


    //Next step in account creation.
    getQuestion1: async function(req, res) {

        //Carrying over the variables from the last step.
        var newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            user: req.body.user,
            pass: req.body.pass,
            con: req.body.con,
            email: req.body.email
        }

        console.log(req.body.question)
        console.log(newaccount)

        
        var questions = []
        count = 0;

        //This takes the questions selected by the user and stores them into an object. This is to help the parsing and storing of the answers of the security questions in the coming steps
        req.body.question.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            questions.push(temp)
            count++;
        });
        newaccount.questions = questions

        //Goes to the next step of the account creation.
        res.render('question1', newaccount);
    },


    //Next step in account creation. Here, the function stores the answer of the user's first security question.
    getQuestion2: async function(req, res) {
        //Assign answer to first question, then render the next question
        assign = 0;

        //Carrying over the variables from the previous step.
        var newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            user: req.body.user,
            pass: req.body.pass,
            con: req.body.con,
            email: req.body.email
        }

        questions = []
        
        count = 0;
        req.body.questions.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            if(temp.pos == assign)
                temp.answer = req.body.answer //Stores answer to the index of the object array corresponding to the question answered. See the assign variable at the start of the function.
            questions.push(temp)
            count++;
        });
        count = 0;

        newaccount.questions = questions

        //After storing the answer to the first question, we proceed to the next step.
        res.render('question2', newaccount);
    },

    //Next step.
    getQuestion3: async function(req, res) {
       //Assign answer to second question, then render the next question
        assign = 1;

        //Same as previously, storing variables.
        newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            user: req.body.user,
            pass: req.body.pass,
            con: req.body.con,
            email: req.body.email
        }

        questions = []
        
        count = 0;
        req.body.questions.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            if(temp.pos == assign)
                temp.answer = req.body.answer  //Storing answer...
            questions.push(temp)
            count++;
        });
        count = 0;
        req.body.answers.forEach(element => {
            if(count != assign)
                questions[count].answer = element;
            count++;
        });
        newaccount.questions = questions

        //Next step.
        res.render('question3', newaccount);
    },

    //Next step.
    checkforQuestion4: async function(req, res) {
        //Assign answer to third question, then render the next question (if there is one)
         assign = 2;

         var today = new Date();
         var dd = today.getDate();
         var mm = today.getMonth() + 1;
         var yyyy = today.getFullYear();
         var hr = today.getHours();
         var min = today.getMinutes();

         if(dd/10 < 1) {
            dd = '0' + dd
        }

        if(mm/10 < 1) {
            mm = '0' + mm
        }

         today = yyyy+'-'+mm+'-'+dd +' ('+hr+':'+min+')';

         //Storing variables.
         newaccount = {
            fname: req.body.fname,
            lname: req.body.lname,
            username: req.body.user,
            password: req.body.pass,
            contact: req.body.con,
            email: req.body.email,
            registerdate: today
         }
 
         questions = []
         
         count = 0;
         req.body.questions.forEach(element => {
             
             var temp = {
                 question: String,
                 answer: String,
                 pos: Number
             }
             temp.question = element;
             temp.pos = count;
             if(temp.pos == assign)
                 temp.answer = req.body.answer //Storing answer
             questions.push(temp)
             count++;
         });
         count = 0;
         req.body.answers.forEach(element => {
             if(count != assign)
                 questions[count].answer = element;
             count++;
         });
         newaccount.questions = questions

         if(req.body.question3flag) //This is a flag sent by the page (see the question handlebars), that lets the function know whether there is a fourth question (A user can pick 3-4 questions)
            res.render('question4', newaccount); //If there is a question, there is one final step that stores the answer to the fourth and final question.
         else {

            //Else the account is created.
            create = await account.create(newaccount);
            
            var user = newaccount.username;
            var pass = newaccount.password;

            console.log(user);
            
            //Auto login after account creation
            db.findOne(account, {username: user}, {}, (result) => {
                if (result) {
                    console.log(result);
                    if(result.password == pass) {
                        req.session.user = result._id;
                        req.session.name = result.username;
                        req.session.fname = result.fname;
                        req.session.lname = result.lname;
                        req.session.host = result.host;
                        req.session.contact = result.contact;
                        console.log(req.session);

                        if(result.host)
                            res.redirect('/hhome');
                        else 
                            res.redirect('/home');
                    }
                    else {
                        req.flash('error_msg', 'Incorrect password.');   
                        res.redirect('/login');
                    }
                }
                else {
                    req.flash('error_msg', 'This user does not exist. Please register.');
                    res.redirect('/login');
                }
            })  
         }
     },

     //Final step for users with four security questions
     registerUser2: async function(req, res) {
        //Assign answer to third question, then render the next question (if there is one)
        assign = 3;
        console.log(assign)

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hr = today.getHours();
        var min = today.getMinutes();

        if(dd/10 < 1) {
            dd = '0' + dd
        }

        if(mm/10 < 1) {
            mm = '0' + mm
        }

        if(hr/10 < 1) {
            hr = '0' + hr
        }

        if(min/10 < 1) {
            min = '0' + min
        }

        today = yyyy+'-'+mm+'-'+dd +' ('+hr+':'+min+')';

        newaccount = {
           fname: req.body.fname,
           lname: req.body.lname,
           username: req.body.user,
           password: req.body.pass,
           contact: req.body.con,
           email: req.body.email,
           registerdate: today
        }

        questions = []
        
        count = 0;
        req.body.questions.forEach(element => {
            
            var temp = {
                question: String,
                answer: String,
                pos: Number
            }
            temp.question = element;
            temp.pos = count;
            if(temp.pos == assign)
                temp.answer = req.body.answer
            questions.push(temp)
            count++;
        });
        count = 0;
        req.body.answers.forEach(element => {
            if(count != assign)
                questions[count].answer = element;
            count++;
        });
        newaccount.questions = questions

        //Account is created
        create = await account.create(newaccount);
        
        console.log(create);

        var user = newaccount.username;
        var pass = newaccount.password;

        console.log(user);
        
        //Auto login after account creation
        db.findOne(account, {username: user}, {}, (result) => {
            if (result) {
                console.log(result);
                if(result.password == pass) {
                    req.session.user = result._id;
                    req.session.name = result.username;
                    req.session.fname = result.fname;
                    req.session.lname = result.lname;
                    req.session.host = result.host;
                    req.session.contact = result.contact;
                    console.log(req.session);

                    if(result.host)
                        res.redirect('/hhome');
                    else 
                        res.redirect('/home');
                }
                else {
                    req.flash('error_msg', 'Incorrect password.');   
                    res.redirect('/login');
                }
            }
            else {
                req.flash('error_msg', 'This user does not exist. Please register.');
                res.redirect('/login');
            }
        })
    },
    /* 
    registerUser2: async function(req, res) {
        //Assign answer to third question, then render the next question (if there is one)
         assign = 2;
         console.log("Testinagina")
         console.log(assign)
         newaccount = {
            username: req.body.user,
            password: req.body.pass,
            contact: req.body.con,
            email: req.body.email
         }
 
         questions = []
         
         count = 0;
         req.body.questions.forEach(element => {
             
             var temp = {
                 question: String,
                 answer: String,
                 pos: Number
             }
             temp.question = element;
             temp.pos = count;
             if(temp.pos == assign)
                 temp.answer = req.body.answer
             questions.push(temp)
             count++;
         });
         count = 0;
         req.body.answers.forEach(element => {
             if(count != assign)
                 questions[count].answer = element;
             count++;
         });
         newaccount.questions = questions
         console.log("Testinagina")
         console.log(newaccount)       
    },*/

    //Email recovery
    sendEmail: async function(req, res) {
        console.log(req.body.userid)
        hashed = await bcrypt.hash(req.body.userid)

        db.updateOne(account, {_id: req.body.userid}, {password: hashed}, (result) => {
            console.log(result)
        })

        //Finds the account in question, gets the information from the database and sends an email with the corresponding credentials.
        db.findOne(account, {_id: req.body.userid}, {}, (result) => {
            console.log(result.email);

            //Nodemailer sends emails in HTML format, so the email is written like it. This is just an HTML style piece of text that we then send using nodemailer.
            html1 = 'Hello! These are your account credentials: <br><br>' + 
                    '<b>User: </b>' + result.username + 
                    '<br><b>Password:</b> ' + req.body.userid + ' <br>(Your new password. Please change it as soon as possible!)';
            html2 = '<br><br><b>Security Questions</b><br>' +
                    '<b>Question 1: </b>' + result.questions[0].question + ' <br><b>Answer: </b>' + result.questions[0].answer +
                    '<br><br><b>Question 2: </b>' + result.questions[1].question + ' <br><b>Answer: </b>' + result.questions[1].answer +
                    '<br><br><b>Question 3: </b>' + result.questions[2].question + ' <br><b>Answer: </b>' + result.questions[2].answer;

            if(result.questions[3]) {
                html2 = html2 + '<br><br><b>Question 4: </b>' + result.questions[3].question + ' <br><b>Answer: </b>' + result.questions[3].answer
            }

            //Setting up the required variables for nodemailer.
            mail = {
                from: 'team_autoworks@hotmail.com',
                to: result.email,
                subject: 'Team Autoworks - Password Recovery',
                html: html1 + html2
            }

            //This email function is defined in /util/nodemailer.js!
            email(mail);

            res.redirect('/emailfinish')
        })
    },


    //The following variables kinda just render hbs.
    emailDone: async function(req, res) {
        res.render('emailed')
    },


    getLogin: async function(req, res) {
        res.render('login');
    },

    getRegister: async function(req, res) {
        res.render('register');
    },

    forgotPassword: async function(req, res) {
        res.render('forgotpass');
    },


    //Password recovery.
    chooseRecovery: async function(req, res) {
        db.findOne(account, { $or: [{username: req.body.user}, {email: req.body.user}]}, {}, (result) => {
            console.log(result)

            //Password recovery requires a username or email. If no valid ones are entered, the user is redirected back to the first step of recovery.
            if (!result) {
                req.flash('error_msg2', 'Please enter a valid username or email!');
                res.redirect('/forgot')
            }
            else {
                res.render('chooserecovery', {userid: result._id})
            }
        });
    },

    //Renders first question, gets the answer and renders second question.
    getAnswer1: async function(req, res) {
        //Answer question 1
        db.findOne(account, {_id: req.body.userid}, {}, (result) => {
            console.log(result) //No need to check with an if statement cus this is inaccessible without having a valid user (I THINK)
            
            res.render('answer1', result)
        });
    },


    //First question and first answer entered are checked. If the answer is right, then the boolean for that question is set to true.
    //The way the logic works is that there is a boolean array for each user security question that stores whether or not the user got it correct or not.
    //At the end of all the questions, there will be a function that checks whether or not the user got all the questions correct. The credentials are given if they're all correct
    //Else, the user is informed that they got something wrong, then they're given a choice to redirect back to the home page.
    getAnswer2: async function(req, res) {
        //Check Question 1 -> Add Boolean if Correct -> Render Question 2 Regardless
        assign = 0;
        
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //No corrects to count yet (First Correct)
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        console.log(vars)
        res.render('answer2', vars)
    },

    getAnswer3: async function(req, res) {
        //Check Question 2 -> Add Boolean if Correct -> Render Question 3 Regardless
        assign = 1;
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //Count Corrects
        count = 0;
        req.body.corrects.forEach(element => {
            questions[count].correct = element;
            count++;
        });
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        console.log(vars)
        res.render('answer3', vars)
    },

    getAnswer4: async function(req, res) {
        //Check Question 3 -> Add Boolean if Correct -> if theres a question 4 -> render else? give pass
        assign = 2;
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //Count Corrects
        count = 0;
        req.body.corrects.forEach(element => {
            questions[count].correct = element;
            count++;
        });
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        console.log("3")
        console.log(vars)
        if(vars.questions[3])
            res.render('answer4', vars);
        else {
            passed = true;
            vars.questions.forEach(element => {
                if(!element.correct)
                    passed = false;
            });
            if(passed) {
                console.log(req.body.userid)
                hashed = await bcrypt.hash(req.body.userid)
    
                db.updateOne(account, {_id: req.body.userid}, {password: hashed}, (result) => {
                    console.log(result)
                })

                db.findOne(account, {_id: req.body.userid}, {}, (result) => {
                    result.passed = passed;
                    result.password = req.body.userid;
                    res.render('passworddisplay', result)
                })    
            }
            else
                res.render('passworddisplay', passed)
        }
    },

    finishAnswer4: async function(req, res) {
        //Check Question 2 -> Add Boolean if Correct -> Render Question 3 Regardless
        assign = 3;
        if(req.body.answers[assign] == req.body.answer)
            correct = true
        else
            correct = false

        corrects = []
        questions = []

        count = 0;
        req.body.questions.forEach(element => {
            var temp = {
                question: String,
                answer: String,
                correct: Boolean
            }
            temp.question = element;
            questions.push(temp)
            count++;
        });
        
        count = 0;
        req.body.answers.forEach(element => {
            questions[count].answer = element;
            count++;
        });
        
        //Count Corrects
        count = 0;
        req.body.corrects.forEach(element => {
            questions[count].correct = element;
            count++;
        });
        questions[assign].correct = correct;

        vars = {
            userid: req.body.userid,
            questions: questions
        }

        
        passed = true;
        vars.questions.forEach(element => {
            if(!element.correct)
                passed = false;
        });
        if(passed) {
            console.log(req.body.userid)
            hashed = await bcrypt.hash(req.body.userid)

            db.updateOne(account, {_id: req.body.userid}, {password: hashed}, (result) => {
                console.log(result)
            })

            db.findOne(account, {_id: req.body.userid}, {}, (result) => {
                result.passed = passed;
                result.password = req.body.userid;
                
                res.render('passworddisplay', result)
            })    
        }
        else
            res.render('passworddisplay', passed)
    },
}

module.exports = PublicController;