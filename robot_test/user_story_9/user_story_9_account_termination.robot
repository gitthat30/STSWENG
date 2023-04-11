***Settings***
Documentation    A test suite to check User Story 9, Account Blacklist and Termination.
...              This test will terminate the hosts and users that are detrimental to the business.
...
Resource         resource.robot

***Variables***
${FNAME}    fname
${LNAME}    lname
${POSITION}    pos
${NAME}     name
${PASS}     pass
${CONTACTNUM}    contact
${EMAILACC}    email

# Host
${HOST FIRST}           Alan
${HOST LAST}            Zaelot
${HOST POST}            Area Manager
${HOST USERNAME}        Zlatan
${HOST PASSWORD}        zlatan123
${HOST CONTACT}         09566547321
${HOST EMAIL}           zlatan77@gmail.com
${ANSWER 1}        77
${ANSWER 2}        Guin
${ANSWER 3}        Pork

# User
${USER FIRST}           Userzzz
${USER LAST}            Testingzzz
${USER USERNAME}        UserzzzTestzzz
${USER PASSWORD}        pazzTesting123
${USER CONTACT}         09556547321
${USER EMAIL}           userzzz213@gmail.com
# Values here are interchangeable based on the values under class.
${USER PROFILE}         64352701f4324666d8bb4ace 
${HOST PROFILE}         643526f3f4324666d8bb4aa3

***Keywords***
Login into Homepage
    [Arguments]    ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Submit Credentials

Components
    [Arguments]    ${type}    ${type input}
    Clear Element Text  xpath=//input[@name="${type}"]
    Input Text        xpath=//input[@name="${type}"]    ${type input}

Sign-out
    Click Element    //p[contains(text(),'(SIGN-OUT)')]

Login Should Be Successful
    Location Should Be    http://${SERVER}/hhome

Go to User Profile
    Click Button    xpath=//button[@value="${USER PROFILE}"]

Go to Host Profile
    Click Button    xpath=//button[@value="${HOST PROFILE}"]

Go to Manage Users
    Click Element    //p[contains(text(),'Manage Users')]

Enter Terminate Account
    Click Button    //button[contains(text(),'Terminate Account')]

# Host Account Creation
Go to Host Account Creation
    Click Element      //p[contains(text(),'NEW HOST')]

Host Register
    # First Name
    Components    ${FNAME}    ${HOST FIRST}

    # Last Name
    Components    ${LNAME}    ${HOST LAST}

    # Position
    Components    ${POSITION}    ${HOST POST}

    # Username
    Components    ${NAME}     ${HOST USERNAME}

    # Password
    Components    ${PASS}     ${HOST PASSWORD}

    # Contact Number
    Components     ${CONTACTNUM}    ${HOST CONTACT}

    # Email
    Components    ${EMAILACC}    ${HOST EMAIL}

Security Questions
    [Arguments]    ${type}    ${type input}
    Clear Element Text  xpath=//input[@name="${type}"]
    Input Text        xpath=//input[@name="${type}"]    ${type input}

Security Questions Answers
    Security Questions    a1    ${ANSWER 1}
    Security Questions    a2    ${ANSWER 2}
    Security Questions    a3    ${ANSWER 3}

# User Account Creation
Create New Account
    Click Element    //a[contains(text(),'CREATE NEW ACCOUNT')]

Pick Security Questions
    Click Element    xpath=//input[@id="question1"]
    Click Element    xpath=//input[@id="question2"]
    Click Element    xpath=//input[@id="question3"]
    Click Button     subbtn

Favorite Number
    Input Text        xpath=//input[@name="answer"]       33
    Input Text        xpath=//input[@name="answercon"]    33
    Click Button      login-btn

Mother Maiden Name
    Input Text        xpath=//input[@name="answer"]       Masha
    Input Text        xpath=//input[@name="answercon"]    Masha
    Click Button      login-btn

Favorite Food
    Input Text        xpath=//input[@name="answer"]       BastaMasarap
    Input Text        xpath=//input[@name="answercon"]    BastaMasarap
    Click Button      login-btn

User Security Questions
    Pick Security Questions
    Favorite Number
    Mother Maiden Name
    Favorite Food

Enter
    Click Button      //button[contains(text(),'SIGN-UP')]

User Register
    # First Name
    Components    ${FNAME}    ${USER FIRST}

    # Last Name
    Components    ${LNAME}    ${USER LAST}

    # Username
    Components    ${NAME}     ${USER USERNAME}

    # Password
    Components    ${PASS}     ${USER PASSWORD}

    # Contact Number
    Components     ${CONTACTNUM}    ${USER CONTACT}

    # Email
    Components    ${EMAILACC}    ${USER EMAIL}

    Enter
    User Security Questions

***Test Cases***
# 0900 - Host Account Creation
#     Open Browser to Login Page
#     Login into Homepage    ${ORIGINAL HOST USERNAME}    ${ORIGINAL HOST PASSWORD}
#     Go to Host Account Creation
#     Host Register
#     Security Questions Answers
#     Click Button    //button[contains(text(),'SIGN-UP')]
#     Sign-out
#     Login into Homepage    ${HOST USERNAME}    ${HOST PASSWORD}
#     Login Should Be Successful
#     Sleep    3
#     [Teardown]    Close Browser 

# 0900 - User Account Creation
#     Open Browser to Login Page
#     Create New Account
#     User Register
#     Sleep    3
#     [Teardown]    Close Browser 

0901 - Terminate Host Account
    Open Browser to Login Page
    Login into Homepage    ${ORIGINAL HOST USERNAME}    ${ORIGINAL HOST PASSWORD}
    Go to Manage Users
    Go to Host Profile
    Enter Terminate Account
    Sign-out
    Login into Homepage    ${HOST USERNAME}    ${HOST PASSWORD}
    Login Should Have Failed
    Sleep    3
    [Teardown]    Close Browser 

0902 - Terminate User Account
    Open Browser to Login Page
    Login into Homepage    ${ORIGINAL HOST USERNAME}    ${ORIGINAL HOST PASSWORD}
    Go to Manage Users
    Go to User Profile
    Enter Terminate Account
    Sign-out
    Login into Homepage    ${USER USERNAME}    ${USER PASSWORD}
    Login Should Have Failed
    Sleep    3
    [Teardown]    Close Browser 