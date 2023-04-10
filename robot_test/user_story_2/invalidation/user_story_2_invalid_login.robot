***Settings***
Documentation    A test suite to check the invalid login test cases for User Story 2, 
...              Change Account Credentials.
...
...              
...
Test Template    Login With Invalid Credentials Should Fail
Suite Setup       Open Browser To Login Page
Suite Teardown    Close Browser
Test Setup        Go To Login Page
Resource         resource.robot

***Variables***
${VALID USER}     Angelo
${VALID PASSWORD}    newpass777
${VALID HOSTUSER}     HOST
${VALID HOSTPASS}    1234567890

***Test Cases***                        USERNAME         PASSWORD
0206 - Invalid Username                 angelo           ${VALID PASSWORD}
0207 - Invalid Password 1               ${VALID USER}    newpass12
0208 - Invalid Password 2               ${VALID USER}    newpass1234
0209 - Invalid Password 3               ${VALID USER}    Newpass12
0210 - Invalid Username And Password    invalid          whatever
0211 - Empty Username                   ${EMPTY}         ${VALID PASSWORD}
0212 - Empty Password                   ${VALID USER}    ${EMPTY}
0213 - Empty Username And Password      ${EMPTY}         ${EMPTY}

***Keywords***
Login With Invalid Credentials Should Fail
    [Arguments]       ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Submit Credentials
    Login Should Have Failed
    