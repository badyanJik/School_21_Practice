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

//Регистрация нового пользователя
async function registerUser(email, password, passwordConfirmation) {
    const result = await apiRequest('/register', 'POST', {
        email,
        password,
        password_confirmation: passwordConfirmation,
    });

    if (result.ok) {
        return { success: true };
    } else {
        const message = result.data?.message || 'Ошибка регистрации';
        const errors = result.data?.errors || {};
        return { success: false, message, errors };
    }
}


//Авторизация пользователя
async function loginUser(email, password) {
    const result = await apiRequest('/login', 'POST', {
        email,
        password,
    });

    if (result.ok) {
        return { success: true };
    } else {
        const message = result.data?.message || 'Ошибка входа';
        return { success: false, message };
    }
}

//Отправка кода подтверждения на почту
async function sendVerificationCode() {
    const result = await apiRequest('/email-verify-code', 'POST');
    if (result.ok) {
        return { success: true };
    } else {
        const message = result.data?.message || 'Ошибка отправки кода';
        return { success: false, message };
    }
}

//Проверка кода подтверждения
async function verifyEmail(code) {
    const result = await apiRequest('/verify-email', 'POST', { code });
    if (result.ok) {
        return { success: true };
    } else {
        const message = result.data?.message || 'Неверный или просроченный код';
        return { success: false, message };
    }
}

//ВАЛИДАЦИЯ
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePassword(password) {
    //минимум 8 символов, буквы, цифры, верхний и нижний регистр
    const minLength = password.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    return minLength && hasLetters && hasNumbers && hasMixedCase;
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

//Защита от брутфорса
function getLoginAttempts() {
    return parseInt(sessionStorage.getItem('loginAttempts') || '0', 10);
}

function incrementLoginAttempts() {
    const current = getLoginAttempts();
    sessionStorage.setItem('loginAttempts', String(current + 1));
}

function resetLoginAttempts() {
    sessionStorage.removeItem('loginAttempts');
}

//Обработчики
document.addEventListener('DOMContentLoaded', function() {
    //Регистрация
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const passwordConfirmInput = document.getElementById('reg-password-confirm');
        const checkbox = document.getElementById('agree');
        const submitBtn = document.getElementById('register-submit');

        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;

            if (!email || !validateEmail(email)) {
                showNotification('Введите корректный email (например, user@example.com)', 'error');
                return;
            }
            if (!password || !validatePassword(password)) {
                showNotification('Пароль должен содержать минимум 8 символов, буквы (верхний и нижний регистр) и цифры.', 'error');
                return;
            }
            if (password !== passwordConfirm) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            if (!checkbox.checked) {
                showNotification('Необходимо согласиться на обработку персональных данных', 'error');
                return;
            }

            const result = await registerUser(email, password, passwordConfirm);
            if (result.success) {
                sessionStorage.setItem('registrationEmail', email);
                const codeResult = await sendVerificationCode();
                if (codeResult.success) {
                    showNotification('Регистрация успешна! Код подтверждения отправлен на почту.', 'success');
                } else {
                    showNotification('Регистрация успешна, но не удалось отправить код. Запросите повторно на странице верификации.', 'error');
                }
                window.location.href = 'verification.html';
            } else {
                if (result.errors && result.errors.email) {
                    showNotification(result.errors.email[0], 'error');
                } else if (result.errors && result.errors.password) {
                    showNotification(result.errors.password[0], 'error');
                } else {
                    showNotification(result.message, 'error');
                }
            }
        });
    }

    // Авторизация
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const submitBtn = document.getElementById('login-submit');

        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            //Проверка на брутфорс
            const attempts = getLoginAttempts();
            if (attempts >= 5) {
                showNotification('Слишком много попыток входа. Попробуйте через 30 секунд.', 'error');
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.6';
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    resetLoginAttempts();
                }, 30000);
                return;
            }

            if (!email || !validateEmail(email)) {
                showNotification('Введите корректный email', 'error');
                return;
            }
            if (!password) {
                showNotification('Введите пароль', 'error');
                return;
            }

            const result = await loginUser(email, password);
            if (result.success) {
                resetLoginAttempts();
                showNotification('Вход выполнен успешно!', 'success');
                sessionStorage.setItem('userEmail', email);
                window.location.href = 'application.html';
            } else {
                //Очищаем пароль и увеличиваем счётчик попыток
                passwordInput.value = '';
                incrementLoginAttempts();
                showNotification(result.message, 'error');
            }
        });
    }

    //ВЕРИФИКАЦИЯ
    const verificationForm = document.getElementById('verification-form');
    if (verificationForm) {
        const codeInput = document.getElementById('code-input');
        const verifyBtn = document.getElementById('verify-btn');
        const resendLink = document.getElementById('resend-code');

        verifyBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const code = codeInput.value.trim();
            if (code.length !== 6 || isNaN(code)) {
                showNotification('Введите 6-значный числовой код', 'error');
                return;
            }
            const result = await verifyEmail(code);
            if (result.success) {
                showNotification('Email подтверждён! Теперь вы можете войти.', 'success');
                window.location.href = 'authorization.html';
            } else {
                showNotification(result.message, 'error');
            }
        });

        resendLink.addEventListener('click', async function(e) {
            e.preventDefault();
            const result = await sendVerificationCode();
            if (result.success) {
                showNotification('Код отправлен повторно на вашу почту', 'success');
            } else {
                showNotification(result.message, 'error');
            }
        });
    }
});