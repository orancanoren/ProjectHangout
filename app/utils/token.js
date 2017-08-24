var Token = {}

Token.tokens = {}

Token.consumeRememberMeToken = function(token, callback) {
    var user_email = tokens[token];

    // invalidate single use token
    delete this.tokens[token];
    return callback(null, user_email);
}

Token.saveRememberMeToken = function(token, user_email, callback) {
    this.tokens[token] = user_email;
    return callback();
}

Token.issueToken = function(user, done) {
    var token = this.randomString(64);
    this.saveRememberMeToken(token, user.email, (err) => {
        if (err) return done(err);
        return done(null, token);
    })
}

Token.randomString = function(len) {
	var buf = []
	, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	, charlen = chars.length;
  
	for (var i = 0; i < len; ++i) {
		buf.push(chars[this.getRandomInt(0, charlen - 1)]);
	}

	return buf.join('');
  };

  Token.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = Token;