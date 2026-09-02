// smartshell.js

// Вставьте сюда длинную строку, которую вы получили в ответе (access_token)
const SMART_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55X2lkIjo5MjkzLCJleHBpcmVzIjo4NjQwMCwiaXNzdWVkIjoxNzg4MzIxMjMyLCJyZWZyZXNoX3Rva2VuIjoiTU1tRENlajlOcE9IR05OM2d2bm9ZcXRXazNJdllJNWxjRmF4WGRxN280bWQzSzZUaGZRQ1ZSSDFTT2FFajVVZVlRSkNRSk5TYjZJcExsME9FRHhWWjNQbFFtZDQzVm0wSDdNSyIsInRva2VuIjoienpEV2VmTERIeTh4WW42R09QOERMS0REN0tUTUxwQUJlS0ZxRm5XTGliNEpqME5LNW1MdFF4Z2picHJ3cFJOMHM4QncyZEtkSWVUb3p2aDUifQ.DxxvDnTr7mE39r0zQeUaRFWzfAFERMlyXzEy7b06LsY8B4j1CMFy9USwsqtXOQm1MRVTx5nCj1I_zFVHetTPfQneofTL_dB19UHAsEsb1FRZliFrw_xZ5pgytXZDiHaCVOIev5_uE_qJhBqvwEaxqanmh_VqPitqBUnMLjlNChK9kdQLmw8YSElqEDtyglRtVeqWDvUYmAHwaRmnIGUrs-zx9j5oN5YhR0pLnkPtea87FW3aDK6kiWFwt4o-0Z16NdQQ-h40ZRIRSNySaV1Zg-5pPQiwU8khhxZ4TGhqqp6-EnkOjY-X6iKep3CnAFDyQdbXfbDI069a5M31TY2GRw"; 


// Полный точный рабочий адрес GraphQL-шлюза
const API_URL = "https://billing.smartshell.gg/api/graphql";

export const shell = {
  api: {
    /**
     * Запрос списка компьютеров (хостов) клуба
     */
    async hosts() {
      try {
        // Запрос приведён в строгое соответствие с документацией SmartShell API
        // Внутри файла smartshell.js замените структуру query:

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
            "Authorization": `Bearer ${SMART_TOKEN}`
          },
          body: JSON.stringify({ 
            query,
            operationName: "hostsOverview"
          })
        });

        const text = await response.text();
        
        if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
          throw new Error("Сервер вернул заглушку HTML вместо JSON. Проверьте токен.");
        }

        const result = JSON.parse(text);

        if (result.errors) {
          throw new Error(`Ошибка GraphQL: ${JSON.stringify(result.errors)}`);
        }

        // Извлекаем массив хостов из ответа
        return result.data?.hostsOverview || [];

      } catch (error) {
        console.error("❌ Ошибка в модуле smartshell.js:", error.message);
        throw error;
      }
    }
  }
};

console.log("🚀 Карта подключена напрямую через готовый токен авторизации");
