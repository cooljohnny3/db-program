const bcrypt = require('bcrypt');

// Adds user to the users database
exports.addUser = function(pool, username, password) {
    bcrypt.hash(password, 10, function (err, hash){
        if(err) console.log(err);
        else {
            pool.query('INSERT INTO users (username, pass) VALUES (?,?)', [username, hash], 
                (err) => {
                    if(err) console.log(err);
                    else{
                        console.log('Adding User');
                    }
                }
            );
        }
    })
}