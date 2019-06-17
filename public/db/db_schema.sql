CREATE TABLE IF NOT EXISTS Users
( 
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL , 
    description TEXT NOT NULL , 
    age INT NOT NULL , 
    password TEXT NOT NULL
);
