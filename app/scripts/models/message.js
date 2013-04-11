App.Message = Ember.Object.extend({
    is: function(message_type) {
        return this.get('message_type') == message_type;
    },

    isImage: function() {
        return this.is('image');
    }.property('message_type'),

    isLog: function() {
        return this.is('log');
    }.property('message_type'),

    timestampString: function() {
        var date = new Date(Date.parse(this.get('timestamp')));
        return date.toLocaleString();
    }.property('timestamp'),

    // TODO: build message specific views that encapsulate this.
    bodyUrlWithAccessToken: function() {
        if (!this.get('body') || !this.get('body.url')) return null;

        return this.get('body.url') + "?access_token=" + encodeURIComponent(App.session.accessToken.token);
    }.property('body.url')
});

App.Message.reopenClass({
    find: function(query) {
        return App.findWithAdapter(query, magenta.Message, App.Message);
    }
});