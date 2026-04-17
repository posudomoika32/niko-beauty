const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Статические файлы (CSS, JS и т.д.)
app.use(express.static(path.join(__dirname)));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'niko_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// MySQL подключение
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2104',
    database: 'niko_beauty'
});

db.connect(err => {
    if (err) {
        console.log('Ошибка подключения к БД:', err);
    } else {
        console.log('MySQL подключена');
    }
});

// ===== ПУБЛИЧНЫЕ ЭНДПОИНТЫ СТРАНИЦ =====

// Прочитаем HTML файл один раз при запуске
const appHtml = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');

// Для всех маршрутов отправляем один index.html
function serveApp(req, res) {
    res.send(appHtml);
}

// Главная страница
app.get('/', serveApp);
app.get('/home', serveApp);
app.get('/login', serveApp);
app.get('/register', serveApp);
app.get('/profile', serveApp);
app.get('/details', serveApp);
app.get('/details/:id', serveApp);

// ===== API ЭНДПОИНТЫ =====

app.post('/register', async (req, res) => {

    const { name, email, password } = req.body;
    // По умолчанию регистрируем как обычного `user`. Если в запросе придёт роль — используем её.
    const role = req.body.role || 'user';

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, role], (err, result) => {

        if (err) {
            return res.status(400).json({ message: "Email уже существует" });
        }

        req.session.user = { id: result.insertId, name, email, role };
        res.json({ message: "Регистрация успешна", name, role });
    });
});

// ВХОД

app.post('/login', (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (results.length === 0) {
            return res.status(400).json({ message: "Пользователь не найден" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: "Неверный пароль" });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
        };

        res.json({ message: "Вход выполнен", name: user.name, role: user.role || 'user' });
    });
});

// ПРОВЕРКА СЕССИИ

app.get('/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: "Не авторизован" });
    }
});

// Middleware проверки роли
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session.user) return res.status(401).json({ message: 'Не авторизован' });
        const userRole = req.session.user.role;
        const allowed = Array.isArray(roles) ? roles : [roles];
        if (allowed.includes(userRole)) return next();
        return res.status(403).json({ message: 'Доступ запрещён' });
    };
}

// Пример админ-маршрута — можно расширять под админ-функции
app.get('/admin/data', requireRole('admin'), (req, res) => {
    res.json({ secret: 'это данные только для админа', user: req.session.user });
});

// Пример маршрута для обычных пользователей (и админов тоже)
app.get('/user/data', requireRole(['user', 'admin']), (req, res) => {
    res.json({ info: 'данные для зарег. пользователя', user: req.session.user });
});

// ВЫХОД

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: "Выход выполнен" });
});

app.listen(3000, () => {
    console.log("Сервер запущен на http://localhost:3000");
});
