

// Полный точный рабочий адрес GraphQL-шлюза
const API_URL = "https://billing.smartshell.gg/api/graphql";

// Данные для ПЕРВОГО входа (замените на ваши реальные данные)
const AUTH_VARIABLES = {
  input: {
    login: "79957933647",    // Ваш логин/телефон
    password: "12345678",   // Ваш реальный пароль
    company_id: 9293    // ID компании
  }
};

// Мутация для ПЕРВОГО входа (запрашиваем access_token И refresh_token)
const LOGIN_MUTATION = `
  mutation login($input: LoginInput!) {
    login(input: $input) {
      access_token
      refresh_token
    }
  }
`;

// Мутация для ПОСЛЕДУЮЩЕГО обновления токена через рефреш-токен
const REFRESH_MUTATION = `
  mutation refreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      token_type
      expires_in
      access_token
      refresh_token
    }
  }
`;

// Переменные в оперативной памяти для хранения актуальных ключей
let SMART_ACCESS_TOKEN = null;
let SMART_REFRESH_TOKEN = null;

/**
 * Безопасное чтение JSON ответа с проверкой на HTML-блокировки сервера
 */
async function safeParseJson(response, contextName) {
  const text = await response.text();
  
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    console.error(`❌ ${contextName}: Сервер SmartShell заблокировал запрос (WAF/Cloudflare) и вернул HTML-страницу защиты.`);
    console.log("👉 Решение: Проверьте правильность login/password или попробуйте запустить сервер с включенным VPN.");
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`❌ ${contextName}: Не удалось распарсить JSON. Ответ сервера:`, text.substring(0, 200));
    return null;
  }
}

/**
 * 1. Функция ПЕРВОГО входа по логину и паролю
 */
async function loginWithPassword() {
  try {
    console.log("⏳ [SmartShell Auth] Первый вход по логину и паролю...");
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        operationName: 'login',
        variables: AUTH_VARIABLES,
        query: LOGIN_MUTATION
      })
    });

    const result = await safeParseJson(response, "[SmartShell Auth]");
    if (!result) return false;

    if (result.errors) {
      console.error('❌ [SmartShell Auth] Ошибка GraphQL при логине:', result.errors?.message || result.errors);
      return false;
    }

    const { access_token, refresh_token } = result.data?.login || {};

    if (access_token && refresh_token) {
      SMART_ACCESS_TOKEN = access_token;
      SMART_REFRESH_TOKEN = refresh_token;
      console.log('✅ [SmartShell Auth] Первичные токены успешно получены.');
      return true;
    }
    
    console.warn('⚠️ [SmartShell Auth] Ответ получен, но токены пусты. Проверьте AUTH_VARIABLES.');
    return false;
  } catch (error) {
    console.error('❌ [SmartShell Auth] Сбой сети при логине:', error.message);
    return false;
  }
}

/**
 * 2. Функция ОБНОВЛЕНИЯ токена через мутацию refreshToken
 */
async function refreshCurrentToken() {
  if (!SMART_REFRESH_TOKEN) {
    return await loginWithPassword();
  }

  try {
    console.log("⏳ [SmartShell Auth] Автоматическое обновление токена через refreshToken...");

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        operationName: 'refreshToken',
        query: REFRESH_MUTATION,
        variables: {
          input: {
            refresh_token: SMART_REFRESH_TOKEN
          }
        }
      })
    });

    const result = await safeParseJson(response, "[SmartShell Refresh]");
    if (!result) {
      console.log('🔄 Пробуем выполнить резервный вход через пароль...');
      return await loginWithPassword();
    }

    if (result.errors) {
      console.error('❌ [SmartShell Auth] Ошибка при вызове refreshToken:', result.errors?.message || result.errors);
      console.log('🔄 Пробуем выполнить резервный вход через пароль...');
      return await loginWithPassword(); 
    }

    const { access_token, refresh_token } = result.data?.refreshToken || {};

    if (access_token && refresh_token) {
      SMART_ACCESS_TOKEN = access_token;
      SMART_REFRESH_TOKEN = refresh_token; // API выдает новый refresh_token, перезаписываем его на будущее
      console.log('✅ [SmartShell Auth] Токены успешно обновлены через мутацию refreshToken.');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ [SmartShell Auth] Сбой сети при обновлении токена:', error.message);
    return false;
  }
}

/**
 * Инициализация цепочки авторизации при старте скрипта
 */
async function startAuthLoop() {
  // Сначала жестко логинимся
  await loginWithPassword();

  // Затем настраиваем интервал обновления (каждые 23 часа)
  const TWENTY_THREE_HOURS = 23 * 60 * 60 * 1000;
  setInterval(async () => {
    await refreshCurrentToken();
  }, TWENTY_THREE_HOURS);
}

// Запускаем процесс авторизации в фоне
startAuthLoop();


export const shell = {
  api: {
    /**
     * Запрос списка компьютеров (хостов) клуба
     */
    async hosts() {
      try {
        // Защита: если токен еще не успел загрузиться, пробуем получить его экстренно
        if (!SMART_ACCESS_TOKEN) {
          console.warn("⚠️ Токен отсутствует. Пытаемся авторизоваться перед запросом...");
          const success = await loginWithPassword();
          if (!success) {
            throw new Error("Запрос отклонен: нет рабочего токена авторизации.");
          }
        }

        const query = `
          query hostsOverview {
            hostsOverview {
              id
              alias
              coord_x
              coord_y
              group_id
              client_sessions {
                id
              }
              bookings {
                id
                from
                to
                startsIn
              }
            }
          }
        `;

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Authorization": `Bearer ${SMART_ACCESS_TOKEN}` // Динамический access_token из оперативной памяти
          },
          body: JSON.stringify({ 
            query,
            operationName: "hostsOverview"
          })
        });

        const text = await response.text();
        
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          throw new Error("Сервер вернул заглушку HTML вместо списка хостов. Сессия заблокирована WAF.");
        }

        const result = JSON.parse(text);

        if (result.errors) {
          throw new Error(`Ошибка GraphQL: ${JSON.stringify(result.errors)}`);
        }

        return result.data?.hostsOverview || [];

      } catch (error) {
        console.error("❌ Ошибка в модуле smartshell.js при запросе хостов:", error.message);
        throw error;
      }
    }
  }
};

console.log("🚀 Модуль SmartShell успешно инициализирован с использованием пары Access/Refresh токенов");
