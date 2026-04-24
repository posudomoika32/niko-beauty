const API_URL = "http://localhost:3000";

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
            const authBlock = document.querySelector(".auth-buttons");

            if (authBlock) {
                authBlock.innerHTML = `
                    <div class="user-dropdown">
                        <button class="user-name" onclick="goToPage('profile'); return false;">
                            ${user.name}${user.role === "admin" ? " (Админ)" : ""}
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="dropdown-menu">
                            <a href="#" onclick="goToPage('profile'); return false;">Мой профиль</a>
                            <a href="#" id="logoutBtnMenu">Выйти</a>
                        </div>
                    </div>
                `;

                const logoutBtn = document.getElementById("logoutBtnMenu");
                if (logoutBtn) {
                    logoutBtn.addEventListener("click", logout);
                }
            }
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
        editBtn.addEventListener("click", () => {
            document.getElementById("editName").value = user.name;
            document.getElementById("editEmail").value = user.email;
            document.getElementById("editPassword").value = "";
            message.hidden = true;
            message.textContent = "";
            modal.classList.add("active");
        });
    }

    const closeModal = () => {
        modal.classList.remove("active");
        form.reset();
    };

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    if (form) {
        form.addEventListener("submit", async (e) => {
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
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
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

    (function () {
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
    })();
});
