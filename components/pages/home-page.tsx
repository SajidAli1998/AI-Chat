"use client";
import React, { useState, useRef, useEffect } from "react";
import { ModeToggle } from "../elements/toggle-mode";
import axios from "axios";
import { useLLMStore } from "@/store/llm-store";
import { HeaderButton } from "../elements/header-buttom";
import MessageForm from "../elements/chat-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function HomePage() {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const streamingOptions = useRef<{ stop: boolean }>({ stop: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    selectedModel,
    userId,
    messages,
    setMessages,
    addMessage,
    updateMessages,
  } = useLLMStore();
  const { toast } = useToast();

  const isChatEnabled = selectedModel === "Open AI";

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/api");
        setMessages(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        });
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [setMessages, toast]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    setLoading(true);
    streamingOptions.current.stop = false;

    const userMessage = {
      id: messages.length + 1,
      userId: parseInt(userId),
      message: input,
      sender: "USER",
      createdAt: new Date().toISOString(),
      starred: false,
    };

    setInput("");
    addMessage(userMessage);

    try {
      const response = await axios.post("/api", userMessage);
      const [savedUserMessage, savedAiMessage] = response.data;

      updateMessages([savedUserMessage]);
      addMessage(savedAiMessage);

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error("Failed to save message:", error);
    }

    setLoading(false);
  };

  const handleStarMessage = async (chatId: number, starred: boolean) => {
    try {
      const response = await axios.patch("/api", { chatId, starred });
      const { updatedChat, adjacentMessage } = response.data;

      const messagesToUpdate = [updatedChat];
      if (adjacentMessage) {
        messagesToUpdate.push(adjacentMessage);
      }
      updateMessages(messagesToUpdate);

      toast({
        title: starred ? "Message Starred" : "Message Unstarred",
        description: starred
          ? "The message has been starred successfully"
          : "The message has been unstarred successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
      console.error("Failed to update chat:", error);
    }
  };

  return (
    <div className="max-w-7xl relative mx-auto h-[100dvh] flex flex-col justify-center items-center space-y-12">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <HeaderButton text="Starred Messages" href="/starred" />
        <ModeToggle />
      </div>

      <h1 className="font-bold text-2xl">
        {selectedModel.length ? selectedModel : "Chat with me"}
      </h1>

      <div className="relative max-w-xl w-full p-4 border rounded-md flex flex-col h-96 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "USER" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  message.sender === "USER"
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                <div className="text-xs text-black text-opacity-75">
                  {message.createdAt &&
                    format(new Date(message.createdAt), "p, MMM d, yyyy")}
                </div>
                {message.message}
                <button
                  onClick={() =>
                    message.id !== undefined &&
                    handleStarMessage(message.id, !message.starred)
                  }
                  className="ml-2"
                >
                  {message.starred ? "⭐" : "☆"}
                </button>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageForm
        input={input}
        setInput={setInput}
        loading={loading}
        isChatEnabled={isChatEnabled}
        handleSendMessage={handleSendMessage}
      />
    </div>
  );
}
