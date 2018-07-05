const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const dblib = require('./dblib');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware for checking login
function requireLogin(req, res, next) {
    if(req.session.user)
        return next();
    else{
        var err = new Error('You must be logged in to view this page. Go back and Log in');
        err.status = 401;
        return next(err);
    }
}

// express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false
}));

// TODO: Look into if should use pools for each of these.  Maybe only need for one
const article_pool = mysql.createPool({
    host: 'localhost',
    user: 'serveruser',
    password: 'password',
    database: 'articles'
});

const user_pool = mysql.createPool({
    host: 'localhost',
    user: 'serveruser',
    password: 'password',
    database: 'users'
});

// TODO sort by column
// TODO clean up.  extract functions
app.get('/', (req, res) => {
    let pageNum = 0;
    let start;
    let query;
    let last = false;

    // If numRows changes set session
    if(req.query.numRows)
        req.session.numRows = req.query.numRows;
    // If page number changes
    if(req.query.page)
        pageNum = req.query.page - 1;

    if(req.session.numRows && req.session.numRows != 'all'){
        start = pageNum * req.session.numRows;
        query = 'SELECT * FROM articles LIMIT ' + start + ',' + req.session.numRows + ';';
        dblib.checkLastPage(article_pool, start, req.session.numRows, (result) => {last = result});
    } else {
        query = 'SELECT * FROM articles;';
        last = true;
    }

    article_pool.query(query, (err, rows) => {
        if(err) console.log(err);
        else{
            res.render('list', {
                articles: rows,
                user: req.session.user,
                page: pageNum + 1,
                last: last
            });
        }
    }) 
});

app.get('/register', requireLogin, (req, res) => {
    res.render('register', {
        user: req.session.user,
        existing: false
    });
})

app.post('/register', requireLogin, (req, res) => {
    let userData = {
        username: req.body.username, 
        pass: req.body.pass
    };

    // Check for existing user if yues then render register with existing user true
    let query = 'SELECT * FROM users WHERE username LIKE \'%'+req.body.username+'%\';';
    user_pool.query(query, (err, rows) => {
        // if error
        if(err) console.log(err);
        // else if user exists rerender register with error 
        else if(rows.length > 0){
            res.render('register', {
                user: req.session.user,
                existing: true
            });
        }
        // else add user
        else{
            dblib.addUser(user_pool, userData.username, userData.pass);
            res.redirect('/');
        }
    })
})

app.get('/login', (req, res) => {
    res.render('login', { user: ''});
})

app.post('/login', (req, res) => {
    dblib.login(user_pool, req.body.username, req.body.pass, (result, data) => {
        if(result){
            console.log('Login successful');
            req.session.user = data;
            res.redirect('/');
        }
        else{
            res.redirect('/login');
        }
    });
})

app.get('/logout', requireLogin, (req, res) => {
    req.session.user = '';
    res.redirect('/login')
})

app.get('/add', requireLogin, (req, res) => {
    res.render('add', {user: req.session.user});
})

app.post('/add', requireLogin, (req, res) => {
    let userData = {
        title: req.body.title, 
        author: req.body.author, 
        body: req.body.body
    }
    article_pool.query('INSERT INTO articles (title, author, body) VALUES (?,?,?)', [userData.title, userData.author, userData.body], console.log('Adding article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.get('/search', (req, res) => {
    res.render('search', {user: req.session.user});
})

// TODO: have only certain amount display at a time.  Don't want to list every one 10, 25, 50, all
// Make search and / paths into fuinxction that can be reused
app.post('/search' , (req, res) => {
    let query = 'SELECT * FROM articles WHERE '+req.body.field+' LIKE \'%'+req.body.value+'%\';';
    article_pool.query(query, (err, rows) => {
        if(err) console.log(err);
        else{
            res.render('list', {
                articles: rows,
                user: req.session.user
            });
        }
    })
})

app.get('/view', (req, res) => {
    article_pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows) => {
        res.render('view', {
            row: rows,
            user: req.session.user
        });
    });
})

app.get('/edit', requireLogin, (req, res) => {
    article_pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows) => {
        res.render('edit', {
            row: rows,
            user: req.session.user
        });
    });
})

app.post('/edit', requireLogin, (req, res) => {
    article_pool.query('UPDATE articles SET title=?, author=?, body=? WHERE id='+req.body.id, [req.body.title, req.body.author, req.body.body], console.log('Updating article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.post('/delete', requireLogin, (req, res) => {
    article_pool.query('DELETE FROM articles WHERE id = ' + req.body.id, console.log('Deleting article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.listen(3000, () => {
    console.log('Started server on port 3000');
})