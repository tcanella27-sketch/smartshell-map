import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { shell } from "./smartshell.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- layout.json ---------- */

const layoutPath = path.join(__dirname, "layout.json");
let layout = null;

function loadLayout() {
  try {
    const raw = fs.readFileSync(layoutPath, "utf-8");
    layout = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Ошибка чтения layout.json:", err.message);
    layout = { meta: { club_id: 9293, rows: 21, cols: 13 }, cells: [] };
  }
}

loadLayout();

/* ---------- API ---------- */

// карта / стены
app.get("/api/layout", (req, res) => {
  res.json(layout);
});

// компьютеры клуба

// компьютеры клуба в server.js
app.get("/api/hosts", async (req, res) => {
  try {
    const smartHosts = await shell.api.hosts();
    
    // Получаем временные границы сегодняшнего дня
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfToday = startOfToday + 24 * 60 * 60 * 1000;

    const formattedHosts = smartHosts.map(host => {
      const sessions = host.client_sessions || [];
      const bookings = host.bookings || [];

      // Ищем бронь на сегодняшний день
      const todayBooking = bookings.find(b => {
        const bookingStart = new Date(b.from).getTime();
        return bookingStart >= startOfToday && bookingStart <= endOfToday;
      });

      let bookingTimeStr = null;
      if (todayBooking) {
        const start = new Date(todayBooking.from);
        const end = new Date(todayBooking.to);
        
        // Вычисляем длительность сеанса в часах
        const durationHours = Math.round((end - start) / (1000 * 60 * 60));
        
        // Форматируем время старта бронирования (например, "18:30")
        const startHours = String(start.getHours()).padStart(2, '0');
        const startMinutes = String(start.getMinutes()).padStart(2, '0');
        
        bookingTimeStr = `${startHours}:${startMinutes} (${durationHours}ч)`;
      }
      
      return {
        id: host.id,
        position: host.alias, 
        coord_x: host.coord_x,
        coord_y: host.coord_y,
        group: {
          title: host.group_id ? `Zone_${host.group_id}` : "DEFAULT"
        },
        client_sessions: sessions,
        plannedFinishAt: null,
        
        // Новые свойства для фронтенда карты
        isBooked: !!todayBooking,
        bookingTime: bookingTimeStr
      };
    });

    res.json(formattedHosts);
  } catch (e) {
    console.error("HOSTS ENDPOINT ERROR:", e.message);
    res.status(500).json({ error: "hosts failed", details: e.message });
  }
});



app.listen(3000, () => {
  console.log("✅ Server started:");
  console.log("👉 http://localhost:3000");
});
