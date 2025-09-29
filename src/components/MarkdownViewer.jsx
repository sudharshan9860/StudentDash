// src/components/MarkdownViewer.jsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownViewer({ children, wrapperClassName }) {
  return (
    <div className={wrapperClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {children || ""}
      </ReactMarkdown>
    </div>
  );
}
