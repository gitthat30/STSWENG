***Settings***
Documentation    A test suite to check User Story 5, User: Delete Account.
...              This test will show different results when the user decided
...              to delete their, continuing or not, from various test cases.
...
Resource         resource.robot

***Variables***
${FNAME}    fname
${LNAME}    lname
${NAME}     name
${PASS}     pass
${CONTACTNUM}    contact
${EMAILACC}    email

***Keywords***
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

Security Questions
    Pick Security Questions
    Favorite Number
    Mother Maiden Name
    Favorite Food

Components
    [Arguments]    ${type}    ${type input}
    Clear Element Text  xpath=//input[@name="${type}"]
    Input Text        xpath=//input[@name="${type}"]    ${type input}

Enter
    Click Button      //button[contains(text(),'SIGN-UP')]

Register
    # First Name
    Components    ${FNAME}    ${FIRST}

    # Last Name
    Components    ${LNAME}    ${LAST}

    # Username
    Components    ${NAME}     ${USERNAME}

    # Password
    Components    ${PASS}     ${PASSWORD}

    # Contact Number
    Components     ${CONTACTNUM}    ${CONTACT}

    # Email
    Components    ${EMAILACC}    ${EMAIL}

    Enter
    Security Questions

Straight To View Profile
    Input Username    ${USERNAME}
    Input Password    ${PASSWORD}
    Submit Credentials
    Click Element     //p[contains(text(),'VIEW PROFILE')]

Create New Account
    Click Element    //a[contains(text(),'CREATE NEW ACCOUNT')]

Account Not Deleted
    Click Button    del-btn
    Click Button    rej-del
    Click Element   //p[contains(text(),'(SIGN-OUT)')]

Account Delete
    Click Button    del-btn
    Click Button    con-del

User Login After Account Delete
    Input Username    ${USERNAME}
    Input Password    ${PASSWORD}
    Submit Credentials

***Test Cases***
0500 - Before Test Cases
    Open Browser to Login Page
    Create New Account
    Register
    Sleep    3
    [Teardown]    Close Browser 

0501 - User Does Not Delete Account
    Open Browser to Login Page
    Straight To View Profile
    Account Not Deleted
    [Teardown]    Close Browser 

0502 - User Delete Account
    Open Browser to Login Page
    Straight To View Profile
    Account Delete
    User Login After Account Delete
    Login Should Have Failed
    Sleep    3
    [Teardown]    Close Browser 
    