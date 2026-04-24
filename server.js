const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'niko_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'niko_beauty'
});

const dbPromise = db.promise();
const appHtml = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');

function serveApp(req, res) {
    res.send(appHtml);
}

function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Не авторизован' });
        }

        const allowed = Array.isArray(roles) ? roles : [roles];
        if (allowed.includes(req.session.user.role)) {
            return next();
        }

        return res.status(403).json({ message: 'Доступ запрещен' });
    };
}

async function ensureServicesSchema() {
    await dbPromise.query(`
        CREATE TABLE IF NOT EXISTS services (
            id VARCHAR(64) PRIMARY KEY,
            group_id VARCHAR(64) NOT NULL,
            group_label VARCHAR(128) NOT NULL,
            card_title VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL,
            sort_order INT NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_services_group (group_id, sort_order)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    const [cardTitleColumn] = await dbPromise.query("SHOW COLUMNS FROM services LIKE 'card_title'");
    if (!cardTitleColumn.length) {
        await dbPromise.query("ALTER TABLE services ADD COLUMN card_title VARCHAR(255) NOT NULL AFTER group_label");
    }

    const [imageUrlColumn] = await dbPromise.query("SHOW COLUMNS FROM services LIKE 'image_url'");
    if (!imageUrlColumn.length) {
        await dbPromise.query("ALTER TABLE services ADD COLUMN image_url TEXT NOT NULL AFTER description");
    }

    const [classNameColumn] = await dbPromise.query("SHOW COLUMNS FROM services LIKE 'class_name'");
    if (classNameColumn.length) {
        await dbPromise.query("ALTER TABLE services MODIFY class_name VARCHAR(128) NULL");
    }
}

db.connect(async (err) => {
    if (err) {
        console.log('Ошибка подключения к БД:', err);
        return;
    }

    console.log('MySQL connected');

    try {
        await ensureServicesSchema();
        console.log('Services schema is ready');
    } catch (schemaError) {
        console.log('Services schema initialization failed:', schemaError);
    }
});

app.get('/', serveApp);
app.get('/home', serveApp);
app.get('/login', serveApp);
app.get('/register', serveApp);
app.get('/profile', serveApp);
app.get('/details', serveApp);
app.get('/details/:id', serveApp);

app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await dbPromise.query(`
            SELECT
                id,
                group_id AS groupId,
                group_label AS groupLabel,
                card_title AS cardTitle,
                title,
                description,
                image_url AS imageUrl,
                sort_order AS sortOrder
            FROM services
            ORDER BY sort_order ASC, id ASC
        `);

        res.json(rows);
    } catch (error) {
        console.log('Ошибка загрузки услуг:', error);
        res.status(500).json({ message: 'Не удалось загрузить услуги' });
    }
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const role = req.body.role || 'user';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';

        db.query(sql, [name, email, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(400).json({ message: 'Email уже существует' });
            }

            req.session.user = { id: result.insertId, name, email, role };
            res.json({ message: 'Регистрация успешна', name, role });
        });
    } catch (error) {
        console.log('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка сервера' });
        }

        if (!results.length) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user'
        };

        res.json({ message: 'Вход выполнен', name: user.name, role: user.role || 'user' });
    });
});

app.get('/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
        return;
    }

    res.status(401).json({ message: 'Не авторизован' });
});

app.get('/admin/data', requireRole('admin'), (req, res) => {
    res.json({ secret: 'это данные только для админа', user: req.session.user });
});

app.get('/user/data', requireRole(['user', 'admin']), (req, res) => {
    res.json({ info: 'данные для зарегистрированного пользователя', user: req.session.user });
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Выход выполнен' });
    });
});

app.post('/update-profile', requireRole(['user', 'admin']), async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.session.user.id;

    if (!name || !email) {
        return res.status(400).json({ message: 'Имя и email обязательны' });
    }

    try {
        const emailCheckSql = 'SELECT id FROM users WHERE email = ? AND id != ?';

        db.query(emailCheckSql, [email, userId], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Ошибка базы данных' });
            }

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email уже зарегистрирован другим пользователем' });
            }

            if (!password) {
                const updateSql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';

                db.query(updateSql, [name, email, userId], (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ message: 'Ошибка при обновлении профиля' });
                    }

                    req.session.user.name = name;
                    req.session.user.email = email;

                    res.json({ message: 'Профиль успешно обновлен', user: req.session.user });
                });

                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const updateSql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';

            db.query(updateSql, [name, email, hashedPassword, userId], (updateErr) => {
                if (updateErr) {
                    return res.status(500).json({ message: 'Ошибка при обновлении профиля' });
                }

                req.session.user.name = name;
                req.session.user.email = email;

                res.json({ message: 'Профиль успешно обновлен', user: req.session.user });
            });
        });
    } catch (error) {
        console.log('Ошибка при обновлении профиля:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
