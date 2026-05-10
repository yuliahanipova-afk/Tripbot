import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "Привет ✨\nЯ travel assistant проекта «Мой досуг».\n\nНапиши:\n— маршрут на выходные\n— slow weekend\n— куда поехать после работы\n— атмосферные кафе Москвы"
  );
});

bot.on("text", async (ctx) => {
  try {
    await ctx.reply("Собираю маршрут ✨");

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: ctx.message.text,
            },
          ],
          temperature: 0.9,
        }),
      }
    );

    const data = await response.json();

    const text =
      data.choices?.[0]?.message?.content ||
      "Не получилось собрать маршрут.";

    await ctx.reply(text, {
      parse_mode: "Markdown",
      disable_web_page_preview: false,
    });
  } catch (error) {
    console.log(error);
    await ctx.reply("Ошибка генерации маршрута.");
  }
});

bot.launch();

console.log("Bot started");
