
~rik


ok == fixed

 ok         issues with the loading page function, move update social request and populate list inside if statement
 ok         registration is no longer possible, when pressing register the page reloads after registration modal is displayed
 ok         social media menu is not present
 ?          log-in from online-player or tournament page now reload the page
 later      remove the unnecessary logs on console

these are issues i found in rik/merge_carlo_unto_frontend... branch, when social media menu works on this branch i can test it further:

ok                  social media buttons need to be pressed twice before they work
new branch          friendships requests are not real time updated, the page needs to be reloaded to show new requests
new branch          same thing is happening for friends list after acceptance
ok                  in chat box is not clearing itself after sending a message
later ~ new branch  there is no notification of new requests or messages
ok                 pressing a chat-list-image no longer close/open the chatbox correctly
ok                  there are some conflicts in the css files or inline styles (check game invitation through chat)
?                   dont show the same message with "join" button in the chat for both user, personalize sender/receiver
                    ++undefined score still




