***Settings***
Documentation      A resource file with reusable keywords and variables.
...
...                
Library            SeleniumLibrary

***Variables***
${SERVER}          localhost:1337
${BROWSER}         Chrome
${DELAY}           0
${LOGIN URL}       http://${SERVER}/
${ERROR URL}       http://${SERVER}/login
${FIRST}           User
${LAST}            Testing
${USERNAME}        UserTesting
${PASSWORD}        passTesting123
${CONTACT}         09551234567
${EMAIL}           usertesting33@gmail.com

***Keywords***
Open Browser to Login Page
    Open Browser     ${LOGIN URL}     ${BROWSER}
    Maximize Browser Window
    Set Selenium Speed     ${DELAY}
    Login Page Should Be Open

Login Page Should Be Open
    Page Should Contain Element    login-btn

Input Username
    [Arguments]    ${username}
    Input Text     name    ${username}

Input Password
    [Arguments]    ${password}
    Input Text     pass    ${password}

Go To Login Page
    Go To    ${LOGIN URL}

Submit Credentials
    Click Button    login-btn

Check Homepage
    Page Should Contain Element    class=home-nav

Login Should Have Failed
    Location Should Be    ${ERROR URL}