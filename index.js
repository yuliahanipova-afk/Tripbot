import dotenv from "dotenv";
import { Telegraf, Markup } from "telegraf";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

dotenv.config();

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

if (!telegramToken) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN in Railway Variables");
}

if (!openaiKey) {
  throw new Error("Missing OPENAI_API_KEY in Railway Variables");
}

const bot = new Telegraf(telegramToken);

const openai = new OpenAI({
  apiKey: openaiKey,
});

const mainMenu = Markup.keyboard([
  ["🗺 Маршруты", "🍸 Куда сегодня"],
  ["🎭 События", "🌿 За город"],
  ["💕 Для двоих", "☕ Кофе / гастро"],
  ["🏛 Культура", "🌙 После работы"],
  ["✨ Случайный вайб", "⚙️ Профиль"],
]).resize();

const menus = {
  "🗺 Маршруты": {
    title: "🗺 Маршруты",
    text: "Выбери формат маршрута:",
    buttons: [
      ["Вечерний маршрут", "Маршрут на выходной"],
      ["Полный day-trip", "Slow weekend"],
      ["Архитектурный", "Гастро-маршрут"],
      ["Арт и выставки", "Вода / набережные"],
      ["Hidden gems", "Ночной маршрут"],
      ["Сезонный маршрут"],
    ],
  },
  "🍸 Куда сегодня": {
    title: "🍸 Куда сегодня",
    text: "Быстрый выбор на сегодня:",
    buttons: [
      ["Где поужинать", "Красивый бар"],
      ["Вино", "Терраса"],
      ["Живая музыка", "Танцы"],
      ["Спокойный вечер", "Что открыть нового"],
      ["До 2000 ₽", "Без брони"],
      ["До 20 минут от меня"],
    ],
  },
  "🎭 События": {
    title: "🎭 События",
    text: "Что ищем?",
    buttons: [
      ["Сегодня", "На выходных"],
      ["Бесплатно", "Концерты"],
      ["Выставки", "Маркеты"],
      ["Кино", "Театр"],
      ["Лекции", "Open air"],
      ["Фестивали", "Поп-апы"],
    ],
  },
  "🌿 За город": {
    title: "🌿 За город",
    text: "Какой формат за городом?",
    buttons: [
      ["До 1 часа", "До 2 часов"],
      ["На электричке", "На машине"],
      ["У воды", "Лес / природа"],
      ["Маленькие города", "Спа"],
      ["Эко-отели", "Архитектура"],
      ["Усадьбы", "Slow life"],
      ["Weekend getaway"],
    ],
  },
  "💕 Для двоих": {
    title: "💕 Для двоих",
    text: "Сценарии для совместного досуга с Никитой:",
    buttons: [
      ["Красивый вечер", "Очень атмосферно"],
      ["Уютно и тихо", "Slow life"],
      ["Прогулка + ужин", "Вино и разговоры"],
      ["Ночной город", "Rooftop"],
      ["Мини-путешествие", "За город вдвоем"],
      ["Weekend escape", "Красиво в дождь"],
      ["Летний сценарий", "Зимний сценарий"],
      ["Когда нет сил", "Хочется впечатлений"],
    ],
  },
  "☕ Кофе / гастро": {
    title: "☕ Кофе / гастро",
    text: "Какой гастро-сценарий?",
    buttons: [
      ["Лучший кофе", "Завтраки"],
      ["Бранчи", "Авторская кухня"],
      ["Вино", "Десерты"],
      ["Новые рестораны", "Michelin vibe"],
      ["Для работы", "Тихо посидеть"],
      ["Красивый интерьер", "Late night food"],
    ],
  },
  "🏛 Культура": {
    title: "🏛 Культура",
    text: "Что хочется?",
    buttons: [
      ["Новые выставки", "Современное искусство"],
      ["Музеи", "Фотография"],
      ["Архитектура", "Книжные"],
      ["Лекции", "Кинотеатры"],
      ["Театр", "Арт-кластеры"],
    ],
  },
  "🌙 После работы": {
    title: "🌙 Вечер после работы",
    text: "Сценарий после работы от БЦ Суперметалл / Бауманской:",
    buttons: [
      ["До 15 минут", "До 30 минут"],
      ["Быстрый ужин", "Прогулка + кофе"],
      ["Вино после работы", "Очень спокойный вечер"],
      ["Активный вечер", "Без метро"],
    ],
  },
  "✨ Случайный вайб": {
    title: "✨ Случайный вайб",
    text: "Выбери настроение — я соберу experience:",
    buttons: [
      ["Кинематографичный вечер", "Tokyo vibe"],
      ["Парижский slow life", "Old money Moscow"],
      ["Rainy jazz evening", "Hidden courtyards"],
      ["Город как отпуск", "День без людей"],
      ["Спонтанный вечер", "Эстетичный день"],
    ],
  },
  "⚙️ Профиль": {
    title: "⚙️ Профиль",
    text:
      "Текущие настройки:\n\n" +
      "Дом: Москва, Тюменский проезд 3/1\n" +
      "Работа: БЦ Суперметалл, Бауманская\n" +
      "Формат: атмосферные маршруты, гастро, прогулки, hidden gems\n" +
      "Рейтинг заведений: приоритет 4.9+ на Яндекс Картах\n" +
      "Питание: без любого лука\n\n" +
      "Пока настройки зашиты в system prompt. Позже добавим редактирование профиля.",
    buttons: [
      ["Показать правила маршрутов", "Что умеет бот"],
    ],
  },
};

function inlineMenu(buttonRows, prefix) {
  return Markup.inlineKeyboard(
    buttonRows.map((row) =>
      row.map((label) => Markup.button.callback(label, `${prefix}:${label}`))
    )
  );
}

function afterRouteKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🔁 Еще вариант", "after:Еще вариант"),
      Markup.button.callback("🍷 Больше гастро", "after:Больше гастро"),
    ],
    [
      Markup.button.callback("🌿 Спокойнее", "after:Спокойнее"),
      Markup.button.callback("💸 Дешевле", "after:Дешевле"),
    ],
    [
      Markup.button.callback("✨ Эстетичнее", "after:Эстетичнее"),
      Markup.button.callback("🗺 Карты", "after:Карты"),
    ],
  ]);
}

async function askOpenAI(ctx, userRequest) {
  await ctx.reply("Собираю маршрут ✨");

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userRequest,
      },
    ],
    temperature: 0.8,
  });

  const answer = completion.choices?.[0]?.message?.content;

  if (!answer) {
    await ctx.reply("Не получилось собрать маршрут.");
    return;
  }

  const chunks = answer.match(/(.|[\r\n]){1,3500}/g) || [answer];

  for (let i = 0; i < chunks.length; i += 1) {
    const isLast = i === chunks.length - 1;
    await ctx.reply(chunks[i], isLast ? afterRouteKeyboard() : undefined);
  }
}

bot.start((ctx) => {
  ctx.reply(
    "Привет ✨\nЯ travel assistant проекта «Мой досуг».\n\nВыбери раздел в меню или напиши запрос текстом.",
    mainMenu
  );
});

bot.command("menu", (ctx) => {
  ctx.reply("Главное меню:", mainMenu);
});

bot.command("help", (ctx) => {
  ctx.reply(
    "Как пользоваться:\n\n" +
      "1. Нажми раздел в меню.\n" +
      "2. Выбери категорию.\n" +
      "3. Я соберу маршрут с логистикой, бюджетом, ссылками и атмосферой.\n\n" +
      "Можно писать и обычным текстом:\n" +
      "«Сделай красивый вечер после работы рядом с Бауманской»"
  );
});

Object.keys(menus).forEach((menuName) => {
  bot.hears(menuName, async (ctx) => {
    const menu = menus[menuName];
    await ctx.reply(`${menu.title}\n\n${menu.text}`, inlineMenu(menu.buttons, menu.title));
  });
});

bot.action(/^(.*?):(.+)$/, async (ctx) => {
  try {
    const section = ctx.match[1];
    const option = ctx.match[2];

    if (section === "after") {
      await ctx.answerCbQuery();

      const prompt = `Переделай предыдущий маршрут с учетом пожелания: ${option}. Если предыдущего маршрута в контексте недостаточно, предложи новый вариант в похожем стиле.`;
      await askOpenAI(ctx, prompt);
      return;
    }

    await ctx.answerCbQuery();

    if (option === "Показать правила маршрутов") {
      await ctx.reply(
        "Правила маршрутов:\n\n" +
          "— логика дня, а не список мест\n" +
          "— расчет времени от дома/работы\n" +
          "— бюджет\n" +
          "— Яндекс Карты и официальные сайты\n" +
          "— заведения 4.9+ по Яндекс Картам, если возможно\n" +
          "— без лука в рекомендациях еды\n" +
          "— атмосферный travel-editorial стиль"
      );
      return;
    }

    if (option === "Что умеет бот") {
      await ctx.reply(
        "Я могу собирать:\n\n" +
          "— маршруты по Москве\n" +
          "— вечера после работы\n" +
          "— варианты для двоих\n" +
          "— гастро-сценарии\n" +
          "— за город\n" +
          "— slow weekend\n" +
          "— культурные маршруты\n" +
          "— подборки под настроение"
      );
      return;
    }

    const prompt =
      `Собери маршрут по выбранной категории.\n\n` +
      `Раздел: ${section}\n` +
      `Категория: ${option}\n\n` +
      `Сделай ответ как готовое Telegram-сообщение: логистика, тайминг, бюджет, ссылки на Яндекс Карты и официальные сайты, атмосфера, нюансы.`;

    await askOpenAI(ctx, prompt);
  } catch (error) {
    console.error("ACTION ERROR:", error);
    await ctx.reply("Ошибка при обработке кнопки.");
  }
});

bot.on("text", async (ctx) => {
  try {
    await askOpenAI(ctx, ctx.message.text);
  } catch (error) {
    console.error("BOT ERROR:", error);

    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      "неизвестная ошибка";

    await ctx.reply(`Ошибка при создании маршрута: ${message}`);
  }
});

bot.launch();

console.log("Bot started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
