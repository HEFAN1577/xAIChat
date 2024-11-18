/**
 * XAI Chat Application
 * 
 * @author 猫咪老师
 * @description 一个基于 React 的 XAI 聊天应用
 * @license MIT
 * 
 * 作者社交媒体:
 * - 小红书: 猫咪老师Reimagined
 * - 哔哩哔哩: 猫咪老师Reimagined
 * 
 * Copyright (c) 2024 猫咪老师
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './XAIChat.css';
import { PaperClipIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const XAILogo = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    aria-hidden="true" 
    className="logo" 
    focusable="false"
  >
    <path d="m3.005 8.858 8.783 12.544h3.904L6.908 8.858zM6.905 15.825 3 21.402h3.907l1.951-2.788zM16.585 2l-6.75 9.64 1.953 2.79L20.492 2zM17.292 7.965v13.437h3.2V3.395z"/>
  </svg>
);

const XAIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 自动调整输入框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isStarted) {
      setIsStarted(true);
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(process.env.REACT_APP_XAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_XAI_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant.'
            },
            ...messages,
            userMessage
          ],
          model: 'grok-beta',
          stream: false,
          temperature: 0
        })
      });

      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.choices[0].message.content };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，发生了一些错误。请稍后重试。',
        error: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    // 如果内容包含多个段落，确保它们之间有适当的换行
    return content.split('\n').filter(line => line.trim()).join('\n\n');
  };

  // 添加代码复制功能
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // 自定义代码块渲染
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (!inline) {
      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span className="code-language">{language || 'text'}</span>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(String(children))}
            >
              复制代码
            </button>
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    }
    return <code className={className} {...props}>{children}</code>;
  };

  // 在首页渲染部分添加快捷问题
  if (!isStarted) {
    const quickQuestions = [
      "代码",
      "英语文本",
      "提供建议",
      "写文章",
      "翻译"
    ];

    const handleQuickQuestion = (question) => {
      setInput(question);
    };

    return (
      <div className="chat-container">
        <div className="welcome-screen">
          <div className="welcome-logo">
            <XAILogo />
          </div>
          <h1 className="welcome-title">有什么可以帮忙的？</h1>
          <form onSubmit={handleSubmit} className="chat-input-form">
            <div className="input-wrapper welcome-input">
              <button type="button" className="attachment-button">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="给XAI发送消息"
                className="chat-input"
                rows={1}
              />
              <div className="input-buttons">
                <button 
                  type="submit" 
                  className="send-button"
                  disabled={isLoading || !input.trim()}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
          <div className="quick-questions">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question-btn"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
          
          <div className="author-info">
            <p>开源作者：猫咪老师</p>
            <p>
              <a 
                href="https://www.xiaohongshu.com/user/profile/59f1fcc411be101aba7f048f" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                小红书：猫咪老师Reimagined
              </a>
            </p>
            <p>
              <a 
                href="https://space.bilibili.com/1054925384?spm_id_from=333.1007.0.0" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                哔哩哔哩：猫咪老师Reimagined
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 渲染聊天界面
  return (
    <div className="chat-container">
      <div className="chat-header">
        <XAILogo />
        <h1>XAI Chat</h1>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message-wrapper ${message.role}`}>
            {message.role === 'assistant' && (
              <div className="message-avatar">
                <XAILogo />
              </div>
            )}
            <div className={`message ${message.error ? 'error' : ''}`}>
              <div className="message-header">
                <span className="role-indicator">
                  {message.role === 'user' ? '用户' : 'AI助手'}
                </span>
              </div>
              <div className="message-content">
                <ReactMarkdown
                  components={{
                    code: CodeBlock
                  }}
                >
                  {formatMessage(message.content)}
                </ReactMarkdown>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="message-avatar">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="message loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-wrapper">
            <button type="button" className="attachment-button">
              <PaperClipIcon className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="给XAI发送消息"
              className="chat-input"
              rows={1}
            />
            <div className="input-buttons">
              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading || !input.trim()}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default XAIChat; 