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
    const result = await apiRequest('/requests/my', 'GET');
    if (result.ok) {
        return { success: true, data: result.data.practice_requests || [] };
    } else {
        const message = result.data?.message || 'Ошибка получения заявок';
        return { success: false, message };
    }
}

async function createRequest(requestData) {
    const result = await apiRequest('/requests', 'POST', requestData);
    if (result.ok) {
        return { success: true, data: result.data.practice_request };
    } else {
        const message = result.data?.message || 'Ошибка создания заявки';
        const errors = result.data?.errors || {};
        return { success: false, message, errors };
    }
}

async function updateRequestStatus(id, newStatus) {
    const result = await apiRequest(`/requests/${id}/status`, 'PATCH', { new_status: newStatus });
    if (result.ok) {
        return { success: true, data: result.data.practice_request };
    } else {
        const message = result.data?.message || 'Ошибка обновления статуса';
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

function getConfirmationMessage(statusCode) {
    switch (statusCode) {
        case 'pending':
            return 'Спасибо! Заявка отправлена. Мы уже начали её обработку. Данные переданы для проверки. Пожалуйста, ожидайте ответа. Уведомление о статусе вашей заявки появится на сайте и придёт вам на почту в ближайшее время.';
        case 'accepted':
            return 'Отлично! Ваша заявка прошла проверку и одобрена. Все проверки пройдены. Доступ к общему чату группы уже открыт.';
        case 'rejected':
            return 'К сожалению, заявка отклонена. Причина указана ниже. Вы можете повторно отправить заявку, но не более 2 раз.';
        case 'canceled':
            return 'Заявка отменена. Вы можете подать новую заявку.';
        default:
            return 'Статус заявки неизвестен.';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

//Уведомления
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

document.addEventListener('DOMContentLoaded', async function() {
    const appLink = document.getElementById('application');
    const confLink = document.getElementById('confirmation');
    const practLink = document.getElementById('practice');
    const container = document.getElementById('content-container');

    let allRequests = [];
    let currentRequest = null;
    let rejectedCount = 0;
    let currentTab = 'application';

    async function loadRequests() {
        const result = await getRequests();
        if (result.success) {
            allRequests = result.data;
            allRequests.sort((a, b) => b.id - a.id);
            currentRequest = allRequests.length > 0 ? allRequests[0] : null;
            rejectedCount = allRequests.filter(req => req.status.code === 'rejected').length;
        } else {
            showNotification('Не удалось загрузить данные о заявках: ' + result.message, 'error');
        }
    }

    function renderApplicationTab() {
        const canSubmit = rejectedCount < 2;

        if (!currentRequest && canSubmit) {
            container.innerHTML = `
                <p class="application-main-text">Расскажи нам немного о себе</p>

                <label class="form-label">Фамилия</label>
                <input type="text" placeholder="Фамилия" id="app-surname">

                <label class="form-label">Имя</label>
                <input type="text" placeholder="Имя" id="app-name">

                <label class="form-label">Отчество</label>
                <input type="text" placeholder="Отчество" id="app-patronymic">

                <div class="radio-group">
                    <input type="radio" value="man" name="gender" id="man" checked>
                    <label for="man">Мужчина</label>
                    <input type="radio" value="woman" name="gender" id="woman">
                    <label for="woman">Женщина</label>
                </div>

                <label class="form-label">Город</label>
                <select id="app-city" class="form-select">
                    <option value="">Выберите город</option>
                    <option value="Москва">Москва</option>
                    <option value="Санкт-Петербург">Санкт-Петербург</option>
                    <option value="Казань">Казань</option>
                    <option value="Уфа">Уфа</option>
                </select>

                <label class="form-label">Дата рождения</label>
                <input type="date" placeholder="Дата рождения" id="app-birthdate">

                <label class="form-label">Телефон</label>
                <input type="text" placeholder="+7 000 000 00 00" id="app-phone">

                <label class="form-label">Направление</label>
                <input type="text" placeholder="Направление" id="app-specialization">

                <label class="form-label">Курс</label>
                <input type="text" placeholder="Курс" id="app-course">

                <label class="form-label">Дата начала практики</label>
                <input type="date" placeholder="Дата начала практики" id="app-start-date">

                <label class="form-label">Дата окончания практики</label>
                <input type="date" placeholder="Дата окончания практики" id="app-end-date">

                <button class="application-button" id="submit-request">Отправить заявку</button>
            `;
            document.getElementById('submit-request').addEventListener('click', handleSubmitRequest);
        } else if (!currentRequest && !canSubmit) {
            container.innerHTML = `
                <div class="confirmation-content center-content">
                    <p class="application-main-text">Вы исчерпали лимит попыток (2 отклонённые заявки).</p>
                    <p>К сожалению, вы не можете подать новую заявку.</p>
                </div>
            `;
        } else {
            const statusCode = currentRequest.status?.code || 'unknown';
            const statusName = currentRequest.status?.name || getStatusText(statusCode);
            const canCancel = statusCode === 'pending';

            container.innerHTML = `
                <div class="request-info">
                    <h3>Ваша заявка</h3>
                    <p><strong>Статус:</strong> ${statusName}</p>
                    <p><strong>ФИО:</strong> ${currentRequest.surname} ${currentRequest.name} ${currentRequest.patronymic || ''}</p>
                    <p><strong>Город прохождения:</strong> ${currentRequest.city}</p>
                    <p><strong>Направление:</strong> ${currentRequest.specialization}</p>
                    <p><strong>Курс:</strong> ${currentRequest.course}</p>
                    <p><strong>Период:</strong> ${formatDate(currentRequest.start_date)} — ${formatDate(currentRequest.end_date)}</p>
                    ${canCancel ? `<button class="application-button-cancel" id="cancel-request">Отменить заявку</button>` : ''}
                    ${(statusCode === 'rejected' || statusCode === 'canceled') && canSubmit ? `<button class="application-button mt-10" id="new-request-btn">Подать новую заявку</button>` : ''}
                </div>
            `;
            if (canCancel) {
                document.getElementById('cancel-request').addEventListener('click', handleCancelRequest);
            }
            if ((statusCode === 'rejected' || statusCode === 'canceled') && canSubmit) {
                document.getElementById('new-request-btn').addEventListener('click', () => {
                    currentRequest = null;
                    renderApplicationTab();
                });
            }
        }
    }

    function renderConfirmationTab() {
        if (!currentRequest) {
            container.innerHTML = `
                <div class="confirmation-content center-content">
                    <p>Вы ещё не подали заявку. Перейдите на вкладку «Заявка», чтобы оформить заявку на практику.</p>
                </div>
            `;
            return;
        }

        const statusCode = currentRequest.status?.code || 'unknown';
        const statusName = currentRequest.status?.name || getStatusText(statusCode);
        const message = getConfirmationMessage(statusCode);
        const reason = currentRequest.reason ? `<p><strong>Причина:</strong> ${currentRequest.reason}</p>` : '';

        container.innerHTML = `
            <div class="confirmation-content">
                <p class="application-main-text">Статус заявки: ${statusName}</p>
                <p>${message}</p>
                ${statusCode === 'rejected' ? reason : ''}
                ${statusCode === 'pending' ? `<button class="application-button-cancel" id="cancel-request-confirm">Отменить заявку</button>` : ''}
            </div>
        `;
        if (statusCode === 'pending') {
            document.getElementById('cancel-request-confirm').addEventListener('click', handleCancelRequest);
        }
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
                    <p><strong>Профиль практиканта:</strong> <a href="practicant.html" class="practicant-profile">Ссылка</a></p>
                    <p><strong>Начало практики:</strong> ${formatDate(currentRequest.start_date)}</p>
                    <p><strong>Место обучения:</strong>${currentRequest.city}</p>
                    <p><strong>Чат группы:</strong> <a href="#" class="practice-infochat">Ссылка</a></p>
                </div>
            </div>
        `;
    }

    function setActiveTab(tabName) {
        document.querySelectorAll('.navigation-bottom a').forEach(link => link.classList.remove('active'));
        const activeLink = document.getElementById(tabName);
        if (activeLink) activeLink.classList.add('active');
    }

    function switchTab(tabName) {
        currentTab = tabName;
        setActiveTab(tabName);
        switch (tabName) {
            case 'application': renderApplicationTab(); break;
            case 'confirmation': renderConfirmationTab(); break;
            case 'practice': renderPracticeTab(); break;
        }
    }

    async function handleSubmitRequest(e) {
        if (rejectedCount >= 2) {
            showNotification('Вы не можете подать заявку, так как исчерпали лимит попыток (2 отклонённые заявки).', 'error');
            return;
        }

        const surname = document.getElementById('app-surname').value.trim();
        const name = document.getElementById('app-name').value.trim();
        const patronymic = document.getElementById('app-patronymic').value.trim();
        const city = document.getElementById('app-city').value;
        const specialization = document.getElementById('app-specialization').value.trim();
        const course = parseInt(document.getElementById('app-course').value.trim(), 10);
        const startDate = document.getElementById('app-start-date').value;
        const endDate = document.getElementById('app-end-date').value;

        if (!surname || !name || !specialization || isNaN(course) || course < 1 || course > 10 || !startDate || !endDate) {
            showNotification('Пожалуйста, заполните все обязательные поля (Фамилия, Имя, Направление, Курс (1-10), Даты начала и окончания).', 'error');
            return;
        }

        const requestData = {
            surname,
            name,
            patronymic: patronymic || null,
            city: city,
            specialization,
            course,
            start_date: startDate,
            end_date: endDate,
        };

        const result = await createRequest(requestData);
        if (result.success) {
            await loadRequests();
            showNotification('Заявка успешно создана!', 'success');
            switchTab('confirmation');
        } else {
            if (result.errors) {
                const errorMessages = Object.values(result.errors).flat();
                showNotification(errorMessages.join('\n'), 'error');
            } else {
                showNotification(result.message, 'error');
            }
        }
    }

    async function handleCancelRequest() {
        if (!currentRequest) return;
        const confirmCancel = confirm('Вы уверены, что хотите отменить заявку?');
        if (!confirmCancel) return;

        const result = await updateRequestStatus(currentRequest.id, 'canceled');
        if (result.success) {
            await loadRequests();
            showNotification('Заявка отменена.', 'success');
            switchTab('confirmation');
        } else {
            showNotification(result.message, 'error');
        }
    }

    //Инициализация
    await loadRequests();
    switchTab('application');

    appLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('application');
    });
    confLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('confirmation');
    });
    practLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('practice');
    });
});

//Выход из системы
async function logoutUser() {
    const result = await apiRequest('/logout', 'POST');
    return result.ok;
}

//Попап профиля
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