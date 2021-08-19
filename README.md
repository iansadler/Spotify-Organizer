# Library Organizer

## Spotify Credentials

You will need to register the app and get your own credentials from the Spotify Developers.

To do so, go to [Spotify for Developers](https://beta.developer.spotify.com/dashboard) and create an app.

After creating the application, edit the applications settings and add the following Redirect URIs:

- http://localhost:3000
- http://localhost:3000/callback

`CLIENT_ID`, and `CLIENT_SECRET` are stored in .env file.

## Running Application

    $ node app.js

Then, open `http://localhost:3000` in a browser.
