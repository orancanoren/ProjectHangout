var Token = {}

Token.tokens = {} // tokens are stored in memory

Token.consume = function(token, callback) {
    var user_email = this.tokens[token];

    // invalidate single use token
    delete this.tokens[token];
    return callback(null, user_email);
}

Token.save = function(token, user_email, callback) {
    this.tokens[token] = user_email;
    return callback();
}

Token.issue = function(user_email, done) {
    var token = this.randomString(64);
    this.save(token, user_email, () => {
        return done(null, token);
    });
}

Token.randomString = function(len) {
	var buf = []
	, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	, charlen = chars.length;
  
	for (var i = 0; i < len; ++i) {
		buf.push(chars[this.rand_int(0, charlen - 1)]);
	}

	return buf.join('');
  };

  Token.rand_int = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = Token;