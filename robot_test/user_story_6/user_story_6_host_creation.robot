***Settings***
Documentation    A test suite to check User Story 6, Host Account Creation.
...              This test will create an account for the Host.
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

***Keywords***
Login into Homepage
    [Arguments]    ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Submit Credentials

Go to Host Account Creation
    Click Element      //p[contains(text(),'NEW HOST')]

Components
    [Arguments]    ${type}    ${type input}
    Clear Element Text  xpath=//input[@name="${type}"]
    Input Text        xpath=//input[@name="${type}"]    ${type input}

Register
    # First Name
    Components    ${FNAME}    ${FIRST}

    # Last Name
    Components    ${LNAME}    ${LAST}

    # Position
    Components    ${POSITION}    ${POST}

    # Username
    Components    ${NAME}     ${USERNAME}

    # Password
    Components    ${PASS}     ${PASSWORD}

    # Contact Number
    Components     ${CONTACTNUM}    ${CONTACT}

    # Email
    Components    ${EMAILACC}    ${EMAIL}

Security Questions
    [Arguments]    ${type}    ${type input}
    Clear Element Text  xpath=//input[@name="${type}"]
    Input Text        xpath=//input[@name="${type}"]    ${type input}

Security Questions Answers
    Security Questions    a1    ${ANSWER 1}
    Security Questions    a2    ${ANSWER 2}
    Security Questions    a3    ${ANSWER 3}

Sign-out
    Click Element    //p[contains(text(),'HOST (SIGN-OUT)')]

Go to View Profile
    Click Element    //p[contains(text(),'VIEW PROFILE')]

Delete Account
    Click Button    del-btn
    Click Button    con-del

Login Should Be Successful
    Location Should Be    http://${SERVER}/hhome

***Test Cases***
0601 - Host Account Creation
    Open Browser to Login Page
    Login into Homepage    ${HOST USERNAME}    ${HOST PASSWORD}
    Go to Host Account Creation
    Register
    Security Questions Answers
    Click Button    //button[contains(text(),'SIGN-UP')]
    Sign-out
    Login into Homepage    ${USERNAME}    ${PASSWORD}
    Login Should Be Successful
    Sleep    3
    [Teardown]    Close Browser 

0602 - Delete Host Then Login
    Open Browser to Login Page
    Login into Homepage    ${USERNAME}    ${PASSWORD}
    Go to View Profile
    Delete Account
    Login into Homepage    ${USERNAME}    ${PASSWORD}
    Login Should Have Failed
    Sleep    3
    [Teardown]    Close Browser 
    
