class UserItem {
    constructor(username, followerCount, followingCount, args) {
        // check if required arguments were provided
        var props = ['username', 'followerCount', 'followCount'];
        for (var i = 0; i < arguments.length; i++) {
            if (typeof(arguments[i] == 'undefined')) {
                throw 'UserItem constructor did not receive ' + props[i];
            }
        }

        // set required keys
        for (var i = 0; i < props.length; i++) {
            this[props[i]] = arguments[i];
        }
    }
}