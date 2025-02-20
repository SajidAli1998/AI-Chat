"use client";
import React, { useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { HeaderButton } from "@/components/elements/header-buttom";
import { ModeToggle } from "@/components/elements/toggle-mode";
import { useLLMStore } from "@/store/llm-store";

export default function Page() {
  const { messages, setMessages } = useLLMStore();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/api?starred=true");
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [setMessages]);

  const groupedMessages = messages.reduce((acc, message, index, array) => {
    if (message.sender === "USER") {
      const aiMessage = array[index + 1];
      if (aiMessage && aiMessage.sender === "AI") {
        acc.push({ userMessage: message, aiMessage });
      }
    }
    return acc;
  }, []);

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-2xl">Starred Messages</h1>
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          <HeaderButton text="Home" href="/" />
          <ModeToggle />
        </div>
      </div>
      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
        <ul className="space-y-4">
          {groupedMessages.map(({ userMessage, aiMessage }) => (
            <li
              key={userMessage.id}
              className="p-2 rounded-md bg-gray-300 text-black"
            >
              <div className="p-2 rounded-md bg-green-500 text-white mb-2">
                <div className="text-xs text-black text-opacity-75">
                  {userMessage.createdAt &&
                    format(new Date(userMessage.createdAt), "p, MMM d, yyyy")}
                </div>
                User: {userMessage.message}
              </div>
              <div className="p-2 rounded-md bg-gray-300 text-black">
                <div className="text-xs text-black text-opacity-75">
                  {aiMessage.createdAt &&
                    format(new Date(aiMessage.createdAt), "p, MMM d, yyyy")}
                </div>
                AI: {aiMessage.message}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
