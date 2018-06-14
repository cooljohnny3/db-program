const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

// express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false
}));

// TODO: Look into if should use pools for wach of these.  Maybe only need for one
const article_pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'articles'
});

const user_pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
});

// TODO: have only certain amount display at a time.  Don't want to list every one 10, 25, 50, all
app.get('/', (req, res) => {
    if(req.session.user){
        let query = 'SELECT * FROM articles';
        article_pool.query(query, (err, rows, fields) => {
            if(err) console.log(err);
            else{
                res.render('list', {
                    articles: rows,
                    user: req.session.user
                });
            }
        }) 
    }
    else{
        res.redirect('/login');
    }
    
});

app.get('/register', (req, res) => {
    if(req.session.user){
        res.render('register', {user: req.session.user});
    }
    else{
        res.redirect('/login');
    }
})

// TODO: add checking for user which already exists
// TODO: Password confirmation check.  Do in page js
app.post('/register', (req, res) => {
    let userData = {
        username: req.body.username, 
        pass: req.body.pass
    }
    bcrypt.hash(userData.pass, 10, function (err, hash){
        if(err) console.log(err);
        else {
            user_pool.query('INSERT INTO users (username, pass) VALUES (?,?)', [userData.username, hash], 
                (err, rows, fields) => {
                    if(err) console.log(err);
                    else{
                        console.log('Adding User');
                        res.redirect('/');
                    }
                });
        }
    })
})

app.get('/login', (req, res) => {
    res.render('login', { user: ''});
})

app.post('/login', (req, res) => {
    //query for requested user
    let query = 'SELECT * FROM users WHERE username LIKE \'%'+req.body.username+'%\';';
    user_pool.query(query, (err, rows, fields) => {
        //if error
        if(err) console.log(err);
        //else if user exists check password   
        else if(rows.length > 0){
            user_pool.query('SELECT * FROM users WHERE username LIKE \'%'+rows[0].username+'%\';', (err, rows, fields) => {
                //if correct password set session and redirect
                bcrypt.compare(req.body.pass, rows[0].pass, function(err, result) {
                    if(result){
                        console.log('Login successful');
                        req.session.user = rows[0];
                        res.redirect('/');
                    }
                    else{
                        res.redirect('/login');
                    }
                })
            });
        }
        else{
            res.redirect('/login');
        }
    })
})

app.get('/logout', (req, res) => {
    req.session.user = '';
    res.redirect('/login')
})

app.get('/add', (req, res) => {
    if(req.session.user){
        res.render('add', {user: req.session.user});
    }
    else{
        res.redirect('/login');
    }
})

app.post('/add', (req, res) => {
    let userData = {
        title: req.body.title, 
        author: req.body.author, 
        body: req.body.body
    }
    article_pool.query('INSERT INTO articles (title, author, body) VALUES (?,?,?)', [userData.title, userData.author, userData.body], console.log('Adding article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.get('/search', (req, res) => {
    if(req.session.user){
        res.render('search', {user: req.session.user});
    }
    else{
        res.redirect('/login');
    }
})

// TODO: have only certain amount display at a time.  Don't want to list every one 10, 25, 50, all
app.post('/search' , (req, res) => {
    let query = 'SELECT * FROM articles WHERE '+req.body.field+' LIKE \'%'+req.body.value+'%\';';
    article_pool.query(query, (err, rows, fields) => {
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
    article_pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows, fields) => {
        res.render('view', {
            row: rows,
            user: req.session.user
        });
    });
})

app.get('/edit', (req, res) => {
    article_pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows, fields) => {
        res.render('edit', {
            row: rows,
            user: req.session.user
        });
    });
})

app.post('/edit', (req, res) => {
    //console.log(req.body.id + ' ' + req.body.title + ' ' + req.body.author);
    article_pool.query('UPDATE articles SET title=?, author=?, body=? WHERE id='+req.body.id, [req.body.title, req.body.author, req.body.body], console.log('Updating article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.post('/delete', (req, res) => {
    article_pool.query('DELETE FROM articles WHERE id = ' + req.body.id, console.log('Deleting article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.listen(3000, () => {
    console.log('Started server on port 3000');
})