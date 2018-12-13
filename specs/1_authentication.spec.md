# Tests 1: Authentication

## Scenario 1.0: Publisher Authentication (iOS and Android)

You will need a server set up with authentication before testing.
https://www.red5pro.com/docs/server/authplugin.html

### Steps

1. Launch the react native app.
2. Enter the Host, License and Stream Name values
3. Tap on Use Authentication
4. In the revealed input fields, enter in the username and password setup for the Server with authentication enabled.
5. Click Publish

### Expected Result

Connection is successful and a publishing session starts.

## Scenario 1.1: Subscriber Authentication (iOS and Android)

You will need a server set up with authentication before testing.
https://www.red5pro.com/docs/server/authplugin.html

### Steps

1. Start a Broadcast session with another device on the target sever with a given stream name.
2. Launch the react native app.
3. Enter the Host, License and Stream Name values
4. Tap on Use Authentication
5. In the revealed input fields, enter in the username and password setup for the Server with authentication enabled.
6. Click Subscribe

### Expected Result

Connection is successful and a subscribing session starts.
