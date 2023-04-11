***Settings***
Documentation    A test suite to check User Story 3 and 4, User Feedback and User/Host: View Feedback
...              In this test, the user will send feedback to the host from what he has requested. It 
...              be posted in the feedback section, and the host will see it and reply back to the user.
...
Resource         resource.robot

***Keywords***
Login
    [Arguments]    ${username}    ${password}
    Input Username    ${username}
    Input Password    ${password}
    Submit Credentials

# User
Straight To Ongoing Jobs
    [Arguments]    ${username}    ${password}
    Login    ${username}    ${password}
    Click Element     //p[contains(text(),'ONGOING JOBS')]

User Send Feedback
    [Arguments]     ${feedback}
    Click Button    xpath=//button[@class="SendFeedback"]
    Input Text      xpath=//input[@class="Feedback_box"]    ${feedback}
    Click Button    xpath=//button[@class="Enter_Feedback"]
    #Press Keys      None    ENTER
    Reload Page

Sign-out
    Click Element   //p[contains(text(),'(SIGN-OUT)')]

# Host
Straight To Active Jobs
    [Arguments]    ${username}    ${password}
    Login    ${username}    ${password}
    Click Element     //p[contains(text(),'ACTIVE JOBS')]

Host Send Feedback
    [Arguments]     ${feedback}
    Click Button    xpath=//button[@value="640b121dba3df413da2731bc"]
    Input Text      xpath=//input[@class="Feedback_box"]    ${feedback}
    Click Button    xpath=//button[@class="Enter_Feedback_Host"]
    #Press Keys      None    ENTER
    Reload Page

***Test Cases***
0301 - User Sends Feedback
    Open Browser to Login Page
    Straight To Ongoing Jobs    ${USER USERNAME}    ${USER PASSWORD}
    User Send Feedback    ${USER FEEDBACK}
    Sleep    3
    Sign-out
    [Teardown]    Close Browser 

0401 - Host Sends Feedback
    Open Browser to Login Page
    Straight To Active Jobs    ${HOST USERNAME}    ${HOST PASSWORD}
    Host Send Feedback    ${HOST FEEDBACK}
    Sleep    3
    Sign-out
    [Teardown]    Close Browser 
