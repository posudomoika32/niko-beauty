const API_URL = "http://localhost:3000";

const serviceGroups = [
    {
        id: "nails",
        title: "Ногтевой сервис",
        cards: [
            { id: "manicure", title: "Маникюр", className: "card-manicure" },
            { id: "pedicure", title: "Педикюр", className: "card-pedicure" },
            { id: "design", title: "Дизайн", className: "card-design" },
            { id: "care", title: "Уход для рук и ног", className: "card-care" }
        ]
    },
    {
        id: "massage",
        title: "Массаж",
        cards: [
            { id: "classic-massage", title: "Классический массаж", className: "card-classic-massage" },
            { id: "relax", title: "Релакс", className: "card-relax" },
            { id: "sports-massage", title: "Спортивный массаж", className: "card-sports-massage" }
        ]
    },
    {
        id: "cosmetology",
        title: "Косметология",
        cards: [
            { id: "face-cleaning", title: "Чистка лица", className: "card-face-cleaning" },
            { id: "peeling", title: "Пилинг", className: "card-peeling" },
            { id: "injections", title: "Инъекции красоты", className: "card-injections" }
        ]
    },
    {
        id: "makeup",
        title: "Макияж",
        cards: [
            { id: "day-makeup", title: "Дневной макияж", className: "card-day-makeup" },
            { id: "evening-makeup", title: "Вечерний макияж", className: "card-evening-makeup" },
            { id: "wedding-makeup", title: "Свадебный образ", className: "card-wedding-makeup" }
        ]
    }
];

const detailSections = [
    {
        id: "manicure",
        title: "Маникюр",
        text: "Описание услуги «Маникюр». Здесь можно разместить текст, цену, длительность и т.д."
    },
    { id: "pedicure", title: "Педикюр", text: "Описание услуги «Педикюр»." },
    { id: "design", title: "Дизайн", text: "Описание услуги «Дизайн»." },
    { id: "care", title: "Уход для рук и ног", text: "Описание ухода." },
    { id: "classic-massage", title: "Классический массаж", text: "Описание классического массажа." },
    { id: "relax", title: "Релакс", text: "Описание релакс-массажа." },
    { id: "sports-massage", title: "Спортивный массаж", text: "Описание спортивного массажа." },
    { id: "face-cleaning", title: "Чистка лица", text: "Описание чистки лица." },
    { id: "peeling", title: "Пилинг", text: "Описание пилинга." },
    { id: "injections", title: "Инъекции красоты", text: "Описание инъекций." },
    { id: "day-makeup", title: "Дневной макияж", text: "Описание дневного макияжа." },
    { id: "evening-makeup", title: "Вечерний макияж", text: "Описание вечернего макияжа." },
    { id: "wedding-makeup", title: "Свадебный образ", text: "Описание свадебного образа." }
];

function renderAuthButtons() {
    return `
        <div class="auth-buttons">
            <a href="#/login" class="btn outline small">Вход</a>
            <a href="#/register" class="btn primary small">Регистрация</a>
        </div>
    `;
}

function renderHeader({ homeLink = "#/home", menuItems = [], showAuthButtons = false }) {
    const menuMarkup = menuItems
        .map((item) => `<li><a href="${item.href}">${item.label}</a></li>`)
        .join("");

    return `
        <header class="header">
            <div class="container nav">
                <div class="logo">NIKO BEAUTY</div>
                <ul class="menu">
                    ${menuMarkup}
                </ul>
                ${showAuthButtons ? renderAuthButtons() : '<div class="auth-buttons"></div>'}
            </div>
        </header>
    `;
}

function renderServiceTabs() {
    return serviceGroups
        .map((group, index) => {
            const isActive = index === 0;
            return `
                <button
                    class="tab${isActive ? " active" : ""}"
                    role="tab"
                    aria-selected="${isActive ? "true" : "false"}"
                    data-tab="${group.id}"
                >
                    ${group.title}
                </button>
            `;
        })
        .join("");
}

function renderServiceCards() {
    return serviceGroups
        .map((group, index) => {
            const cardsMarkup = group.cards
                .map(
                    (card) => `
                        <a class="card-link" href="#/details/${card.id}" title="${card.title} — подробнее">
                            <div class="card ${card.className}">
                                <span>${card.title}</span>
                            </div>
                        </a>
                    `
                )
                .join("");

            return `
                <div class="cards-group" data-group="${group.id}"${index === 0 ? "" : " hidden"}>
                    ${cardsMarkup}
                </div>
            `;
        })
        .join("");
}

function renderDetailsContent() {
    return detailSections
        .map((section, index) => {
            const headingTag = index === 0 ? "h2" : "h3";
            return `
                <${headingTag} id="${section.id}">${section.title}</${headingTag}>
                <p>${section.text}</p>
            `;
        })
        .join("");
}

function renderApp() {
    const appRoot = document.getElementById("app");
    if (!appRoot) {
        return;
    }

    appRoot.innerHTML = `
        <div id="home" class="page active">
            ${renderHeader({
                menuItems: [
                    { href: "#/home/about", label: "О студии" },
                    { href: "#/home/services", label: "Услуги" },
                    { href: "#/home/contacts", label: "Контакты" }
                ],
                showAuthButtons: true
            })}

            <section class="hero">
                <div class="hero-content">
                    <h1>Студия красоты</h1>
                    <p>Для гедонистов и ценителей прекрасного</p>

                    <div class="hero-buttons">
                        <a href="#/register" class="btn primary">Записаться онлайн</a>
                        <button class="btn outline" type="button">Подарочный сертификат</button>
                    </div>
                </div>
            </section>

            <section id="about" class="section about">
                <div class="container about-grid">
                    <div>
                        <h2 class="section-title">О студии</h2>
                        <p>
                            Премиальная студия красоты в Бресте для тех,
                            кто осознанно выбирает быть красивым и получать удовольствие от ухода за собой.
                        </p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250" alt="Интерьер студии красоты">
                </div>
            </section>

            <section id="services" class="section services">
                <div class="container">
                    <h2 class="section-title">Услуги</h2>

                    <div class="tabs" role="tablist" aria-label="Услуги">
                        ${renderServiceTabs()}
                    </div>

                    <div class="cards">
                        ${renderServiceCards()}
                    </div>
                </div>
            </section>

            <section id="contacts" class="section contacts">
                <div class="container">
                    <h2 class="section-title">Контакты</h2>
                    <p>г. Брест, улица Московская, 444, кабинет 10</p>
                    <p>Телефон: +375 33 653 25 92</p>
                    <a href="https://www.instagram.com/nikrrwq?igsh=cWRveDRwOHJudzJ2">Instagram: @nikobeauty</a>

                    <p class="section-title">
                        <a href="#/register" class="btn primary">Записаться онлайн</a>
                    </p>
                </div>
            </section>

            <footer class="footer">
                © 2026 Niko Beauty
            </footer>
        </div>

        <div id="login" class="page auth-page">
            <div class="auth-container">
                <h2>Вход в аккаунт</h2>

                <form id="loginForm" class="auth-form">
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Пароль" required>
                    <button type="submit" class="btn primary">Войти</button>
                </form>

                <p class="auth-switch">
                    Нет аккаунта? <a href="#/register">Зарегистрироваться</a>
                </p>
            </div>
        </div>

        <div id="register" class="page auth-page">
            <div class="auth-container">
                <h2>Создание аккаунта</h2>

                <form id="registerForm" class="auth-form">
                    <input type="text" id="name" placeholder="Имя" required>
                    <input type="email" id="email-reg" placeholder="Email" required>
                    <input type="password" id="password-reg" placeholder="Пароль" required>
                    <button type="submit" class="btn primary">Зарегистрироваться</button>
                </form>

                <p class="auth-switch">
                    Уже есть аккаунт? <a href="#/login">Войти</a>
                </p>
            </div>
        </div>

        <div id="profile" class="page">
            ${renderHeader({
                menuItems: [{ href: "#/home", label: "На главную" }]
            })}

            <main class="profile-container">
                <div class="profile-card">
                    <h2>Личный кабинет</h2>

                    <div class="profile-info">
                        <div class="info-block">
                            <label>Имя:</label>
                            <p id="profileName"></p>
                        </div>
                        <div class="info-block">
                            <label>Email:</label>
                            <p id="profileEmail"></p>
                        </div>
                        <div class="info-block">
                            <label>Статус:</label>
                            <p id="profileRole"></p>
                        </div>
                    </div>

                    <button id="editProfileBtn" class="btn primary">Редактировать профиль</button>
                    <button id="logoutBtnProfile" class="btn outline">Выйти из аккаунта</button>
                    <a href="#/home" class="btn outline profile-home-link">На главную</a>
                </div>
            </main>

            <footer class="footer">
                © 2026 Niko Beauty
            </footer>
        </div>

        <div id="editProfileModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Редактировать профиль</h3>
                    <button class="modal-close" id="closeEditModal">&times;</button>
                </div>

                <form id="editProfileForm" class="edit-profile-form">
                    <div class="form-group">
                        <label for="editName">Имя:</label>
                        <input type="text" id="editName" name="name" required>
                    </div>

                    <div class="form-group">
                        <label for="editEmail">Email:</label>
                        <input type="email" id="editEmail" name="email" required>
                    </div>

                    <div class="form-group">
                        <label for="editPassword">Новый пароль (оставьте пустым, чтобы не менять):</label>
                        <input type="password" id="editPassword" name="password" placeholder="Введите новый пароль">
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn primary">Сохранить изменения</button>
                        <button type="button" class="btn outline" id="cancelEditBtn">Отмена</button>
                    </div>
                </form>

                <div id="editMessage" class="edit-message" hidden></div>
            </div>
        </div>

        <div id="details" class="page">
            ${renderHeader({
                menuItems: [{ href: "#/home", label: "На главную" }]
            })}

            <main class="detail">
                <a class="back" href="#/home">← Вернуться на главную</a>
                ${renderDetailsContent()}
            </main>

            <footer class="footer">
                © 2026 Niko Beauty
            </footer>
        </div>
    `;
}

function parseRoute() {
    const hash = window.location.hash.slice(1);

    if (!hash) {
        return { page: "home", param: null };
    }

    const parts = hash.split("/").filter((part) => part);
    const page = parts[0] || "home";
    const param = parts[1] || null;

    return { page, param };
}

function showPage(pageName = "home", param = null) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add("active");
        window.scrollTo(0, 0);

        if (param) {
            setTimeout(() => {
                const element = document.getElementById(param);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }
}

function handleRoute() {
    const { page, param } = parseRoute();
    showPage(page, param);

    if (page === "profile") {
        loadProfile();
    }
}

function goToPage(pageName, anchor = null) {
    if (anchor) {
        window.location.hash = `#/${pageName}/${anchor}`;
        return;
    }

    window.location.hash = `#/${pageName}`;
}

window.goToPage = goToPage;

async function checkUser() {
    try {
        const res = await fetch(`${API_URL}/me`, {
            credentials: "include"
        });

        if (res.ok) {
            const user = await res.json();
            const authBlocks = document.querySelectorAll(".auth-buttons");
            const adminBadge = user.role === "admin" ? " (Админ)" : "";

            authBlocks.forEach((authBlock) => {
                authBlock.innerHTML = `
                    <div class="user-dropdown">
                        <button class="user-name" onclick="goToPage('profile'); return false;">
                            ${user.name}${adminBadge}
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="dropdown-menu">
                            <a href="#" onclick="goToPage('profile'); return false;">Мой профиль</a>
                            <a href="#" class="logout-trigger">Выйти</a>
                        </div>
                    </div>
                `;
            });

            document.querySelectorAll(".logout-trigger").forEach((button) => {
                button.addEventListener("click", logout);
            });
        }
    } catch (err) {
        console.log("Пользователь не авторизован");
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email-reg").value;
    const password = document.getElementById("password-reg").value;

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        goToPage("home");
        setTimeout(() => checkUser(), 100);
    } else {
        alert(data.message);
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        goToPage("home");
        setTimeout(() => checkUser(), 100);
    } else {
        alert(data.message);
    }
}

async function logout(e) {
    e.preventDefault();

    await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    window.location.hash = "#/home";
    window.location.reload();
}

async function loadProfile() {
    try {
        const res = await fetch(`${API_URL}/me`, {
            credentials: "include"
        });

        if (res.ok) {
            const user = await res.json();
            document.getElementById("profileName").textContent = user.name;
            document.getElementById("profileEmail").textContent = user.email || "Не указано";
            document.getElementById("profileRole").textContent = user.role === "admin" ? "Администратор" : "Пользователь";

            const logoutBtn = document.getElementById("logoutBtnProfile");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", logout);
            }

            setupEditProfileModal(user);
        }
    } catch (err) {
        console.log("Ошибка загрузки профиля");
    }
}

function setupEditProfileModal(user) {
    const editBtn = document.getElementById("editProfileBtn");
    const modal = document.getElementById("editProfileModal");
    const closeBtn = document.getElementById("closeEditModal");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const form = document.getElementById("editProfileForm");
    const message = document.getElementById("editMessage");

    if (editBtn) {
        editBtn.onclick = () => {
            document.getElementById("editName").value = user.name;
            document.getElementById("editEmail").value = user.email;
            document.getElementById("editPassword").value = "";
            message.hidden = true;
            message.textContent = "";
            message.className = "edit-message";
            modal.classList.add("active");
        };
    }

    const closeModal = () => {
        modal.classList.remove("active");
        form.reset();
    };

    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }

    if (cancelBtn) {
        cancelBtn.onclick = closeModal;
    }

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();

            const name = document.getElementById("editName").value;
            const email = document.getElementById("editEmail").value;
            const password = document.getElementById("editPassword").value;

            try {
                const res = await fetch(`${API_URL}/update-profile`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        name,
                        email,
                        password: password || null
                    })
                });

                const data = await res.json();

                message.hidden = false;

                if (res.ok) {
                    message.className = "edit-message success";
                    message.textContent = "Профиль успешно обновлен!";
                    document.getElementById("profileName").textContent = name;
                    document.getElementById("profileEmail").textContent = email;

                    setTimeout(() => {
                        closeModal();
                    }, 1500);
                } else {
                    message.className = "edit-message error";
                    message.textContent = data.message || "Ошибка при обновлении профиля";
                }
            } catch (err) {
                console.log("Ошибка:", err);
                message.hidden = false;
                message.className = "edit-message error";
                message.textContent = "Ошибка сервера";
            }
        };
    }
}

function setupServiceTabs() {
    const tabs = document.querySelectorAll("#services .tab");
    const groups = document.querySelectorAll("#services .cards-group");

    function showGroup(name) {
        groups.forEach((group) => {
            group.hidden = group.dataset.group !== name;
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => {
                const isActive = item === tab;
                item.classList.toggle("active", isActive);
                item.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            showGroup(tab.dataset.tab);
        });
    });

    const active = document.querySelector("#services .tab.active") || tabs[0];
    if (active) {
        showGroup(active.dataset.tab);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderApp();
    handleRoute();
    window.addEventListener("hashchange", handleRoute);

    checkUser();

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    setupServiceTabs();
});
