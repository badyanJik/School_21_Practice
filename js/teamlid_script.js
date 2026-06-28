// ============================================================
// 1. Вспомогательные функции (уведомления)
// ============================================================
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

// ============================================================
// 2. Управление попапами
// ============================================================

function openPopup(id) {
    const popup = document.getElementById(id);
    if (!popup) return;

    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';
    popup.style.display = 'flex';

    let overlay = document.getElementById('popup-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'popup-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '999';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeAllPopups);
    }
    overlay.style.display = 'block';

    document.querySelectorAll('.popup').forEach(p => {
        if (p.id !== id && p.style.display !== 'none') {
            p.style.display = 'none';
        }
    });
}

function closePopup(id) {
    const popup = document.getElementById(id);
    if (popup) popup.style.display = 'none';
    const anyOpen = document.querySelector('.popup[style*="display: flex"]');
    if (!anyOpen) {
        const overlay = document.getElementById('popup-overlay');
        if (overlay) overlay.style.display = 'none';
    }
}

function closeAllPopups() {
    document.querySelectorAll('.popup').forEach(p => p.style.display = 'none');
    const overlay = document.getElementById('popup-overlay');
    if (overlay) overlay.style.display = 'none';
}

// ============================================================
// 3. Генерация HTML-структур
// ============================================================

function renderApplicationsTab() {
    return `
        <div class="applications-top">
            <button class="filter-btn" data-filter="accepted">Принято</button>
            <button class="filter-btn" data-filter="rejected">Отклонено</button>
            <button class="filter-btn" data-filter="pending">На рассмотрении</button>
        </div>
        <table class="applications-table" id="requests-table">
            <thead>
                <tr class="table-header">
                    <th>ФИО</th>
                    <th>Курс</th>
                    <th>Направление</th>
                    <th>Дата начала</th>
                    <th>Дата окончания</th>
                </tr>
            </thead>
            <tbody id="table-body">
                <tr class="request-row" data-id="1">
                    <td>Иванов Иван Иванович</td>
                    <td>3</td>
                    <td>Информационные системы</td>
                    <td>01.07.2026</td>
                    <td>31.08.2026</td>
                </tr>
                <tr class="request-row" data-id="2">
                    <td>Петров Пётр Петрович</td>
                    <td>2</td>
                    <td>Программная инженерия</td>
                    <td>15.06.2026</td>
                    <td>15.08.2026</td>
                </tr>
            </tbody>
        </table>
    `;
}

function renderGroupsTab() {
    return `
        <div class="applications-top">
            <button class="group-filter-btn" data-type="active">Активные</button>
            <button class="group-filter-btn" data-type="finished">Завершённые</button>
        </div>
        <div class="groups-active" id="groups-container">
            <!-- Активные группы -->
            <div class="group" data-group-id="1" data-type="active">
                <span class="popup-value">22.06-14.07</span>
                <span class="popup-label">20 человек</span>
            </div>
            <div class="group" data-group-id="2" data-type="active">
                <span class="popup-value">01.07-15.07</span>
                <span class="popup-label">15 человек</span>
            </div>
            <!-- Завершённые группы с раскрытием -->
            <div class="dropdown" data-type="finished">
                <button class="dropbtn">
                    2025 год
                    <span class="arrow">▼</span>
                </button>
                <div class="dropdown-content">
                    <div class="group" data-group-id="3" data-type="finished">
                        <span class="popup-value">10.06-20.07</span>
                        <span class="popup-label">18 человек</span>
                    </div>
                    <div class="group" data-group-id="4" data-type="finished">
                        <span class="popup-value">05.07-05.08</span>
                        <span class="popup-label">22 человека</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ---- Функции для рендеринга контента чата ----
function renderChatMessages(chatId = 'default') {
    const messages = {
        default: `
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
        `,
        group1: `
            <div class="chat-right-message">
                <span class="chat-right-message-teamlid">Тимлид</span>
                <span class="chat-right-message-text">Привет, группа 22.06-14.07!</span>
            </div>
            <div class="chat-right-message">
                <span class="chat-right-message-username">Студент 1</span>
                <span class="chat-right-message-text">Здравствуйте!</span>
            </div>
        `,
        group2: `
            <div class="chat-right-message">
                <span class="chat-right-message-teamlid">Тимлид</span>
                <span class="chat-right-message-text">Привет, группа 01.07-15.07!</span>
            </div>
            <div class="chat-right-message">
                <span class="chat-right-message-username">Студент А</span>
                <span class="chat-right-message-text">Привет!</span>
            </div>
        `
    };
    return messages[chatId] || messages.default;
}

function renderMembersList() {
    return `
        <div class="chat-right-message" style="background:#fff; width:100%;">
            <span class="chat-right-message-username">Список участников:</span>
            <ul style="list-style:none; padding:0; margin-top:10px;">
                <li>Корытко Е. А.</li>
                <li>Иванов И. И.</li>
                <li>Петров П. П.</li>
                <li>Сидоров С. С.</li>
            </ul>
        </div>
    `;
}

function renderChatTab() {
    return `
        <div class="chat">
            <div class="chat-left">
                <div class="applications-top" style="width:100%;">
                    <button class="btn btn-sm chat-tab-btn active" data-tab="groups">Группы</button>
                    <button class="btn btn-sm chat-tab-btn" data-tab="members">Участники</button>
                </div>
                <div class="chat-left-user" data-chat="default">
                    <img src="img/Rectangle 32.png" alt="icon" class="chat-left-user-icon">
                    <span>22.06-14.07</span>
                </div>
                <div class="chat-left-user" data-chat="group1">
                    <img src="img/Rectangle 32.png" alt="icon" class="chat-left-user-icon">
                    <span>22.06-14.07 (группа)</span>
                </div>
                <div class="chat-left-user" data-chat="group2">
                    <img src="img/Rectangle 32.png" alt="icon" class="chat-left-user-icon">
                    <span>01.07-15.07</span>
                </div>
            </div>
            <div class="chat-right" id="chat-right-content">
                <div id="chat-messages-area"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Введите текст" id="chat-input-field">
                    <img src="img/Frame 50.png" alt="send" id="send-message-btn">
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// 4. Генерация попапов (добавляются в body один раз)
// ============================================================

function createPopups() {
    const popupsHTML = `
        <!-- Попап заявки (детали) -->
        <div class="popup" id="popup-request">
            <div class="application-reject-top">
                <img src="img/Frame 50.png" alt="back" class="back popup-close" data-close="popup-request">
            </div>
            <div class="application-popup-fio">
                <p id="request-popup-fio">Дуров Павел Валерьевич</p>
            </div>
            <div class="application-popup-info">
                <div class="popup-info-item">
                    <span class="popup-label">номер телефона</span>
                    <span class="popup-value" id="popup-phone">+7 999 123-45-67</span>
                </div>
                <div class="popup-info-item">
                    <span class="popup-label">дата рождения</span>
                    <span class="popup-value" id="popup-birthdate">10.10.1984</span>
                </div>
                <div class="popup-info-item">
                    <span class="popup-label">курс</span>
                    <span class="popup-value" id="popup-course">3</span>
                </div>
                <div class="popup-info-item">
                    <span class="popup-label">направление</span>
                    <span class="popup-value" id="popup-specialization">09.03.03</span>
                </div>
                <div class="popup-info-item">
                    <span class="popup-label">дата начала</span>
                    <span class="popup-value" id="popup-start-date">06.07.2026</span>
                </div>
                <div class="popup-info-item">
                    <span class="popup-label">дата окончания</span>
                    <span class="popup-value" id="popup-end-date">02.08.2026</span>
                </div>
            </div>
            <div class="application-buttons">
                <button class="application-button" id="popup-request-accept">Принять</button>
                <button class="application-button-cancel" id="popup-request-reject">Отклонить</button>
            </div>
        </div>

        <!-- Попап "Причина отказа" -->
        <div class="popup" id="popup-reject-reason">
            <div class="application-reject-top">
                <img src="img/Frame 50.png" alt="back" class="back popup-close" data-close="popup-reject-reason">
                <button class="template" id="open-template-popup">Шаблоны</button>
            </div>
            <p class="application-main-text">Укажите причину отказа</p>
            <input type="text" placeholder="Текст" class="full" id="reject-reason-input">
            <div class="application-buttons">
                <button class="transparent-button" id="save-template-from-reject">Сохранить шаблон</button>
                <button class="application-button" id="reject-submit">Отправить</button>
            </div>
        </div>

        <!-- Попап "Шаблон" (для создания/сохранения) -->
        <div class="popup" id="popup-template">
            <div class="application-reject-top">
                <img src="img/Frame 50.png" alt="back" class="back popup-close" data-close="popup-template">
            </div>
            <div class="popup-info-item">
                <p>Название шаблона</p>
                <input type="text" placeholder="Текст" class="full" id="template-name">
            </div>
            <div class="popup-info-item">
                <p>Причина отказа</p>
                <input type="text" placeholder="Поле обязательно для ввода" class="full" id="template-reason">
            </div>
            <button class="application-button" id="template-save">Сохранить</button>
        </div>

        <!-- Попап "Детали группы" (при клике на группу) -->
        <div class="popup" id="popup-group-details">
            <div class="application-reject-top">
                <img src="img/Frame 50.png" alt="back" class="back popup-close" data-close="popup-group-details">
            </div>
            <div class="applications-group-top-popup">
                <div class="group-info">
                    <span class="group-info-date" id="group-detail-date">22.06-14.07</span>
                    <span class="group-info-count" id="group-detail-count">20 человек</span>
                </div>
                <div class="group-actions">
                    <button class="application-button" id="open-notification-from-group">Отправить уведомление</button>
                    <button class="application-button">Перейти в чат</button>
                </div>
            </div>
            <table class="applications-table">
                <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Курс</th>
                        <th>Направление</th>
                        <th>Дата начала</th>
                        <th>Дата окончания</th>
                    </tr>
                </thead>
                <tbody id="group-table-body">
                    <tr>
                        <td>Сидоров Сидор Сидорович</td>
                        <td>3</td>
                        <td>Информационные системы</td>
                        <td>01.07.2026</td>
                        <td>31.08.2026</td>
                    </tr>
                    <tr>
                        <td>Кузнецова Анна Михайловна</td>
                        <td>4</td>
                        <td>Прикладная математика</td>
                        <td>15.06.2026</td>
                        <td>15.08.2026</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Попап "Отправка уведомления" -->
        <div class="popup" id="popup-notification">
            <div class="application-reject-top">
                <img src="img/Frame 50.png" alt="back" class="back popup-close" data-close="popup-notification">
                <button class="template" id="open-template-from-notification">Шаблоны</button>
            </div>
            <div class="popup-info-item">
                <p>Тема</p>
                <input type="text" placeholder="Текст" class="full" id="notification-subject">
            </div>
            <div class="popup-info-item">
                <p>Группа</p>
                <select id="notification-group-select" class="form-select">
                    <option value="1">22.06-14.07</option>
                    <option value="2">01.07-15.07</option>
                </select>
            </div>
            <div class="popup-info-item">
                <p>Описание</p>
                <input type="text" placeholder="Текст" class="full" id="notification-body">
            </div>
            <div class="application-buttons">
                <button class="transparent-button" id="save-template-from-notification">Сохранить шаблон</button>
                <button class="application-button" id="notification-send">Отправить</button>
            </div>
        </div>
    `;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = popupsHTML;
    while (wrapper.firstChild) {
        document.body.appendChild(wrapper.firstChild);
    }
}

// ============================================================
// 5. Основная логика (рендеринг вкладок, обработчики)
// ============================================================

let currentTab = 'applications';

function renderTab(tabName) {
    const container = document.getElementById('content-container');
    if (!container) return;
    let html = '';
    if (tabName === 'applications') {
        html = renderApplicationsTab();
    } else if (tabName === 'groups') {
        html = renderGroupsTab();
    } else if (tabName === 'chat') {
        html = renderChatTab();
    }
    container.innerHTML = html;
    attachEventHandlers(tabName);
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.navigation-bottom a').forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById(tabName + '-tab');
    if (activeLink) activeLink.classList.add('active');

    const container = document.getElementById('content-container');
    if (tabName === 'chat') {
        container.style.backgroundColor = '#ECECF4';
    } else {
        container.style.backgroundColor = '';
    }

    renderTab(tabName);
    closeAllPopups();
}

// ============================================================
// 6. Привязка обработчиков событий после рендеринга
// ============================================================

function attachEventHandlers(tabName) {
    // Обработчики для вкладки "Заявки"
    if (tabName === 'applications') {
        document.querySelectorAll('.request-row').forEach(row => {
            row.addEventListener('click', function() {
                const fio = this.querySelector('td:first-child').textContent;
                document.getElementById('request-popup-fio').textContent = fio;
                openPopup('popup-request');
            });
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                showNotification('Фильтр: ' + filter + ' (заглушка)', 'info');
            });
        });
    }

    // Обработчики для вкладки "Группы"
    if (tabName === 'groups') {
        document.querySelectorAll('.group').forEach(group => {
            group.addEventListener('click', function(e) {
                if (e.target.closest('button')) return;
                const date = this.querySelector('.popup-value')?.textContent || '';
                const count = this.querySelector('.popup-label')?.textContent || '';
                document.getElementById('group-detail-date').textContent = date;
                document.getElementById('group-detail-count').textContent = count;
                openPopup('popup-group-details');
            });
        });

        document.querySelectorAll('.dropbtn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = this.closest('.dropdown');
                if (dropdown) dropdown.classList.toggle('open');
            });
        });

        const filterButtons = document.querySelectorAll('.group-filter-btn');
        const allGroups = document.querySelectorAll('.group');
        const dropdowns = document.querySelectorAll('.dropdown');

        function filterGroups(type) {
            allGroups.forEach(g => g.style.display = 'flex');
            dropdowns.forEach(d => d.style.display = 'block');

            if (type === 'active') {
                allGroups.forEach(g => {
                    if (g.getAttribute('data-type') === 'finished') {
                        g.style.display = 'none';
                    }
                });
                dropdowns.forEach(d => {
                    if (d.getAttribute('data-type') === 'finished') {
                        d.style.display = 'none';
                    }
                });
            } else if (type === 'finished') {
                allGroups.forEach(g => {
                    if (g.getAttribute('data-type') === 'active') {
                        g.style.display = 'none';
                    }
                });
                // dropdowns оставляем видимыми
            }
        }

        filterGroups('active');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                filterGroups(type);
                showNotification('Показаны ' + (type === 'active' ? 'активные' : 'завершённые') + ' группы', 'info');
            });
        });
    }

    // Обработчики для вкладки "Чат"
    if (tabName === 'chat') {
        const tabBtns = document.querySelectorAll('.chat-tab-btn');
        const messagesArea = document.getElementById('chat-messages-area');
        const sendBtn = document.getElementById('send-message-btn');
        const inputField = document.getElementById('chat-input-field');

        // Функция рендеринга содержимого (сообщения или участники)
        function renderChatContent(tab) {
            if (tab === 'members') {
                messagesArea.innerHTML = renderMembersList();
            } else {
                messagesArea.innerHTML = renderChatMessages('default');
            }
        }

        // Устанавливаем начальное состояние (по умолчанию активна "Группы")
        renderChatContent('groups');

        // Переключение между вкладками "Группы" и "Участники"
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const tab = this.dataset.tab;
                renderChatContent(tab);
                showNotification('Переключено на ' + (tab === 'groups' ? 'Группы' : 'Участников'), 'info');
            });
        });

        // Обработка кликов по элементам слева (чаты) – НЕ сбрасываем активную вкладку
        document.querySelectorAll('.chat-left-user').forEach(user => {
            user.addEventListener('click', function() {
                const chatId = this.dataset.chat || 'default';
                // Если активна вкладка "Участники", при клике на чат оставляем её активной,
                // но показываем сообщения (или можно оставить список участников? но по логике, лучше показывать сообщения)
                // Чтобы не менять вкладку, мы просто обновляем messagesArea.
                // Но если активна "Участники", мы можем либо переключить на "Группы", либо оставить, как есть.
                // Я оставлю без переключения – просто обновим сообщения.
                messagesArea.innerHTML = renderChatMessages(chatId);
                // Если активна вкладка "Участники", можно дополнительно переключить её на "Группы", но мы не будем.
                // Если хотите, чтобы при клике на чат автоматически переключалось на "Группы", раскомментируйте:
                // if (document.querySelector('.chat-tab-btn.active').dataset.tab === 'members') {
                //     tabBtns.forEach(b => b.classList.remove('active'));
                //     document.querySelector('.chat-tab-btn[data-tab="groups"]').classList.add('active');
                // }
            });
        });

        // Обработчик кнопки отправки сообщения (заглушка)
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
}

// ============================================================
// 7. Инициализация при загрузке страницы
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    createPopups();

    document.getElementById('applications-tab').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('applications');
    });
    document.getElementById('groups-tab').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('groups');
    });
    document.getElementById('chat-tab').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab('chat');
    });

    // Обработчики для кнопок в попапах
    document.getElementById('popup-request-reject')?.addEventListener('click', function() {
        closePopup('popup-request');
        openPopup('popup-reject-reason');
    });

    document.getElementById('popup-request-accept')?.addEventListener('click', function() {
        showNotification('Заявка принята! (заглушка)', 'success');
        closePopup('popup-request');
    });

    document.getElementById('open-template-popup')?.addEventListener('click', function() {
        openPopup('popup-template');
    });
    document.getElementById('open-template-from-notification')?.addEventListener('click', function() {
        openPopup('popup-template');
    });
    document.getElementById('save-template-from-reject')?.addEventListener('click', function() {
        openPopup('popup-template');
    });
    document.getElementById('save-template-from-notification')?.addEventListener('click', function() {
        openPopup('popup-template');
    });

    document.getElementById('template-save')?.addEventListener('click', function() {
        const name = document.getElementById('template-name').value.trim();
        const reason = document.getElementById('template-reason').value.trim();
        if (!name || !reason) {
            showNotification('Заполните оба поля', 'error');
            return;
        }
        showNotification('Шаблон "' + name + '" сохранён!', 'success');
        closePopup('popup-template');
    });

    document.getElementById('reject-submit')?.addEventListener('click', function() {
        const reason = document.getElementById('reject-reason-input').value.trim();
        if (!reason) {
            showNotification('Введите причину отказа', 'error');
            return;
        }
        showNotification('Причина отправлена (заглушка)', 'success');
        closePopup('popup-reject-reason');
    });

    document.getElementById('open-notification-popup')?.addEventListener('click', function() {
        openPopup('popup-notification');
    });

    document.getElementById('open-notification-from-group')?.addEventListener('click', function() {
        openPopup('popup-notification');
    });

    document.getElementById('notification-send')?.addEventListener('click', function() {
        const subject = document.getElementById('notification-subject').value.trim();
        const body = document.getElementById('notification-body').value.trim();
        const group = document.getElementById('notification-group-select').value;
        if (!subject || !body) {
            showNotification('Заполните тему и описание', 'error');
            return;
        }
        showNotification('Уведомление отправлено группе ' + group, 'success');
        closePopup('popup-notification');
    });

    document.querySelectorAll('.popup-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const targetId = this.getAttribute('data-close');
            if (targetId) {
                closePopup(targetId);
            } else {
                const popup = this.closest('.popup');
                if (popup) closePopup(popup.id);
            }
        });
    });

    // Попап профиля
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
            logoutBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите выйти?')) {
                    sessionStorage.removeItem('userEmail');
                    sessionStorage.removeItem('registrationEmail');
                    window.location.href = 'authorization.html';
                }
            });
        }
    }

    switchTab('applications');
});