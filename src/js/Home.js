import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faPaperPlane,
  faStar,
  faStop
} from "@fortawesome/free-solid-svg-icons";
import { generateRandomUUID } from "./helpers/AppHelper";

const MAX_CONTEXT_MESSAGES = 8;

const formatDocumentTypeLabel = (type) => {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default Home = () => {
  const [messages, setMessages] = useState([
    {
      id: generateRandomUUID(),
      role: "assistant",
      content: "Hi! Ask me anything about the documents you have loaded."
    }
  ]);
  const [input, setInput] = useState("");
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState({});
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [topK, setTopK] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeAbortController, setActiveAbortController] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/document_types`);
        if (!response.ok) {
          throw new Error("Config not found");
        }
        const data = await response.json();
        const types = Array.isArray(data?.document_types)
          ? data.document_types
          : Array.isArray(data)
            ? data
            : [];
        setDocumentTypeOptions(types);
        if (types.length) {
          const hasNationalBudget = types.includes("national_budget");
          setSelectedDocumentTypes(
            types.reduce(
              (acc, type) => ({
                ...acc,
                [type]: hasNationalBudget ? type === "national_budget" : type === types[0]
              }),
              {}
            )
          );
        } else {
          setSelectedDocumentTypes({});
        }
      } catch (err) {
        setDocumentTypeOptions([]);
        setSelectedDocumentTypes({});
      } finally {
        setIsConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (activeAbortController) {
        activeAbortController.abort();
      }
    };
  }, [activeAbortController]);

  const selectedTypesList = Object.entries(selectedDocumentTypes)
    .filter(([, enabled]) => enabled)
    .map(([type]) => type);

  const buildConversationContext = (history) => {
    const relevant = history.filter((message) => message.role !== "system");
    const recent = relevant.slice(-MAX_CONTEXT_MESSAGES);
    return recent
      .map((message) => {
        const label = message.role === "user" ? "User" : "Assistant";
        return `${label}: ${message.content}`;
      })
      .join("\n");
  };

  const updateMessageContent = (messageId, content, isStreaming = false) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, content, isStreaming }
          : message
      )
    );
  };

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }
    if (!selectedTypesList.length) {
      setError("Add at least one document type.");
      return;
    }

    setError("");
    setInput("");
    setIsLoading(true);

    const userMessage = {
      id: generateRandomUUID(),
      role: "user",
      content: trimmed
    };
    const assistantMessageId = generateRandomUUID();
    const assistantMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: ""
    };

    appendMessage(userMessage);
    appendMessage(assistantMessage);

    const context = buildConversationContext(messages);
    const query = context
      ? `Conversation so far:\n${context}\n\nUser: ${trimmed}`
      : trimmed;

    const controller = new AbortController();
    setActiveAbortController(controller);

    try {
      const response = await fetch(`${API_BASE_URL}/inquire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query,
          document_types: selectedTypesList,
          k: Number(topK) || 5
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message =
          errorPayload?.message || "Something went wrong with the request.";
        updateMessageContent(assistantMessageId, message, false);
        setError(message);
        return;
      }

      if (!response.body) {
        const text = await response.text();
        updateMessageContent(assistantMessageId, text, false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        result += decoder.decode(value, { stream: true });
        updateMessageContent(assistantMessageId, result, true);
      }

      updateMessageContent(assistantMessageId, result, false);
    } catch (err) {
      if (err.name === "AbortError") {
        updateMessageContent(assistantMessageId, "Request cancelled.", false);
      } else {
        updateMessageContent(
          assistantMessageId,
          "We hit a network error. Please try again.",
          false
        );
        setError("Network error while contacting the backend.");
      }
    } finally {
      setIsLoading(false);
      setActiveAbortController(null);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    if (activeAbortController) {
      activeAbortController.abort();
    }
  };

  const handleToggleDocumentType = (type) => {
    setSelectedDocumentTypes((prev) => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const primaryDocumentType = selectedTypesList[0];

  return (
    <div className="talarag-chat-page">
      <main className="chat-page-shell">
        <header className="public-topbar public-topbar--chat-only">
          <div className="public-topbar-links">
            <a className="topbar-link is-active" href="/#/">
              Chat
            </a>
            <a className="topbar-link" href="/#/documents">
              Documents
            </a>
          </div>
        </header>

        <div className="public-content public-content--chat-only">
          <section className="hero-copy">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="public-brand-mark">
                <FontAwesomeIcon icon={faStar} />
              </div>
              <div>
                <div className="public-brand-name">TalaRAG</div>
                <div className="public-brand-tagline">Dokumentong Pinoy</div>
              </div>
            </div>
            <h1 className="hero-title">
              Magandang araw. <span className="accent">How can I assist your research today?</span>
            </h1>
            <p className="hero-description">
              I&apos;m your AI-powered cultural and data concierge, trained to help
              you navigate through complex Filipino archives and modern datasets.
            </p>
            <div className="public-sidebar-meta">
              <span className="public-meta-pill">
                <span className="chip-dot" />
                {isConfigLoading
                  ? "Loading archives"
                  : primaryDocumentType
                    ? formatDocumentTypeLabel(primaryDocumentType)
                    : "No archive selected"}
              </span>
              <span className="public-meta-pill">
                <span className="chip-dot" />
                Top K: {topK}
              </span>
              <a className="public-meta-pill text-decoration-none" href="/#/documents">
                <span className="chip-dot" />
                Browse archives
              </a>
            </div>
          </section>

          <div className="chat-scroll-area">
            <div className="chat-thread">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`chat-turn ${isUser ? "chat-turn--user" : ""}`}
                  >
                    {isUser ? (
                      <div className="user-bubble">{message.content}</div>
                    ) : (
                      <div className="assistant-turn">
                        <div className="assistant-avatar">
                          <FontAwesomeIcon icon={faStar} />
                        </div>
                        <div className="assistant-body">
                          <div className="assistant-copy">
                            {message.content ? (
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                  table: ({ children }) => (
                                    <div className="table-responsive">
                                      <table className="table table-sm mb-0">
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  thead: ({ children }) => <thead>{children}</thead>,
                                  th: ({ children }) => <th>{children}</th>,
                                  pre: ({ children }) => (
                                    <pre className="p-3 mb-0 bg-white">
                                      {children}
                                    </pre>
                                  ),
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="fw-semibold text-primary text-decoration-none"
                                    >
                                      {children}
                                    </a>
                                  )
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            ) : (
                              message.isStreaming ? "…" : ""
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {error ? (
            <div className="soft-alert" role="alert">
              {error}
            </div>
          ) : null}

          <div className="floating-composer">
            <div className="composer-card">
              <div className="composer-main">
                <textarea
                  className="form-control composer-textarea"
                  rows="2"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask TalaRAG a question…"
                />
                <div className="composer-actions">
                  <button
                    type="button"
                    className="btn btn-outline-secondary icon-button"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                    aria-label="Advanced settings"
                  >
                    <FontAwesomeIcon icon={faGear} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary icon-button"
                    onClick={handleStop}
                    disabled={!isLoading}
                    aria-label="Stop response"
                  >
                    <FontAwesomeIcon icon={faStop} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary icon-button"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || isConfigLoading}
                    aria-label="Send message"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
              </div>

              {showAdvanced ? (
                <div className="composer-advanced">
                  <div className="composer-settings-grid">
                    <div>
                      <label className="form-label text-muted small">Top K Retrieval</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={topK}
                        onChange={(event) => setTopK(event.target.value)}
                      />
                    </div>
                    <div>
                      <div className="form-label text-muted small">Document Collections</div>
                      {isConfigLoading ? (
                        <div className="text-muted small">Loading document types…</div>
                      ) : (
                        <div className="document-chip-grid">
                          {documentTypeOptions.map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={`document-chip ${selectedDocumentTypes[type] ? "is-selected" : ""}`}
                              onClick={() => handleToggleDocumentType(type)}
                            >
                              <span className="chip-dot" />
                              {formatDocumentTypeLabel(type)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="supporting-note">
              Press Enter to send, Shift+Enter for a new line. Verify important
              claims against the primary sources provided.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
