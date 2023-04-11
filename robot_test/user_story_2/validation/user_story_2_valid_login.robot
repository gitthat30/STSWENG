***Settings***
Documentation    A test suite to check the valid login test cases  for User Story 2, 
...              Change Account Credentials.
...
...              
Resource         resource.robot

***Keywords***
User Successful Login
    Location Should Be    ${USER URL}

Host Successful Login
    Location Should Be    ${HOST URL}

Check Successful Login
    [Arguments]       ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Submit Credentials
    Check Homepage

***Test Cases***
0214 - Valid User Login
    Open Browser to Login Page
    Check Successful Login    ${USER USERNAME}    ${USER PASSWORD}
    User Successful Login
    [Teardown]    Close Browser

0215 - Valid Host Login
    Open Browser to Login Page
    Check Successful Login    ${HOST USERNAME}    ${HOST PASSWORD}
    Host Successful Login
    [Teardown]    Close Browser
