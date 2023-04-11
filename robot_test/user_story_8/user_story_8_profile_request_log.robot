***Settings***
Documentation    A test suite to check User Story 8, HOST: Profile Request Log and Transaction history.
...              This test will check if HOST can check all the users and host, and their transaction history.
...
Resource         resource.robot

***Keywords***
Login into Homepage
    [Arguments]    ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Submit Credentials

Go to Manage Users
    Click Element    //p[contains(text(),'Manage Users')]

Check Gabe Account
    Click Button    xpath=//button[@value="640736b296fd14a0841e52aa"]

Check Leo Account
    Click Button    xpath=//button[@value="640b0eb6ba3df413da273146"]

Sign-out
    Click Element    //p[contains(text(),'(SIGN-OUT)')]

***Test Cases***
0801 - Profile Request Log and Transaction history
    Open Browser to Login Page
    Login into Homepage    ${HOST USERNAME}    ${HOST PASSWORD}
    Go to Manage Users
    Check Gabe Account
    Sleep    3
    Go to Manage Users
    Check Leo Account
    Sleep    3
    Sign-out
    [Teardown]    Close Browser 


