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
${FIRST}           Lan
${LAST}            Celot
${POST}            Manager
${USERNAME}        Lancelot
${PASSWORD}        lancelot123
${CONTACT}         09561234567
${EMAIL}           lancelot77@gmail.com
${ANSWER 1}        77
${ANSWER 2}        Guin
${ANSWER 3}        Pork
${HOST USERNAME}   HOST
${HOST PASSWORD}   1234567890


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

Submit Credentials
    Click Button    login-btn

Login Should Have Failed
    Location Should Be    ${ERROR URL}

Login Should be Successful
    Location Should Be    http://${SERVER}/hhome