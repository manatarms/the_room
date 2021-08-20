# the_room

This is a puppeteer script that does the following
1. Creates a room
2. Adds people
3. Leaves the room

Things to note:
 This script assumes you log into google chat using Google auth and okta
 You can swap out the auth method for your provider.
 You will need to manually press your hardware key if you have one attached to your account.

IMPORTANT: This script will only work if your Meta key is the Control key. i.e. It will not work on a mac. 
If you want mac support, go upvote https://github.com/puppeteer/puppeteer/issues/1313 

## Getting Started

Run the following

```
yarn
```

## Running 
```
OKTA_EMAIL=$EMAIL OKTA_PASS=$PASS COUNT=50 node the_room.js
```

