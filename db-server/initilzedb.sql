CREATE DATABASE articles;
USE articles;
CREATE TABLE articles (
    id INT NOT NULL AUTO_INCREMENT, 
    title TEXT, 
    author TEXT, 
    body TEXT, 
    PRIMARY KEY (id)
);

CREATE DATABASE users;
USE users;
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT, 
    username TEXT, 
    pass TEXT, 
    PRIMARY KEY (id)
);
INSERT INTO users (username, pass) VALUES ("admin", "password");