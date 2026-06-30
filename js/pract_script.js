const API_BASE = 'https://school21test.strangled.net/api';

function getAuthToken() {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token') || null;
}

function setAuthToken(token) {
    sessionStorage.setItem('auth_token', token);
}

function removeAuthToken() {
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token');
}

async function apiRequest(endpoint, method = 'POST', body = null) {
    try {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            credentials: 'include',
            headers,
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json().catch(() => null);

        // Если токен недействителен, удаляем и перенаправляем на логин
        if (response.status === 401) {
            removeAuthToken();
            if (!window.location.pathname.includes('authorization.html')) {
                window.location.href = 'authorization.html';
            }
        }

        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error('Network error:', error);
        return { ok: false, status: 0, data: { message: 'Ошибка соединения с сервером' } };
    }
}

async function getRequests() {
    const result = await apiRequest('/requests/my', 'GET');
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
        'canceled': 'Отменена',
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
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => { if (el.parentNode) el.remove(); }, 300);
    }, 3000);
}

async function logoutUser() {
    const result = await apiRequest('/logout', 'POST');
    if (result.ok) {
        removeAuthToken();
        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('registrationEmail');
    }
    return result.ok;
}

let notificationOverlay = null;

function openNotificationPopup() {
    const popup = document.querySelector('.notification-popup');
    if (!popup) return;
    popup.style.display = 'flex';

    if (!notificationOverlay) {
        notificationOverlay = document.createElement('div');
        notificationOverlay.id = 'notification-overlay';
        notificationOverlay.style.position = 'fixed';
        notificationOverlay.style.top = '0';
        notificationOverlay.style.left = '0';
        notificationOverlay.style.width = '100%';
        notificationOverlay.style.height = '100%';
        notificationOverlay.style.background = 'rgba(0,0,0,0.5)';
        notificationOverlay.style.zIndex = '999';
        notificationOverlay.style.display = 'none';
        document.body.appendChild(notificationOverlay);
        notificationOverlay.addEventListener('click', closeNotificationPopup);
    }
    notificationOverlay.style.display = 'block';

    renderNotifications();
}

function closeNotificationPopup() {
    const popup = document.querySelector('.notification-popup');
    if (popup) popup.style.display = 'none';
    if (notificationOverlay) notificationOverlay.style.display = 'none';
}

let notificationsData = [
    {
        id: 1,
        theme: 'Собрание практикантов',
        date: '22.07.2026 17:49',
        title: 'Собрание практикантов',
        description: 'Уважаемые практиканты! <br> Доводим до вашего сведения, что 22.07 в 19:00 состоится общее организационное собрание. <br> Явка на собрание строго обязательна для всех без исключения. На встрече будут озвучены важные вопросы, касающиеся вашей работы и дальнейшего графика. <br> Просим вас быть вовремя. Опоздания не допускаются.',
        read: false
    },
    {
        id: 2,
        theme: 'Изменение расписания',
        date: '20.07.2026 10:15',
        title: 'Изменение расписания',
        description: 'Уважаемые практиканты! <br> В связи с техническими работами расписание на следующую неделю изменено. Новое расписание будет опубликовано на сайте. <br> Приносим извинения за неудобства.',
        read: true
    },
    {
        id: 3,
        theme: 'Важная информация о практике',
        date: '18.07.2026 09:00',
        title: 'Важная информация о практике',
        description: 'Коллеги! <br> Напоминаем, что все практиканты должны заполнить анкеты до 25 июля. Анкеты доступны в личном кабинете. <br> С уважением, администрация.',
        read: false
    }
];

let currentNotificationId = null;

function updateNotificationIcon() {
    const icon = document.getElementById('profile-notification');
    if (!icon) return;
    const hasUnread = notificationsData.some(notif => !notif.read);
    icon.src = hasUnread ? 'img/icon 04.png' : 'img/icon 03.png';
}

function renderNotifications() {
    const leftContainer = document.querySelector('.notification-left');
    const rightContainer = document.querySelector('.notification-right');
    if (!leftContainer || !rightContainer) return;

    leftContainer.innerHTML = '';
    notificationsData.forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item${notif.read ? '' : ' unread'}`;
        item.dataset.id = notif.id;
        item.innerHTML = `
            <span class="notification-message">${notif.theme}</span>
            ${notif.read ? '' : '<span class="notification-dot"></span>'}
        `;
        item.addEventListener('click', function() {
            selectNotification(notif.id);
        });
        leftContainer.appendChild(item);
    });

    if (notificationsData.length > 0) {
        selectNotification(notificationsData[0].id);
    } else {
        rightContainer.innerHTML = '<p>Нет уведомлений</p>';
    }

    updateNotificationIcon();
}

function selectNotification(id) {
    const notif = notificationsData.find(n => n.id === id);
    if (!notif) return;
    currentNotificationId = id;
    const rightContainer = document.querySelector('.notification-right');
    if (!rightContainer) return;

    if (!notif.read) {
        notif.read = true;
        const items = document.querySelectorAll('.notification-item');
        items.forEach(item => {
            if (parseInt(item.dataset.id) === id) {
                item.classList.remove('unread');
                const dot = item.querySelector('.notification-dot');
                if (dot) dot.remove();
            }
        });
        updateNotificationIcon();
    }

    rightContainer.innerHTML = `
        <div class="notification-right-header">
            <span class="notification-theme-label">Тема</span>
            <span class="notification-date">${notif.date}</span>
        </div>
        <div class="notification-title-block">${notif.title}</div>
        <span class="notification-description-label">Описание</span>
        <div class="notification-description-block">${notif.description}</div>
    `;
}

document.addEventListener('DOMContentLoaded', async function() {
    //Проверка токена
    if (!window.location.pathname.includes('authorization.html')) {
        const token = getAuthToken();
        if (!token) {
            window.location.href = 'authorization.html';
            return;
        }
    }

    const profileLink = document.getElementById('profile');
    const practiceLink = document.getElementById('practice');
    const chatLink = document.getElementById('chat');
    const container = document.getElementById('content-container');

    let currentRequest = null;

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
                        <input type="text" placeholder="Введите текст" id="chat-input-field">
                        <img src="img/Frame 50.png" alt="send" id="send-message-btn">
                    </div>
                </div>
            </div>
        `;
        const sendBtn = document.getElementById('send-message-btn');
        const inputField = document.getElementById('chat-input-field');
        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                const text = inputField ? inputField.value.trim() : '';
                if (text) {
                    showNotification('Сообщение отправлено: ' + text, 'success');
                    inputField.value = '';
                } else {
                    showNotification('Введите текст сообщения', 'error');
                }
            });
        }
        if (inputField) {
            inputField.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendBtn.click();
                }
            });
        }
    }

    function switchToTab(tabName) {
        document.querySelectorAll('.navigation-bottom a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.getElementById(tabName);
        if (activeLink) activeLink.classList.add('active');

        const container = document.getElementById('content-container');
        if (tabName === 'chat') {
            container.style.backgroundColor = '#ECECF4';
        } else {
            container.style.backgroundColor = '';
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
    updateNotificationIcon();

    const notifIcon = document.getElementById('profile-notification');
    if (notifIcon) {
        notifIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            openNotificationPopup();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeNotificationPopup();
        }
    });

    //Попап профиля
    const profileIcon = document.getElementById('profile-icon');
    const profilePopup = document.querySelector('.profile');
    const logoutBtn = document.querySelector('.logout-button');
    const profileEmail = document.querySelector('.profile-email');

    if (profileIcon && profilePopup) {
        const userEmail = sessionStorage.getItem('userEmail') || sessionStorage.getItem('registrationEmail') || 'user@example.com';
        if (profileEmail) profileEmail.textContent = userEmail;

        profileIcon.addEventListener('click', function(e) {
            e.stopPropagation();
            profilePopup.classList.toggle('show');
            if (profilePopup.classList.contains('show')) {
                const rect = profileIcon.getBoundingClientRect();
                profilePopup.style.top = (rect.bottom + 8) + 'px';
                profilePopup.style.left = (rect.right - 280) + 'px';
            }
        });

        document.addEventListener('click', function(e) {
            if (!profilePopup.contains(e.target) && e.target !== profileIcon) {
                profilePopup.classList.remove('show');
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async function() {
                if (confirm('Вы уверены, что хотите выйти?')) {
                    const result = await logoutUser();
                    if (result) {
                        //Токен и данные уже удалены внутри logoutUser
                        window.location.href = 'authorization.html';
                    } else {
                        showNotification('Не удалось выйти из системы. Попробуйте позже.', 'error');
                    }
                }
            });
        }
    }
});