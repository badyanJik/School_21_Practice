const API_BASE = 'https://school21test.strangled.net/api';

/**
 * Функция для запросов к API
 */
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

/**
 * Регистрация нового пользователя
 */
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

/**
 * Авторизация пользователя
 */
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

/**
 * Отправка кода подтверждения на почту
 */
async function sendVerificationCode() {
    const result = await apiRequest('/email-verify-code', 'POST');
    if (result.ok) {
        return { success: true };
    } else {
        const message = result.data?.message || 'Ошибка отправки кода';
        return { success: false, message };
    }
}

/**
 * Проверка кода подтверждения
 */
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

//ОБРАБОТЧИКИ СТРАНИЦ

document.addEventListener('DOMContentLoaded', function() {
    //РЕГИСТРАЦИЯ
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const passwordConfirmInput = document.getElementById('reg-password-confirm');
        const checkbox = document.getElementById('agree');
        const submitBtn = document.getElementById('register-submit');

        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            //валидация
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;

            if (!email || !validateEmail(email)) {
                alert('Введите корректный email (например, user@example.com)');
                return;
            }

            if (!password || !validatePassword(password)) {
                alert('Пароль должен содержать минимум 8 символов, буквы (верхний и нижний регистр) и цифры.');
                return;
            }

            if (password !== passwordConfirm) {
                alert('Пароли не совпадают');
                return;
            }

            if (!checkbox.checked) {
                alert('Необходимо согласиться на обработку персональных данных');
                return;
            }

            //отправка на сервер
            const result = await registerUser(email, password, passwordConfirm);
            if (result.success) {
                // сохраняем email для страницы верификации
                sessionStorage.setItem('registrationEmail', email);
                // Отправляем код подтверждения сразу после регистрации
                const codeResult = await sendVerificationCode();
                if (codeResult.success) {
                    alert('Регистрация успешна! Код подтверждения отправлен на почту.');
                } else {
                    alert('Регистрация успешна, но не удалось отправить код. На странице верификации вы сможете запросить его повторно.');
                }
                window.location.href = 'verification.html';
            } else {
                if (result.errors && result.errors.email) {
                    alert(result.errors.email[0]);
                } else if (result.errors && result.errors.password) {
                    alert(result.errors.password[0]);
                } else {
                    alert(result.message);
                }
            }
        });
    }

    //АВТОРИЗАЦИЯ
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const submitBtn = document.getElementById('login-submit');

        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !validateEmail(email)) {
                alert('Введите корректный email');
                return;
            }
            if (!password) {
                alert('Введите пароль');
                return;
            }

            const result = await loginUser(email, password);
            if (result.success) {
                alert('Вход выполнен успешно!');
                // window.location.href = 'dashboard.html'; // пока нет такой страницы
            } else {
                alert(result.message);
            }
        });
    }

    //ВЕРИФИКАЦИЯ
    const verificationForm = document.getElementById('verification-form');
    if (verificationForm) {
        const codeInput = document.getElementById('code-input');
        const verifyBtn = document.getElementById('verify-btn');
        const resendLink = document.getElementById('resend-code');
        // Подтверждение кода
        verifyBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const code = codeInput.value.trim();
            if (code.length !== 6 || isNaN(code)) {
                alert('Введите 6-значный числовой код');
                return;
            }
            const result = await verifyEmail(code);
            if (result.success) {
                alert('Email подтверждён! Теперь вы можете войти.');
                window.location.href = 'authorization.html';
            } else {
                alert(result.message);
            }
        });
        // Повторная отправка кода
        resendLink.addEventListener('click', async function(e) {
            e.preventDefault();
            const result = await sendVerificationCode();
            if (result.success) {
                alert('Код отправлен повторно на вашу почту');
            } else {
                alert(result.message);
            }
        });
    }
});