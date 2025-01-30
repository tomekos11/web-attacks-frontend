const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const cors = require("cors");
const crypto = require("crypto");
const sqlite3 = require("sqlite3");
const cookieParser = require("cookie-parser");
const { open } = require("sqlite");
const WebSocket = require("ws");
const bcrypt = require("bcryptjs");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:9000",
    credentials: true
}));

let db;

// Inicjalizacja bazy danych
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database
  });

  // Tworzymy tabelę sesji (connect-sqlite3 zrobi to automatycznie, ale możemy się upewnić)
  await db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )`);

  // Tworzymy tabelę postów
  await db.exec(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    userName TEXT,
    userNumber TEXT,
    title TEXT,
    content TEXT,
    createdAt TEXT
  )`);

  // Tworzymy tabelę użytkowników
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    userNumber TEXT,
    role TEXT NOT NULL
  )`);
  
  // Przykład dodania użytkownika administratora (na stałe) - należy to zrobić tylko raz
  const existingAdmin = await db.get("SELECT * FROM users WHERE username = ?", ["admin"]);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("adminpassword", 10); // Hasło administratora
    await db.run(
      "INSERT INTO users (username, password, role, userNumber) VALUES (?, ?, ?, ?)",
      ["admin", hashedPassword, "admin", "1"]
    );
  }
})();


// 🛠 Generowanie losowego imienia
function generateRandomName() {
  return crypto.randomBytes(6).toString("hex"); // 12 znaków losowych
}

// 🛠 Generowanie losowej liczby (1-6)
function generateRandomInteger() {
  return Math.floor(Math.random() * 6) + 1;
}

// 🏗 Konfiguracja sesji z zapisem w bazie
app.use(session({
  store: new SQLiteStore({ db: "database.db", dir: "./" }), // 🛠 Sesje w SQLite
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
  }
}));

// 🛠 Middleware do zarządzania sesją i użytkownikiem
const sessionMiddleware = async (req, res, next) => {
  // Sprawdzenie, czy użytkownik jest zalogowany
  if (req.session.userId) {
    // Pobierz użytkownika z bazy danych na podstawie userId w sesji
    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.session.userId]);

    // Sprawdzenie, czy sesja pasuje do istniejącego użytkownika
    if (!user) {
      console.log('1')
    } else {
      console.log('2');
      console.log(user)
      // Sesja jest poprawna, użytkownik zalogowany
      req.session.userName = user.username;
      req.session.userNumber = user.userNumber;
      req.session.isAdmin = user.role === 'admin'; // Sprawdzenie roli
    }
  } else {
    console.log('3');
    // Jeśli brak userId w sesji (gość)
    req.session.userId = `guest_${Math.random().toString(36).substr(2, 9)}`;
    req.session.userName = generateRandomName();
    req.session.userNumber = generateRandomInteger();
    req.session.isAdmin = false;
  }

  // Ustawianie ciasteczek (opcjonalnie, jeśli chcesz trzymać dane o użytkowniku w ciasteczkach)
  res.cookie('userName', req.session.userName, {
    httpOnly: false,  // Zmienione na false, aby można było sprawdzać w JS, jeśli chcesz
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
  });
  
  res.cookie('userNumber', req.session.userNumber, {
    httpOnly: false,  // Zmienione na false
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
  });

  // Przekazanie do kolejnego middleware lub endpointu
  next();
};

// 🏗 Użycie middleware
app.use(sessionMiddleware);

const adminMiddleware = (req, res, next) => {
  if (req.session.isAdmin) {
    next(); // Użytkownik jest administratorem, przechodzi dalej
  } else {
    res.status(403).json({ error: "Brak uprawnień administratora" });
  }
};

app.get("/check-admin", (req, res) => {
  return res.status(200).json({ message: req.session.isAdmin });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Pobranie użytkownika z bazy danych
  const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);

  // Sprawdzenie, czy użytkownik istnieje oraz czy hasło jest poprawne
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Nieprawidłowe dane logowania" });
  }

  // Ustawianie sesji
  req.session.userId = user.id;
  req.session.userName = user.username;
  req.session.userNumber = user.userNumber;
  req.session.isAdmin = user.role === 'admin'; // Sprawdzanie roli użytkownika

  res.cookie('userName', req.session.userName, {
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
  });
  
  res.cookie('userNumber', req.session.userNumber, {
    httpOnly: false,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dni
  });
  

  res.json({ message: "Zalogowano pomyślnie" });
});

// 📜 Pobieranie postów
app.get("/posts", async (req, res) => {
  const posts = await db.all("SELECT * FROM posts ORDER BY createdAt DESC");
  res.json(posts);
});

// ✍️ Dodawanie nowego posta
app.post("/posts", async (req, res) => {
  if (!req.session.userId) {
    return res.status(403).json({ error: "Brak sesji użytkownika" });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Tytuł i treść są wymagane" });
  }

  const userName = req.session.userName;
  const userNumber = req.session.userNumber;
  const createdAt = new Date().toISOString();

  const result = await db.run(
    "INSERT INTO posts (userId, userName, userNumber, title, content, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
    [req.session.userId, userName, userNumber, title, content, createdAt]
  );

  const postId = result.lastID;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "post_added",
        message: "Nowy post został dodany!",
        title,
        content,
        userName,
        userNumber,
        createdAt,
        id: postId 
      }));
    }
  });

  res.json({ message: "Post dodany!" });
});

app.delete("/posts/:id", adminMiddleware, async (req, res) => {
  const { id } = req.params;

  // Sprawdzamy, czy post istnieje w bazie danych
  const post = await db.get("SELECT * FROM posts WHERE id = ?", [id]);

  if (!post) {
    return res.status(404).json({ error: "Post nie został znaleziony" });
  }

  // Usuwamy post z bazy danych
  await db.run("DELETE FROM posts WHERE id = ?", [id]);

  res.json({ message: "Post został usunięty" });
});

// 🎧 WebSocket server setup
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");
  ws.send(JSON.stringify({ message: "Witaj na WebSocket!" }));
});

// 🚀 Start serwera
app.server = app.listen(5000, () => {
  console.log("Serwer działa na http://localhost:5000");
});

// 🔄 Obsługa WebSocket w tym samym porcie co Express
app.server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
