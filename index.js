import dotenv from "dotenv";
import { Telegraf } from "telegraf";
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

bot.start((ctx) => {
  ctx.reply(
    "Привет ✨\nЯ travel assistant проекта «Мой досуг».\n\nНапиши:\n• маршрут на вечер\n• поездка на выходные\n• кафе для свидания\n• slow weekend\n• выставки / бары / прогулки"
  );
});

bot.on("text", async (ctx) => {
  try {
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
          content: ctx.message.text,
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

    for (const chunk of chunks) {
      await ctx.reply(chunk, {
        disable_web_page_preview: false,
      });
    }
  } catch (error) {
    console.error("BOT ERROR:", error);

    const message =
      error?.response?.data?.error?.message ||
      error?.message ||
      "неизвестная ошибка";

    await ctx.reply(
      `Ошибка при создании маршрута: ${message}`
    );
  }
});

bot.launch();

console.log("Bot started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
