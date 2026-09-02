async function load() {
  const [layoutRes, hostsRes] = await Promise.all([
    fetch("/api/layout"),
    fetch("/api/hosts")
  ]);

  const layout = await layoutRes.json();
  const hosts = await hostsRes.json();

  render(layout, hosts);
}
const footerTime = document.getElementById("last-update");

const HOST_COLORS = {
  "Zone_23769": "hsl(56, 100%, 50%)", // Standart Zone_23769
  "Zone_23811": "#ff248a",          // VIP solo/duo Zone_23811
  "Zone_23810": "#ff0f0f",          // Bootcamp Zone_23810
  "Zone_23957": "#7441ff",          // PS5 Pro Zone_23957
  "Zone_23770": "#ff6600",          // Comfort Zone_23770
  "Zone_23956": "#ff00ea",          // StreamRoom Zone_23956
  DEFAULT: "#58585865"
};

function hostColor(host) {
  const base = HOST_COLORS[host.group.title] || HOST_COLORS.DEFAULT;
  const active = host.client_sessions && host.client_sessions.length > 0;
  return {
    bg: base,
    opacity: active ? 0.2 : 1,
    border: "#ffffff00"
  };
}

function render(layout, hosts) {
  const map = document.getElementById("map");
  map.innerHTML = "";

  const { rows, cols, cell_size } = layout.meta;

  map.style.gridTemplateColumns = `repeat(${cols}, ${cell_size}px)`;

  const cellIndex = {};
  layout.cells.forEach(c => {
    cellIndex[`${c.x}:${c.y}`] = c;
  });

  const PC_OFFSET_X = -1;
  const PC_OFFSET_Y = -1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = document.createElement("div");
      cell.className = "map-cell";

      const data = cellIndex[`${x}:${y}`];
      if (data?.type === "wall") {
        cell.classList.add(`wall-${data.wall_type}`);
      }

      const pc = hosts.find(
        h =>
          h.coord_x + PC_OFFSET_X === x &&
          h.coord_y + PC_OFFSET_Y === y
      );

      if (pc) {
        const { bg, opacity, border } = hostColor(pc);

        const card = document.createElement("div");
        card.className = "host-card";
        card.innerHTML = ""; // Полностью очищаем структуру перед сборкой

        // Строка 1: Крупный номер компьютера (30px)
        const nameDiv = document.createElement("div");
        nameDiv.className = "host-name";
        nameDiv.textContent = pc.position;
        card.appendChild(nameDiv);

        // Строка 2: Маленький блок бронирования (15px), если бронь есть
        if (pc.isBooked && pc.bookingTime) {
          const bookingDiv = document.createElement("div");
          bookingDiv.className = "host-booking";
          bookingDiv.textContent = `🕔`;
          
          card.appendChild(bookingDiv);
        }

        // Применяем стили отображения
        card.style.background = bg;
        card.style.opacity = opacity;
        card.style.border = `1px solid rgba(0, 0, 0, 0.25)`;
        card.style.setProperty('--host-glow-color', bg); 
        
        cell.appendChild(card);
      }


        map.appendChild(cell);
      }
  }
   footerTime.textContent = "Обновлено: " + new Date().toLocaleString();
}

function updatePriceImage() {
  const priceImage = document.getElementById('price-image');
  const now = new Date();
  const day = now.getDay(); // 0 — воскресенье, 1 — понедельник, ..., 6 — суббота
  const hours = now.getHours();

  let imagePath = '/src/price1.jpg'; // картинка по умолчанию

  // Будни (понедельник–пятница: 1–5)
  if (day >= 1 && day <= 5) {
    if (hours >= 8 && hours < 15) {
      imagePath = '/src/price1.jpg'; // пн‑пт, 8:00–14:59
    } else {
      imagePath = '/src/price2.jpg'; // пн‑пт, 15:00–7:59 следующего дня
    }
  }
  // Выходные (суббота–воскресенье: 6–0)
  else {
    if (hours >= 8 && hours < 15) {
      imagePath = '/src/price3.jpg'; // выходные, 8:00–14:59
    } else {
      imagePath = '/src/price4.jpg'; // выходные, 15:00–7:59 следующего дня
    }
  }

  priceImage.src = imagePath;
}

// --------------------------------------таблица
async function loadGoogleSheetData() {
  try {
    const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSfPhf2dny84ZFHaGPOYdcOtwUlKdMopzjAXC2AozGOWkCLJh7iWaTp3uDr7ysJu1Enkp5ZsHZaJFQs/pub?gid=1975467084&single=true&output=csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    return [];
  }
}


function parseCSV(csv) {
  const results = Papa.parse(csv, {
    header: false,   // ❗ ВАЖНО
    skipEmptyLines: false
  });
  return results.data;
}


function renderTable(data) {
  const tableContainer = document.getElementById('table-container');

  const table = document.createElement('table');
  table.className = 'google-sheet-table';

  if (data.length === 0) return;

  // Заголовок (первая строка)
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  data[0].forEach(cell => {
    const th = document.createElement('th');
    th.textContent = cell || '';
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Тело
  const tbody = document.createElement('tbody');

  for (let i = 1; i < data.length; i++) {
    const tr = document.createElement('tr');

    data[i].forEach(cell => {
      const td = document.createElement('td');
      td.textContent = cell || '';
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  tableContainer.innerHTML = '';
  tableContainer.appendChild(table);
}

async function updateTable() {
  const data = await loadGoogleSheetData();
  renderTable(data);
}

// Запускаем при загрузке страницы
updateTable();

// Обновляем каждые 5 секунд (5000 мс)
setInterval(updateTable, 5000);



// Запускаем при загрузке страницы
updatePriceImage();

// Обновляем каждые 5 минут (300 000 мс), чтобы не пропустить смену времени
setInterval(updatePriceImage, 60000);


load();
setInterval(load, 5000);
