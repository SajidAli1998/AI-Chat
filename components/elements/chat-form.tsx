"use client";
import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ModelOptions } from "../elements/model-options";

interface MessageFormProps {
  input: string;
  setInput: (input: string) => void;
  loading: boolean;
  isChatEnabled: boolean;
  handleSendMessage: () => void;
}

const MessageForm: React.FC<MessageFormProps> = ({
  input,
  setInput,
  loading,
  isChatEnabled,
  handleSendMessage,
}) => {
  return (
    <div className="max-w-xl w-full fixed bottom-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex flex-row w-full items-end gap-2"
      >
        <ModelOptions />
        <Input
          placeholder={isChatEnabled ? "Type a message..." : "Coming soon..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || !isChatEnabled}
        />
        <Button
          type="submit"
          disabled={loading || !input.length || !isChatEnabled}
        >
          {loading ? (
            <div className="flex items-center">
              <span className="mr-2">Sending...</span>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
          ) : (
            "Send message"
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageForm;
