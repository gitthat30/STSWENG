***Settings***
Documentation    A test suite to check User Story 2, Change Account Credentials.
...              This test will check the changing of the account credentials, showing
...              that all of them change accordingly.
...
Resource         resource.robot

***Variables***
${FNAME}    Noel
${LNAME}    Reyes
${EMAIL}    noelreyes@gmail.com
${CONTACT}    09991111111
${CHANGE PASS}    newpass777
${USERNAME}    Angelo
${OLD PASS}    newpass123

***Keywords***
Edit Profile
    Click Button      //button[contains(text(),'Edit Profile')]

Straight To View Profile
    [Arguments]    ${inputUsername}    ${inputPassword}
    Open Browser to Login Page
    Input Username    ${inputUsername}
    Input Password    ${inputPassword}
    Submit Credentials
    Click Element     //p[contains(text(),'VIEW PROFILE')]

First Name
    [Arguments]    ${input}
    Clear Element Text  xpath=//input[@name="fname"]
    Input Text        xpath=//input[@name="fname"]    ${input}

Last Name
    [Arguments]    ${input}
    Clear Element Text  xpath=//input[@name="lname"]
    Input Text        xpath=//input[@name="lname"]    ${input}

Email
    [Arguments]    ${input}
    Clear Element Text  xpath=//input[@name="email"]
    Input Text        xpath=//input[@name="email"]    ${input}

Contact Number
    [Arguments]    ${input}
    Clear Element Text  xpath=//input[@name="contact"]
    Input Text        xpath=//input[@name="contact"]    ${input}

Enter
    Click Button      //button[contains(text(),'Confirm')]

Password
    [Arguments]    ${input}
    Click Button    change-btn
    Input Text      xpath=//input[@id="newpass"]    ${input}
    Input Text      xpath=//input[@id="valpass"]    ${input}
    Click Button    confpass-btn

Sign-out
    Click Element   //p[contains(text(),'(SIGN-OUT)')]

Change Everything
    First Name    Noel Angelo
    Last Name     Pastrana
    Email         noelangelopastrana@gmail.com
    Contact Number    09999999999
    Enter
    Sleep           3
    Password      newpass123
    Sign-out

***Test Cases***
0200 - Before Test Cases
    Straight To View Profile    ${USERNAME}    ${CHANGE PASS}
    Edit Profile
    Change Everything
    [Teardown]    Close Browser

0201 - Change User First Name
    Straight To View Profile    ${USERNAME}    ${OLD PASS}
    Edit Profile
    First Name    ${FNAME}
    Enter
    Sleep             1
    [Teardown]    Close Browser

0202 - Change User Last Name
    Straight To View Profile    ${USERNAME}    ${OLD PASS}
    Edit Profile
    Last Name    ${LNAME}
    Enter
    Sleep             1
    [Teardown]    Close Browser 

0203 - Change User Email
    Straight To View Profile    ${USERNAME}    ${OLD PASS}
    Edit Profile
    Email    ${EMAIL}
    Enter
    Sleep             1
    [Teardown]    Close Browser 

0204 - Change User Contact Number
    Straight To View Profile    ${USERNAME}    ${OLD PASS}
    Edit Profile
    Contact Number    ${CONTACT}
    Enter
    Sleep             1
    [Teardown]    Close Browser 

0205 - Change Password And Login
    Straight To View Profile    ${USERNAME}    ${OLD PASS}
    Password   ${CHANGE PASS}
    Sign-out
    Input Username    ${USERNAME} 
    Input Password    ${CHANGE PASS}
    Submit Credentials
    Check Homepage
    [Teardown]    Close Browser 

