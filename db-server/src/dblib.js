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

// Checks if the list is on the last page
exports.checkLastPage = function(pool, start, numRows, callback) {
    pool.query('SELECT COUNT(*) FROM articles;', (err, rows) => {
        if(err) console.log(err);
        else if(parseInt(start) + parseInt(numRows) >= rows[0]['COUNT(*)'])
            callback(true);
        else
            callback(false);
    });
}

// pass1 is entered password and pass2 is encrypted password
comparePass = function(pool, username, pass1, pass2, callback) {
    pool.query('SELECT * FROM users WHERE username LIKE \'%'+username+'%\';', (err, rows) => {
        bcrypt.compare(pass1, pass2, function(err, result) {
            if(result)
                callback(true, rows[0]);
            else
                callback(false);
        })
    });
}

// Logsin the user
exports.login = function(pool, username, password, callback) {
    let query = 'SELECT * FROM users WHERE username LIKE \'%'+username+'%\';';
    pool.query(query, (err, rows, fields) => {
        //if error
        if(err) console.log(err);
        // user exists 
        else if(rows.length > 0){
            comparePass(pool, rows[0].username, password, rows[0].pass, callback);
        }
        else{
            callback(false);
        }
    })
}