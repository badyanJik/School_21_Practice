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

    // Принудительное центрирование попапа поверх всего
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.zIndex = '1000';
    popup.style.display = 'flex';

    // Создаём затемнение, если его нет
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

    // Закрываем другие открытые попапы
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

function renderChatTab() {
    return `<div class="center-content"><p>Чат пока не реализован</p></div>`;
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
    // Вставляем попапы в body
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
    // После рендеринга привязываем обработчики событий
    attachEventHandlers(tabName);
}

function switchTab(tabName) {
    currentTab = tabName;
    // Активный класс для навигации
    document.querySelectorAll('.navigation-bottom a').forEach(link => link.classList.remove('active'));
    const activeLink = document.getElementById(tabName + '-tab');
    if (activeLink) activeLink.classList.add('active');
    // Рендерим контент
    renderTab(tabName);
    // Закрываем все попапы
    closeAllPopups();
}

// ============================================================
// 6. Привязка обработчиков событий после рендеринга
// ============================================================

function attachEventHandlers(tabName) {
    if (tabName === 'applications') {
        // Клик по строке таблицы -> открыть попап заявки
        document.querySelectorAll('.request-row').forEach(row => {
            row.addEventListener('click', function() {
                const fio = this.querySelector('td:first-child').textContent;
                document.getElementById('request-popup-fio').textContent = fio;
                openPopup('popup-request');
            });
        });

        // Фильтры (заглушка)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                showNotification('Фильтр: ' + filter + ' (заглушка)', 'info');
            });
        });
    }

    if (tabName === 'groups') {
        // Клик по группе -> открыть детали
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

        // Раскрытие dropdown
        document.querySelectorAll('.dropbtn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = this.closest('.dropdown');
                if (dropdown) dropdown.classList.toggle('open');
            });
        });

        // Фильтрация групп
        const filterButtons = document.querySelectorAll('.group-filter-btn');
        const allGroups = document.querySelectorAll('.group');
        const dropdowns = document.querySelectorAll('.dropdown');

        function filterGroups(type) {
            // Сначала показываем все группы и dropdown-ы
            allGroups.forEach(g => g.style.display = 'flex');
            dropdowns.forEach(d => d.style.display = 'block');

            if (type === 'active') {
                // Скрываем все группы с data-type="finished" и все dropdown-ы
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
                // Скрываем все группы с data-type="active"
                allGroups.forEach(g => {
                    if (g.getAttribute('data-type') === 'active') {
                        g.style.display = 'none';
                    }
                });
                // Показываем все dropdown-ы (они уже видны)
            }
        }

        // По умолчанию показываем только активные
        filterGroups('active');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                filterGroups(type);
                showNotification('Показаны ' + (type === 'active' ? 'активные' : 'завершённые') + ' группы', 'info');
            });
        });
    }

    // Для всех вкладок – общие обработчики для кнопок внутри контента (если есть)
    // Например, кнопка "Отправить уведомление" в шапке уже обрабатывается отдельно.
}

// ============================================================
// 7. Инициализация при загрузке страницы
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // 1. Создаём попапы (один раз)
    createPopups();

    // 2. Обработчики для вкладок
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

    // 3. Обработчики для кнопок в попапах (привязываем один раз, т.к. попапы существуют всегда)
    // Кнопка "Отклонить" в попапе заявки
    document.getElementById('popup-request-reject')?.addEventListener('click', function() {
        closePopup('popup-request');
        openPopup('popup-reject-reason');
    });

    // Кнопка "Принять" в попапе заявки
    document.getElementById('popup-request-accept')?.addEventListener('click', function() {
        showNotification('Заявка принята! (заглушка)', 'success');
        closePopup('popup-request');
    });

    // Открытие попапа "Шаблоны" из разных мест
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

    // Сохранение шаблона
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

    // Отправка причины отказа
    document.getElementById('reject-submit')?.addEventListener('click', function() {
        const reason = document.getElementById('reject-reason-input').value.trim();
        if (!reason) {
            showNotification('Введите причину отказа', 'error');
            return;
        }
        showNotification('Причина отправлена (заглушка)', 'success');
        closePopup('popup-reject-reason');
    });

    // Открытие попапа уведомления из шапки
    document.getElementById('open-notification-popup')?.addEventListener('click', function() {
        openPopup('popup-notification');
    });

    // Открытие попапа уведомления из деталей группы
    document.getElementById('open-notification-from-group')?.addEventListener('click', function() {
        openPopup('popup-notification');
    });

    // Отправка уведомления
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

    // Закрытие попапов по кнопкам .popup-close
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

    // 4. Попап профиля (копируем из других скриптов)
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

    // 5. Загружаем вкладку по умолчанию
    switchTab('applications');
});