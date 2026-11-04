"use client";

import { useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";

type AutoGrowTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

function resize(textarea: HTMLTextAreaElement) {
  textarea.style.height = "0px";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function AutoGrowTextarea(props: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    resize(textarea);
    let previousWidth = textarea.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.offsetWidth === previousWidth) return;
      previousWidth = textarea.offsetWidth;
      resize(textarea);
    });

    observer.observe(textarea);
    return () => observer.disconnect();
  }, []);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      rows={1}
      className="auto-grow-textarea"
      onInput={(event) => resize(event.currentTarget)}
    />
  );
}
