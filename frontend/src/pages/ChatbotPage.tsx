import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { ApiError, sendChatMessage } from "../services/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Which skill should I learn first?",
  "Explain my career roadmap.",
  "What project should I build next?",
  "Am I ready for my recommended career?",
];

const createMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random()}`,
  role,
  content,
});

export default function ChatbotPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitMessage = async (rawMessage: string) => {
    const userMessage = rawMessage.trim();
    if (loading) return;
    if (!userMessage) {
      setError("Enter a question before sending.");
      return;
    }

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage("user", userMessage),
    ]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await sendChatMessage(token, userMessage);
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", response.reply),
      ]);
    } catch (requestError: unknown) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        setError("Your session is no longer authorized. Please sign in again.");
      } else if (requestError instanceof Error) {
        setError(requestError.message || "Unable to reach your career assistant.");
      } else {
        setError("Unable to reach your career assistant.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitMessage(input);
    }
  };

  return (
    <main className="content-page chatbot-page">
      <div className="page-heading chatbot-heading">
        <div>
          <p className="eyebrow">YOUR LEARNING COMPASS</p>
          <h1>Personalized Career Assistant</h1>
          <p className="muted">
            Ask for guidance grounded in your skills, interests, recommendations,
            roadmap, and projects.
          </p>
        </div>
        <span className="stat-chip">AI mentor</span>
      </div>

      <section className="chatbot-surface" aria-label="Personalized career assistant">
        <div className="chat-messages" aria-live="polite">
          {messages.length === 0 && (
            <div className="chat-empty-state">
              <span className="chat-orb">PF</span>
              <h2>What are you working toward?</h2>
              <p className="muted">
                I can help you choose your next skill, understand your roadmap,
                or find a project that builds useful momentum.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div className={`chat-row chat-row-${message.role}`} key={message.id}>
              <div className="chat-bubble">
                <span className="chat-role">{message.role === "user" ? "You" : "PathForge AI"}</span>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-row chat-row-assistant">
              <div className="chat-bubble chat-thinking" aria-label="Thinking">
                <span className="chat-role">PathForge AI</span>
                <p>Thinking<span className="thinking-dots">...</span></p>
              </div>
            </div>
          )}
        </div>

        {error && <p className="error-message chat-error" role="alert">{error}</p>}

        <div className="suggestion-list" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button
              className="suggestion-button"
              disabled={loading}
              key={suggestion}
              onClick={() => setInput(suggestion)}
              type="button"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            aria-label="Ask your career assistant"
            disabled={loading}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your next step..."
            rows={2}
            value={input}
          />
          <button disabled={loading || !input.trim()} type="submit">
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}