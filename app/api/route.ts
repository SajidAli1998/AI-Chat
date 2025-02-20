import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId, message, sender } = await request.json();

    const savedMessage = await prisma.chat.create({
      data: {
        userId: parseInt(userId),
        message,
        sender,
      },
    });

    let aiMessage: string | null = null;

    if (sender === "USER") {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
        });

        aiMessage = completion.choices[0]?.message?.content;
      } catch (error) {
        console.error("OpenAI API call failed, using mock response:", error);
      }

      if (aiMessage) {
        const savedAiMessage = await prisma.chat.create({
          data: {
            userId: 2,
            message: aiMessage,
            sender: "AI",
          },
        });

        return NextResponse.json([savedMessage, savedAiMessage], {
          status: 200,
        });
      } else {
        throw new Error("AI response is null or undefined");
      }
    }

    return NextResponse.json(savedMessage, { status: 200 });
  } catch (error) {
    console.error("Failed to save message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const starredParam = searchParams.get("starred");
  const whereClause = starredParam === "true" ? { starred: true } : {};

  const messages = await prisma.chat.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(messages, { status: 200 });
}

export async function PATCH(request: Request) {
  try {
    const { chatId, starred } = await request.json();

    const updatedChat = await prisma.chat.update({
      where: { id: parseInt(chatId) },
      data: { starred },
    });

    const currentMessage = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
    });

    if (!currentMessage) {
      throw new Error("Message not found");
    }

    let adjacentMessage = null;
    if (currentMessage.sender === "USER") {
      adjacentMessage = await prisma.chat.findFirst({
        where: {
          sender: "AI",
          createdAt: { gt: currentMessage.createdAt },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    } else if (currentMessage.sender === "AI") {
      adjacentMessage = await prisma.chat.findFirst({
        where: {
          sender: "USER",
          createdAt: { lt: currentMessage.createdAt },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    if (adjacentMessage) {
      adjacentMessage = await prisma.chat.update({
        where: { id: adjacentMessage.id },
        data: { starred },
      });
    }
    return NextResponse.json({ updatedChat, adjacentMessage }, { status: 200 });
  } catch (error) {
    console.error("Failed to update chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}
