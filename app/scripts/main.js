App = Ember.Application.create({
    rootElement: window.TESTING ? '#mocha' : '#app',
    LOG_TRANSITIONS: true
});

// We need to delay routing until we have a session setup (or fail).
App.deferReadiness();

// Enable Twitter Bootstrap radio buttons
$('.nav-tabs').button();

// We try to find the headwaiter at the same host, port, and protocol this was served from by default.

App.config = {
    host: 'api.nitrogen.io',
    http_port: 80,
    protocol: 'http'
};

App.config.store = new nitrogen.HTML5Store(App.config);
App.service = new nitrogen.Service(App.config);

// define function that we can use to jumpstart a user session.

App.resetSession = function(err) {
    if (App.get('session')) {
        App.get('session').close();
    }

    App.set('flash', err);
    App.set('session', null);
    App.set('user', null);

    App.advanceReadiness();

    // TODO: what's the right way to do this outside of an ember.js controller?
    if (window.location.hash != "#/user/login" && window.location.hash != "#/user/create")
        window.location = "#/user/login";
};

App.sessionHandler = function(err, session, user) {
    if (err || !session || !user) return App.resetSession(err);

    App.set('err', null);

    // TODO: what's the right way to transition outside of a router in ember.js?
    if (window.location.hash == "#/user/login" || window.location.hash == "#/user/create") {
        window.location = "#/messages";
    }

    App.advanceReadiness();

    // save away the session for use in the ember application.
    App.set('session', session);
    App.set('user', App.Principal.create(user));

    session.onAuthFailure(App.resetSession);

    session.onMessage(function(nitrogenMessage) {
        console.log("message received: " + JSON.stringify(nitrogenMessage));
        var message = App.Message.create(nitrogenMessage);

        Ember.Instrumentation.instrument('onMessage', message);
    });
};

// attempt to start session from the cached access token in local storage.
// if the user doesn't exist or the access token is expired -> direct to login.

var user = new nitrogen.User({ nickname: "current" });
App.service.resume(user, App.sessionHandler);
