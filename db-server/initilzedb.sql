CREATE DATABASE articles;
USE articles;
CREATE TABLE articles (
    id INT NOT NULL AUTO_INCREMENT, 
    title TEXT, 
    author TEXT, 
    body TEXT, 
    PRIMARY KEY (id)
);