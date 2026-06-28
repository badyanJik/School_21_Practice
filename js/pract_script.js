const API_BASE = 'https://school21test.strangled.net/api';

async function apiRequest(endpoint, method = 'POST', body = null) {
    try {
        const options = {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json().catch(() => null);
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error('Network error:', error);
        return { ok: false, status: 0, data: { message: 'Ошибка соединения с сервером' } };
    }
}

async function getRequests() {
    const result = await apiRequest('/requests', 'GET');
    if (result.ok) {
        return { success: true, data: result.data.practice_requests || [] };
    } else {
        const message = result.data?.message || 'Ошибка получения заявок';
        return { success: false, message };
    }
}

function getStatusText(statusCode) {
    const map = {
        'pending': 'На рассмотрении',
        'accepted': 'Одобрена',
        'rejected': 'Отклонена',
    };
    return map[statusCode] || statusCode;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.textContent = message;
    container.appendChild(el);

    requestAnimationFrame(() => {
        el.classList.add('show');
    });

    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 300);
    }, 3000);
}

async function logoutUser() {
    const result = await apiRequest('/logout', 'POST');
    return result.ok;
}

document.addEventListener('DOMContentLoaded', async function() {
    const profileLink = document.getElementById('profile');
    const practiceLink = document.getElementById('practice');
    const chatLink = document.getElementById('chat');
    const container = document.getElementById('content-container');

    let currentRequest = null;

    // ---- Загрузка заявки ----
    async function loadRequests() {
        const result = await getRequests();
        if (result.success) {
            const all = result.data;
            all.sort((a, b) => b.id - a.id);
            currentRequest = all.length > 0 ? all[0] : null;
        } else {
            showNotification('Не удалось загрузить данные о заявках: ' + result.message, 'error');
        }
    }

    function renderProfileTab() {
        if (!currentRequest) {
            container.innerHTML = `
                <div class="confirmation-content center-content">
                    <p>Вы ещё не подали заявку. Перейдите на <a href="application.html">страницу заявок</a>.</p>
                </div>
            `;
            return;
        }

        const statusName = currentRequest.status?.name || getStatusText(currentRequest.status?.code);

        container.innerHTML = `
            <div class="profile-info" style="width:100%; text-align:left;">
                <h3 style="margin:0 0 15px 0;">Мой профиль</h3>
                <p><strong>ФИО:</strong> ${currentRequest.surname} ${currentRequest.name} ${currentRequest.patronymic || ''}</p>
                <p><strong>Направление:</strong> ${currentRequest.specialization}</p>
                <p><strong>Курс:</strong> ${currentRequest.course}</p>
                <p><strong>Город:</strong> ${currentRequest.city || 'не указан'}</p>
                <p><strong>Дата рождения:</strong> ${currentRequest.birthdate ? formatDate(currentRequest.birthdate) : 'не указана'}</p>
                <p><strong>Телефон:</strong> ${currentRequest.phone || 'не указан'}</p>
                <p><strong>Период практики:</strong> ${formatDate(currentRequest.start_date)} — ${formatDate(currentRequest.end_date)}</p>
                <p><strong>Статус заявки:</strong> ${statusName}</p>
            </div>
        `;
    }

    function renderPracticeTab() {
        if (!currentRequest || currentRequest.status?.code !== 'accepted') {
            container.innerHTML = `
                <div class="practice-info center-content">
                    <p>Информация о практике будет доступна после одобрения заявки.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="practice-info">
                <p class="application-main-text">Общая информация</p>
                <div class="practice-details">
                    <p><strong>Профиль практиканта:</strong> <a href="#" class="practicant-profile">Ссылка</a></p>
                    <p><strong>Начало практики:</strong> ${formatDate(currentRequest.start_date)}</p>
                    <p><strong>Место обучения:</strong> ${currentRequest.city || 'не указан'}</p>
                    <p><strong>Чат группы:</strong> <a href="#" class="practice-infochat">Ссылка</a></p>
                </div>
            </div>
        `;
    }

    function renderChatTab() {
        container.innerHTML = `
            <div class="chat">
                <div class="chat-left">
                    <div class="chat-left-user">
                        <img src="img/Rectangle 32.png" alt="icon" class="chat-left-user-icon">
                        <span>Тимлид</span>
                    </div>
                    <div class="chat-left-user">
                        <img src="img/Rectangle 32.png" alt="icon" class="chat-left-user-icon">
                        <span>Общая</span>
                    </div>
                </div>
                <div class="chat-right">
                    <div class="chat-right-message">
                        <span class="chat-right-message-teamlid">Тимлид</span>
                        <span class="chat-right-message-text">Приветствую на практике! <br>
                                                            Ну что, вы на месте, заявка одобрена — и это отличные новости! Я рад, что вы с нами. <br>
                                                            Немного обо мне: я тимлид, буду вашим главным проводником в ближайшие несколько недель. Моя задача — не просто давать задачи, а помочь вам разобраться, влиться в процессы и получить максимум пользы от этой практики. Здесь нет глупых вопросов, есть только те, на которые ещё никто не ответил. Так что спрашивате смело — я на связи.</span>
                    </div>
                    <div class="chat-right-message">
                        <span class="chat-right-message-username">Иванов И. И.</span>
                        <span class="chat-right-message-text">Всем привет!</span>
                    </div>
                    <div class="chat-right-message">
                        <span class="chat-right-message-username">Дуров П. В.</span>
                        <span class="chat-right-message-text">Привет</span>
                    </div>
                    <div class="chat-input">
                        <input type="text" placeholder="Введите текст">
                        <img src="img/Frame 50.png" alt="send" id="send-message-btn">
                    </div>
                </div>
            </div>
        `;
    }

    function switchToTab(tabName) {
        document.querySelectorAll('.navigation-bottom a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.getElementById(tabName);
        if (activeLink) activeLink.classList.add('active');

        const container = document.getElementById('content-container');
        // Меняем фон в зависимости от вкладки
        if (tabName === 'chat') {
            container.style.backgroundColor = '#ECECF4';
        } else {
            container.style.backgroundColor = ''; // вернуть стандартный (F5F4F9)
        }

        switch (tabName) {
            case 'profile': renderProfileTab(); break;
            case 'practice': renderPracticeTab(); break;
            case 'chat': renderChatTab(); break;
        }
    }

    profileLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToTab('profile');
    });
    practiceLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToTab('practice');
    });
    chatLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToTab('chat');
    });

    await loadRequests();
    switchToTab('profile');
});


//Попап
document.addEventListener('DOMContentLoaded', function() {
    const profileIcon = document.getElementById('profile-icon');
    const profilePopup = document.querySelector('.profile');
    const logoutBtn = document.querySelector('.logout-button');
    const profileEmail = document.querySelector('.profile-email');

    if (!profileIcon || !profilePopup) return;

    const userEmail = sessionStorage.getItem('userEmail') || sessionStorage.getItem('registrationEmail');
    if (userEmail && profileEmail) {
        profileEmail.textContent = userEmail;
    } else {
        profileEmail.textContent = 'user@example.com';
    }

    profileIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = profilePopup.classList.contains('show');
        if (isVisible) {
            profilePopup.classList.remove('show');
        } else {
            const rect = profileIcon.getBoundingClientRect();
            profilePopup.style.top = (rect.bottom + 8) + 'px';
            profilePopup.style.left = (rect.right - 280) + 'px';
            profilePopup.classList.add('show');
        }
    });

    document.addEventListener('click', function(e) {
        if (!profilePopup.contains(e.target) && e.target !== profileIcon) {
            profilePopup.classList.remove('show');
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            const confirmLogout = confirm('Вы уверены, что хотите выйти?');
            if (!confirmLogout) return;

            const result = await logoutUser();
            if (result) {
                sessionStorage.removeItem('userEmail');
                sessionStorage.removeItem('registrationEmail');
                window.location.href = 'authorization.html';
            } else {
                showNotification('Не удалось выйти из системы. Попробуйте позже.', 'error');
            }
        });
    }
});