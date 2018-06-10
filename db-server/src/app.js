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

// mySQL db info
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

// TODO: have only certain amount display at a time.  Don't want to list every one
app.get('/', (req, res) => {
    let query = 'SELECT * FROM articles';
    article_pool.query(query, (err, rows, fields) => {
        if(err) console.log(err);
        else{
            res.render('list', {
                articles: rows,
            });
        }
    })
});

// TODO: add checking for user which already exists
app.get('/register', (req, res) => {
    res.render('register');
})

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
    res.render('login');
})

app.post('/login', (req, res) => {
    //query for requested user
    let query = 'SELECT * FROM users WHERE username LIKE \'%'+req.body.username+'%\';';
    user_pool.query(query, (err, rows, fields) => {
        //console.log(rows[0].username);
        //if error
        if(err) console.log(err);
        //else if user exists check password   
        else if(rows.length > 0){
            user_pool.query('SELECT pass FROM users WHERE username LIKE \'%'+rows[0].username+'%\';', (err, rows, fields) => {
                //console.log(rows[0].pass);
                //if correct password set session and redirect
                bcrypt.compare(req.body.pass, rows[0].pass, function(err, result) {
                    if(result){
                        console.log('Login successful');
                        res.redirect('/');
                    }
                    else{
                        //console.log('Incorect password');
                        res.redirect('/login');
                    }
                })
            });
        }
        else{
            //console.log('Incorect username');
            res.redirect('/login');
        }
    })
})

app.get('/add', (req, res) => {
    res.render('add');
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
    res.render('search');
})

app.post('/search' , (req, res) => {
    let query = 'SELECT * FROM articles WHERE '+req.body.field+' LIKE \'%'+req.body.value+'%\';';
    article_pool.query(query, (err, rows, fields) => {
        if(err) throw err;
        else{
            res.render('list', {
                articles: rows
            });
        }
    })
})

app.get('/view', (req, res) => {
    article_pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows, fields) => {
        res.render('view', {
            row: rows
        });
    });
})

app.get('/edit', (req, res) => {
    article_pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows, fields) => {
        res.render('edit', {
            row: rows
        });
    });
})

app.post('/edit', (req, res) => {
    console.log(req.body.id + ' ' + req.body.title + ' ' + req.body.author);
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