const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');

// Токен бота:
const BOT_TOKEN = '8666571392:AAEu-Lhw5Sys_75WHszLzJXsX0pLVdCpxLw';

// Внимание: когда задеплоишь фронтенд на Vercel (например https://alina-nails-web.vercel.app),
// вставь адрес своего сайта в эту переменную.
// До тех пор, кнопка не будет открывать актуальную версию в интернете.
const WEB_APP_URL = 'https://alina-nails-web-app.vercel.app'; // <--- ТВОЙ РЕАЛЬНЫЙ АДРЕС

const bot = new Telegraf(BOT_TOKEN);

// Простая база данных в файле JSON
const DATA_FILE = path.join(__dirname, 'data.json');
let db = {
    adminChatId: null,
    orders: [],
    bookedSlots: {}
};

// Загрузка данных при старте
try {
    if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        db = JSON.parse(raw);
    }
} catch (e) {
    console.error('Ошибка загрузки базы данных:', e);
}

function saveDb() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// Обработчик команды /start
bot.start((ctx) => {
    // Передаем занятые слоты в URL
    const url = `${WEB_APP_URL}?booked=${encodeURIComponent(JSON.stringify(db.bookedSlots))}`;
    
    ctx.reply(
        'Привет! Я виртуальный ассистент Alina Nails 💅\n\nНажми на кнопку ниже, чтобы выбрать услугу, удобное время и записаться на маникюр.',
        Markup.keyboard([
            Markup.button.webApp("💅 Онлайн-запись", url)
        ]).resize()
    );
});

// Команда для админа: получить все заявки
bot.hears('Order', (ctx) => {
    // Сохраняем ID чата как админский
    db.adminChatId = ctx.chat.id;
    saveDb();
    
    if (db.orders.length === 0) {
        return ctx.reply('Пока нет ни одной заявки.\n\n✅ Теперь вы назначены администратором и будете получать сюда уведомления о новых заказах!');
    }
    
    let ordersList = '<b>📋 Список всех заявок:</b>\n\n';
    db.orders.forEach((o, i) => {
        ordersList += `<b>${i + 1}.</b> ${o.date} в ${o.time}\n👤 ${o.user} (${o.phone})\n💅 ${o.service}\n💰 ${o.total} MDL\n\n`;
    });
    
    ctx.reply(ordersList, { parse_mode: 'HTML' });
    ctx.reply('✅ Вы назначены администратором. Новые заявки будут приходить прямо в этот чат!');
});

// Этот обработчик "ловит" информацию, которая приходит от React-приложения 
// после вызова tg.sendData(JSON.stringify(bookingData))
bot.on('web_app_data', (ctx) => {
    try {
        // Данные приходят в виде строки JSON, парсим их
        const data = JSON.parse(ctx.webAppData.data.text());
        
        // Запоминаем выбранное время
        if (!db.bookedSlots[data.date]) {
            db.bookedSlots[data.date] = [];
        }
        if (!db.bookedSlots[data.date].includes(data.time)) {
            db.bookedSlots[data.date].push(data.time);
        }
        
        // Добавляем заказ в базу
        db.orders.push(data);
        saveDb();
        
        // Формируем красивое сообщение для мастера (тебя)
        const message = `
🔔 <b>Новая заявка на маникюр!</b>

👤 <b>Имя:</b> ${data.user}
📱 <b>Телефон:</b> ${data.phone}

💅 <b>Услуга:</b> ${data.service}
📏 <b>Длина:</b> ${data.length || 'Не указана'}
📸 <b>Пример (референс):</b> ${data.hasPhoto ? 'Есть (спросить у клиента)' : 'Нет'}

📅 <b>Дата:</b> ${data.date}
⏰ <b>Время:</b> ${data.time}

💰 <b>Итоговая сумма:</b> ${data.total} MDL
        `;

        // Отправляем уведомление обладателю бота (если он уже написал 'Order')
        if (db.adminChatId) {
            bot.telegram.sendMessage(db.adminChatId, message, { parse_mode: 'HTML' }).catch(err => {
                console.error('Ошибка отправки админу:', err);
            });
        }
        
        // Благодарим пользователя (так как бот отвечает в тот же чат)
        ctx.reply('Спасибо! Ваша заявка принята. Ожидайте подтверждения 🌺');

        // Обновляем кнопку для текущего пользователя, чтобы следующее открытие имело новые занятые часы
        const newUrl = `${WEB_APP_URL}?booked=${encodeURIComponent(JSON.stringify(db.bookedSlots))}`;
        ctx.reply('Для новой записи или просмотра свободного времени воспользуйтесь обновленной кнопкой ниже:',
            Markup.keyboard([
                Markup.button.webApp("💅 Онлайн-запись", newUrl)
            ]).resize()
        );

    } catch (e) {
        console.error('Ошибка при обработке данных WebApp:', e);
        ctx.reply('❌ Произошла ошибка при обработке заявки. Пожалуйста, попробуйте еще раз.');
    }
});

bot.launch().then(() => {
    console.log('✅ Бот успешно запущен и работает!');
    console.log('Перейдите в телеграм к своему боту и напишите /start');
    console.log('Затем напишите слово Order, чтобы стать администратором и получать уведомления.');
});

// Плавная остановка (Best Practice)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
