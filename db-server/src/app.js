const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

const pool = mysql.createPool({
    host: 'localhost',
    user: 'john',
    password: 'jokerbrehm',
    database: 'articles'
});

app.get('/', (req, res) => {
    let query = 'SELECT * FROM articles';
    pool.query(query, (err, rows, fields) => {
        if(err) throw err;
        else{
            res.render('list', {
                articles: rows,
            });
        }
    })
});

app.get('/add', (req, res) => {
    res.render('add');
})

app.post('/add', (req, res) => {
    pool.query('INSERT INTO articles (title, author, body) VALUES (?,?,?)', [req.body.title, req.body.author, req.body.body], console.log('Adding article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.get('/search', (req, res) => {
    res.render('search');
})

app.post('/search' , (req, res) => {
    let query = 'SELECT * FROM articles WHERE '+req.body.field+' LIKE \'%'+req.body.value+'%\';';
    pool.query(query, (err, rows, fields) => {
        if(err) throw err;
        else{
            res.render('list', {
                articles: rows
            });
        }
    })
})

app.get('/view', (req, res) => {
    pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows, fields) => {
        res.render('view', {
            row: rows
        });
    });
})

app.get('/edit', (req, res) => {
    pool.query('SELECT * FROM articles WHERE id = ' + req.query.id, (err, rows, fields) => {
        res.render('edit', {
            row: rows
        });
    });
})

app.post('/edit', (req, res) => {
    console.log(req.body.id + ' ' + req.body.title + ' ' + req.body.author);
    pool.query('UPDATE articles SET title=?, author=?, body=? WHERE id='+req.body.id, [req.body.title, req.body.author, req.body.body], console.log('Updating article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.post('/delete', (req, res) => {
    pool.query('DELETE FROM articles WHERE id = ' + req.body.id, console.log('Deleting article'));
    setTimeout(() => res.redirect('/'), 1000);
})

app.listen(3000, () => {
    console.log('Started server on port 3000');
})