App = Ember.Application.create({
    rootElement: window.TESTING ? '#mocha' : '#app',
    LOG_TRANSITIONS: true
});

App.config = {
    host: "localhost",
    http_port: 3030,
    protocol: "http"
};

App.config.store = new magenta.HTML5Store(App.config);
App.service = new magenta.Service(App.config);

// define function that we can use to jumpstart a user session.

App.authFailureHandler = function() {
    if (App.session) {
        App.session.close();
        App.session = null;
    }

    window.location = "/#/user/login";
    console.log("redirecting to login");
};

App.sessionHandler = function(err, session, user) {
    if (err) return App.authFailureHandler();

    // save away the session for use in the ember application.
    App.session = session;
    App.user = user;

    session.onAuthFailure(App.authFailureHandler);

    session.onMessage(function(message) {
        console.log("message received: " + JSON.stringify(message));
        App.store.load(App.Message, message);
    });
};

// attempt to start session from the cached access token in local storage.
// if the user doesn't exist or the access token is expired -> direct to login.

var user = new magenta.User({ local_id: "current" });
App.service.resume(user, App.sessionHandler);