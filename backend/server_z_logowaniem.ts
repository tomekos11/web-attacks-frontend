require('dotenv').config();
const express = require('express');
const session = require('express-session');
const sqlite3 = require('better-sqlite3');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

const app = express();
const db = new sqlite3('./database.db');
const PORT = process.env.PORT || 5000;

const cors = require('cors');
app.use(cors()); 

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 * 7 }
}));

// Tworzenie tabel, jeśli nie istnieją
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    userId INTEGER,
    FOREIGN KEY(userId) REFERENCES users(id)
)`).run();

// Rejestracja użytkownika
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Wymagane dane' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hashedPassword);
        res.status(201).json({ message: 'Użytkownik zarejestrowany' });
    } catch (err) {
        res.status(400).json({ message: 'Nazwa użytkownika już istnieje' });
    }
});

// Logowanie użytkownika
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Wymagane dane' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Błędne dane logowania' });
    }

    req.session.userId = user.id;
    res.json({ message: 'Zalogowano pomyślnie' });
});

// Wylogowanie
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ message: 'Wylogowano' });
});

// Pobranie postów
app.get('/posts', (req, res) => {
    const posts = db.prepare('SELECT * FROM posts').all();
    res.json(posts);
});

// Dodanie posta
app.post('/posts', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Nie zalogowano' });

    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Brak tytułu lub treści' });

    db.prepare('INSERT INTO posts (title, content, userId) VALUES (?, ?, ?)')
      .run(title, content, req.session.userId);
    res.status(201).json({ message: 'Post dodany' });
});


// Uruchomienie serwera
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
