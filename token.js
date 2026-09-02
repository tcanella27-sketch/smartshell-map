const API_URL = 'https://billing.smartshell.gg/api/graphql';

const mutation = `
  mutation login($input: LoginInput!) {
    login(input: $input) {
      access_token
    }
  }
`;

const variables = {
  input: {
    login: "телефон",
    password: "пароль", // Поменяйте на ваш реальный пароль
    company_id: 9293
  }
};

async function getTokenInCMD() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Этот заголовок заставит сервер думать, что запрос идет из обычного браузера Chrome
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        operationName: 'login',
        variables: variables,
        query: mutation
      })
    });

    // Проверяем, вернулся ли HTML вместо JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textError = await response.text();
      console.error('❌ Сервер заблокировал запрос консоли и вернул HTML-страницу защиты.');
      console.log('Попробуйте запустить скрипт с VPN или проверьте пароль.');
      return;
    }

    const result = await response.json();

    if (result.errors) {
      console.error('❌ Ошибка GraphQL:', result.errors[0].message);
      return;
    }

    const token = result.data?.login?.access_token;

    if (token) {
      console.log('✅ Токен успешно получен в CMD:\n');
      console.log(token);
    } else {
      console.log('⚠️ Токен пустой. Ответ:', result);
    }

  } catch (error) {
    console.error('❌ Сбой выполнения:', error.message);
  }
}

getTokenInCMD();
