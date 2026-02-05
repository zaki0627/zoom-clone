import { FiSend, FiX } from "react-icons/fi";
import type { ChatMessage } from "../../modules/meetings/meeting.hook";
import { useState } from "react";

interface ChatProps {
  onClose: () => void;
  chatMessages: ChatMessage[];
  onSubmit: (message: string) => void;
}
export function Chat({ onClose, chatMessages, onSubmit }: ChatProps) {
  const [message, setMessage] = useState("");
  const handleSubmit = () => {
    if (message.trim) {
      onSubmit(message.trim());
      setMessage("");
    }
  };
  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>チャット</h3>
        <button className="close-chat" onClick={onClose}>
          <FiX />
        </button>
      </div>
      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <div className="message-header">
              <span className="sender-name">{msg.userName}</span>
              <span className="message-time">
                {msg.createdAt.toLocaleString()}
              </span>
            </div>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
      </div>
      <form className="chat-input">
        <input
          type="text"
          placeholder="メッセージを入力..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="button" onClick={handleSubmit}>
          <FiSend />
        </button>
      </form>
    </div>
  );
}
