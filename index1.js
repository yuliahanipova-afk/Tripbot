import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
      temperature: 0.9,
    });

    const answer = completion.choices[0].message.content;

    if (!answer) {
      await ctx.reply("Не получилось собрать маршрут.");
      return;
    }

    await ctx.reply(answer);
  } catch (error) {
    console.error(error);

    await ctx.reply(
      "Ошибка при создании маршрута. Проверь OpenAI API key и баланс аккаунта."
    );
  }
});

bot.launch();

console.log("Bot started");
