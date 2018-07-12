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

countRows = function(pool, query, callback) {
    pool.query(query,  (err, rows) => {
        if(err) console.log(err);
        else callback(rows[0]['COUNT(*)']);
    })
}

// Checks if the list is on the last page
checkLastPage = function(pool, start, numRows, callback, where) {
    if(where)
        query = 'SELECT COUNT(*) FROM articles WHERE '+ where.field + ' LIKE '+ where.value+';';
    else
        query ='SELECT COUNT(*) FROM articles;';

    countRows(pool, query, (num) => {
        if(parseInt(start) + parseInt(numRows) >= num)
            callback(true);
        else
            callback(false);
    })
}

/*
Displays the rows of the database.
Optional 'where' parameter is used to specify a search query
*/
exports.display = function(pool, session, query, callback, where) {
    let pageNum = 0;
    let start;
    let last = false;
    let SQLquery = 'SELECT * FROM articles';

    // numRows changes
    if(query.numRows)
        session.numRows = query.numRows;
    // page number changes
    if(query.page)
        pageNum = query.page - 1;
    // Order change
    if(query.order){
        // Toggle reverse
        if(query.order == session.order)
            session.reverse = !session.reverse;
        else{
            session.order = query.order;
            session.reverse = false;
        }
    }
    // Add WHERE
    if(where)
        SQLquery += ' ' + where;
    // Add ORDER
    if(session.order){
        if(!session.reverse)
            SQLquery += ' ORDER BY ' + session.order;
        else
            SQLquery += ' ORDER BY ' + session.order + ' DESC';
    }
    // Add LIMIT
    // Limit has to be at end of SQL query
    if(session.numRows && session.numRows != 'all'){
        start = pageNum * session.numRows;
        SQLquery += ' LIMIT ' + start + ',' + session.numRows;
        checkLastPage(pool, start, session.numRows, (result) => {last = result});
    } else last = true;

    pool.query(SQLquery + ';', (err, rows) => {
        if(err) console.log(err);
        else{
            callback(rows, pageNum, last);
        }
    })
}