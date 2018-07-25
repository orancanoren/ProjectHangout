class UserItem {
    constructor(username, friendCount, args) {
        // check if required arguments were provided
        var props = ['username', 'friendCount'];
        for (var i = 0; i < arguments.length; i++) {
            if (typeof(arguments[i] == 'undefined')) {
                throw 'UserItem constructor did not receive ' + props[i];
            }
        }

        // set required keys
        for (var i = 0; i < props.length; i++) {
            this[props[i]] = arguments[i];
        }

        // set extra keys in `args`
        if (args) {
            extraKeys = Object.keys(args)
            for (var i = 0; i < extraKeys.length; i++) {
                this[extraKeys[i]] = args[extraKeys[i]];
            }
        }
    }
}