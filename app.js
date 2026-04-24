const API_URL = "http://localhost:3000";

let servicesShowcaseGroups = [];
let detailSections = [];
let servicesById = new Map();
let serviceGroupById = new Map();
let detailSectionsById = new Map();

function rebuildServiceIndexes() {
    servicesById = new Map(
        servicesShowcaseGroups.flatMap((group) => group.cards.map((card) => [card.id, card]))
    );

    serviceGroupById = new Map(
        servicesShowcaseGroups.flatMap((group) => group.cards.map((card) => [card.id, group.id]))
    );

    detailSectionsById = new Map(detailSections.map((section) => [section.id, section]));
}

function applyServiceRows(rows) {
    const sortedRows = [...rows].sort((a, b) => {
        const orderDiff = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        return orderDiff || String(a.id).localeCompare(String(b.id));
    });

    const groupsMap = new Map();
    const nextDetailSections = [];

    sortedRows.forEach((row) => {
        if (!groupsMap.has(row.groupId)) {
            groupsMap.set(row.groupId, {
                id: row.groupId,
                label: row.groupLabel,
                cards: []
            });
        }

        groupsMap.get(row.groupId).cards.push({
            id: row.id,
            title: row.cardTitle || row.title,
            imageUrl: row.imageUrl || ""
        });

        nextDetailSections.push({
            id: row.id,
            title: row.title,
            text: row.description
        });
    });

    if (!groupsMap.size || !nextDetailSections.length) {
        return;
    }

    servicesShowcaseGroups = Array.from(groupsMap.values());
    detailSections = nextDetailSections;
    rebuildServiceIndexes();
}

async function loadServicesFromApi() {
    try {
        const res = await fetch(`${API_URL}/api/services`);
        if (!res.ok) {
            throw new Error(`Failed to load services: ${res.status}`);
        }

        const rows = await res.json();
        if (Array.isArray(rows) && rows.length) {
            applyServiceRows(rows);
        }
    } catch (error) {
        console.log("Не удалось загрузить услуги из БД, используется локальный список.", error);
    }
}

rebuildServiceIndexes();

function getServiceHref(serviceId) {
    return `#/details/${serviceId}`;
}

function getDefaultServiceId() {
    return servicesShowcaseGroups[1]?.cards[0]?.id || servicesShowcaseGroups[0]?.cards[0]?.id || null;
}

function getGroupFirstServiceId(groupId) {
    const group = servicesShowcaseGroups.find((item) => item.id === groupId);
    return group?.cards[0]?.id || getDefaultServiceId();
}

function getServiceMediaStyle(imageUrl) {
    if (!imageUrl) {
        return "";
    }

    const safeUrl = String(imageUrl)
        .replace(/'/g, "%27")
        .replace(/"/g, "&quot;");
    return ` style="background-image: url('${safeUrl}');"`;
}

function renderAuthButtons() {
    return `
        <div class="auth-buttons">
            <a href="#/login" class="btn outline small">Вход</a>
            <a href="#/register" class="btn primary small">Регистрация</a>
        </div>
    `;
}

function renderHeader({ menuItems = [], showAuthButtons = false }) {
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

function renderUnifiedServicesBlock(options = {}) {
    const {
        sectionId = "services",
        title = "Услуги",
        titleTag = "h2",
        wrapperClass = "services-unified",
        innerClass = "services-unified__inner"
    } = options;

    const titleMarkup = `<${titleTag} class="services-showcase__title services-showcase__title--compact">${title}</${titleTag}>`;

    return `
        <section id="${sectionId}" class="section services ${wrapperClass}">
            <div class="${innerClass}">
                ${titleMarkup}
                <div class="services-showcase__tabs" role="tablist" aria-label="Категории услуг" data-services-scope="${sectionId}">
                    ${renderServicesShowcaseTabs(sectionId)}
                </div>
                <div class="services-showcase__content">
                    ${renderServicesShowcaseCards(sectionId)}
                </div>
            </div>
        </section>
    `;
}

function renderServicesShowcaseTabs(scopeId) {
    return servicesShowcaseGroups
        .map((group, index) => {
            const isActive = index === 0;
            return `
                <button
                    class="services-category${isActive ? " active" : ""}"
                    type="button"
                    data-services-scope-tab="${scopeId}"
                    data-services-group="${group.id}"
                >
                    ${group.label}
                </button>
            `;
        })
        .join("");
}

function renderServicesShowcaseCards(scopeId) {
    return servicesShowcaseGroups
        .map((group, index) => {
            const isActive = index === 0;
            const cardsMarkup = group.cards
                .map(
                    (card) => `
                        <a class="service-showcase-card" href="${getServiceHref(card.id)}" data-service-id="${card.id}"${getServiceMediaStyle(card.imageUrl)}>
                            <div class="service-showcase-card__content">
                                <h3>${card.title}</h3>
                                <span class="service-showcase-card__icon">+</span>
                            </div>
                        </a>
                    `
                )
                .join("");

            return `
                <div
                    class="service-showcase-group"
                    ${isActive ? "" : "hidden"}
                    data-services-scope-group="${scopeId}"
                    data-services-cards="${group.id}"
                >
                    <div class="service-showcase-grid">
                        ${cardsMarkup}
                    </div>
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

function renderDetailsCategoryTabs(activeGroupId) {
    return servicesShowcaseGroups
        .map((group) => {
            const isActive = group.id === activeGroupId;
            return `
                <a
                    class="services-category${isActive ? " active" : ""}"
                    href="${getServiceHref(getGroupFirstServiceId(group.id))}"
                >
                    ${group.label}
                </a>
            `;
        })
        .join("");
}

function renderDetailsAccordion(activeServiceId) {
    const activeGroupId = serviceGroupById.get(activeServiceId) || servicesShowcaseGroups[0]?.id;
    const activeGroup = servicesShowcaseGroups.find((group) => group.id === activeGroupId);

    if (!activeGroup) {
        return "";
    }

    return activeGroup.cards
        .map((card) => {
            const section = detailSectionsById.get(card.id);
            const isActive = card.id === activeServiceId;
            const preview = section?.text || "Описание услуги скоро появится.";

            return `
                <article class="service-detail-item${isActive ? " active" : ""}">
                    <button
                        class="service-detail-item__toggle"
                        type="button"
                        data-detail-service="${card.id}"
                        aria-expanded="${isActive ? "true" : "false"}"
                    >
                        <div class="service-detail-item__heading">
                            <h2>${card.title}</h2>
                            <p>${preview}</p>
                        </div>
                        <span class="service-detail-item__icon">${isActive ? "−" : "+"}</span>
                    </button>
                    <div class="service-detail-item__body">
                        <div class="service-detail-item__media"${getServiceMediaStyle(card.imageUrl)}></div>
                        <div class="service-detail-item__content">
                            <p>${preview}</p>
                            <a class="btn primary service-detail-item__action" href="#/services-page">Выбрать эту услугу</a>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");
}

function renderDetailsPageContent(activeServiceId) {
    const currentServiceId = servicesById.has(activeServiceId) ? activeServiceId : getDefaultServiceId();
    const activeGroupId = serviceGroupById.get(currentServiceId) || servicesShowcaseGroups[0]?.id;
    const activeCard = servicesById.get(currentServiceId);

    return `
        <div class="service-detail-page">
            <div class="services-showcase__tabs services-showcase__tabs--details" role="tablist" aria-label="Категории услуг">
                ${renderDetailsCategoryTabs(activeGroupId)}
            </div>
            <div class="service-detail-page__intro">
                <p class="service-detail-page__eyebrow">Подробности услуги</p>
                <h1 class="services-showcase__title services-showcase__title--compact">${activeCard?.title || "Услуга"}</h1>
            </div>
            <div class="service-detail-page__accordion">
                ${renderDetailsAccordion(currentServiceId)}
            </div>
        </div>
    `;
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
                    { href: "#/services-page", label: "Услуги" },
                    { href: "#/home/contacts", label: "Контакты" }
                ],
                showAuthButtons: true
            })}

            <section class="hero">
                <div class="hero-content">
                    <h1>Студия красоты</h1>
                    <p>Для гедонистов и ценителей прекрасного</p>

                    <div class="hero-buttons">
                        <a href="#/services-page" class="btn primary">Выбрать услугу</a>
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

            ${renderUnifiedServicesBlock({
                sectionId: "services",
                title: "НАШИ УСЛУГИ",
                titleTag: "h2",
                wrapperClass: "services-unified services-unified--home",
                innerClass: "services-showcase__inner services-showcase__inner--home"
            })}

            <section id="contacts" class="section contacts">
                <div class="container">
                    <h2 class="section-title">Контакты</h2>
                    <p>г. Брест, улица Московская, 444, кабинет 10</p>
                    <p>Телефон: +375 33 653 25 92</p>
                    <a href="https://www.instagram.com/nikrrwq?igsh=cWRveDRwOHJudzJ2">Instagram: @nikobeauty</a>

                    <p class="section-title">
                        <a href="#/services-page" class="btn primary">Выбрать услугу</a>
                    </p>
                </div>
            </section>

            <footer class="footer">
                © 2026 Niko Beauty
            </footer>
        </div>

        <div id="services-page" class="page">
            ${renderHeader({
                menuItems: [
                    { href: "#/home", label: "На главную" },
                    { href: "#/services-page", label: "Услуги" },
                    { href: "#/home/contacts", label: "Контакты" }
                ],
                showAuthButtons: true
            })}

            <main class="services-showcase">
                <div class="services-showcase__inner">
                    <h1 class="services-showcase__title">НАШИ УСЛУГИ</h1>
                    <div class="services-showcase__tabs" role="tablist" aria-label="Категории услуг" data-services-scope="services-page">
                        ${renderServicesShowcaseTabs("services-page")}
                    </div>
                    <div class="services-showcase__content">
                        ${renderServicesShowcaseCards("services-page")}
                    </div>
                </div>
            </main>
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
                <a class="back" href="#/services-page">← Вернуться к услугам</a>
                <div id="detailsContent"></div>
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

let currentPageName = null;

function showPage(pageName = "home", param = null, options = {}) {
    const { scrollToTop = true } = options;

    document.querySelectorAll(".page").forEach((page) => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add("active");
        currentPageName = pageName;

        if (scrollToTop) {
            window.scrollTo(0, 0);
        }

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
    const isDetailsSwitch = currentPageName === "details" && page === "details";

    showPage(page, param, {
        scrollToTop: !isDetailsSwitch
    });

    if (page === "profile") {
        loadProfile();
    }

    if (page === "details") {
        renderDetailsView(param);
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

function setupScopedServiceTabs(scopeId) {
    const tabs = document.querySelectorAll(`[data-services-scope-tab="${scopeId}"]`);
    const groups = document.querySelectorAll(`[data-services-scope-group="${scopeId}"]`);

    if (!tabs.length || !groups.length) {
        return;
    }

    function showGroup(name) {
        groups.forEach((group) => {
            group.hidden = group.dataset.servicesCards !== name;
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => {
                item.classList.toggle("active", item === tab);
            });

            showGroup(tab.dataset.servicesGroup);
        });
    });

    const activeTab = Array.from(tabs).find((tab) => tab.classList.contains("active")) || tabs[0];
    if (activeTab) {
        showGroup(activeTab.dataset.servicesGroup);
    }
}

function renderDetailsView(serviceId) {
    const detailsRoot = document.getElementById("detailsContent");
    if (!detailsRoot) {
        return;
    }

    detailsRoot.innerHTML = renderDetailsPageContent(serviceId);

    detailsRoot.querySelectorAll("[data-detail-service]").forEach((button) => {
        button.addEventListener("click", () => {
            const nextServiceId = button.dataset.detailService;
            if (!nextServiceId || nextServiceId === serviceId) {
                return;
            }

            window.location.hash = `#/details/${nextServiceId}`;
        });
    });

    requestAnimationFrame(() => {
        const activeItem = detailsRoot.querySelector(".service-detail-item.active");
        if (activeItem) {
            activeItem.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadServicesFromApi();
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

    setupScopedServiceTabs("services");
    setupScopedServiceTabs("services-page");
});
