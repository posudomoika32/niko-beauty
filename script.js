const API_URL = "http://localhost:3000";

// ПРОВЕРКА АВТОРИЗАЦИИ

async function checkUser() {
    try {
        const res = await fetch(`${API_URL}/me`, {
            credentials: 'include'
        });

        if (res.ok) {
            const user = await res.json();

            const authBlock = document.querySelector('.auth-buttons');

            if (authBlock) {
                authBlock.innerHTML = `
                    <div class="user-dropdown">
                        <span class="user-name">${user.name}${user.role === 'admin' ? ' (Админ)' : ''}</span>
                        <div class="dropdown-menu">
                            ${user.role === 'admin' ? '<a href="/admin" id="adminPanel">Админ панель</a>' : ''}
                            <a href="#" id="logoutBtn">Выйти</a>
                        </div>
                    </div>
                `;

                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) logoutBtn.addEventListener('click', logout);

                const adminLink = document.getElementById('adminPanel');
                if (adminLink) {
                    // пример обработки перехода в админ-панель — можно заменить на реальную страницу
                    adminLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.href = '/admin';
                    });
                }
            }
        }
    } catch (err) {
        console.log("Пользователь не авторизован");
    }
}

// РЕГИСТРАЦИЯ

async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        window.location.href = "app.html";
    } else {
        alert(data.message);
    }
}

// ВХОД

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        window.location.href = "index.html";
    } else {
        alert(data.message);
    }
}

// ВЫХОД

async function logout(e) {
    e.preventDefault();

    await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    location.reload();
}

// АВТОПОДКЛЮЧЕНИЕ ФОРМ

document.addEventListener("DOMContentLoaded", () => {

    checkUser();

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // script.js — переключение табов
(function(){
  const tabs = document.querySelectorAll('#services .tab');
  const groups = document.querySelectorAll('#services .cards-group');

  function showGroup(name){
    groups.forEach(g => {
      g.hidden = g.dataset.group !== name;
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        const isActive = t === tab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      showGroup(tab.dataset.tab);
    });
  });

  // Инициализация: показать активную вкладку при загрузке
  const active = document.querySelector('#services .tab.active') || tabs[0];
  if(active) showGroup(active.dataset.tab);
})();

});
