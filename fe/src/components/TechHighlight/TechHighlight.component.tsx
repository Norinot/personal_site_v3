import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./TechHighlight.module.scss";
import { snippets } from "@/utils/techSnippets";

interface TechHighlightProps {
  techKey: string;
  className?: string;
  children?: React.ReactNode;
}

const highlightSyntax = (code: string) => {
  const combinedRegex =
    /(".*?"|'.*?'|`.*?`)|(\b(?:const|let|var|function|class|export|import|from|return|if|else|public|static|void|package|func)\b)|(\b[a-z][a-zA-Z0-9]*(?=\())|(\b[A-Z][a-zA-Z0-9]*\b)/g;

  let lastIndex = 0;
  let result = "";
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  code.replace(combinedRegex, (match, g1, g2, g3, g4, offset) => {
    if (offset > lastIndex) {
      result += `<span class="${styles.tokenPlain}">${escapeHtml(
        code.slice(lastIndex, offset),
      )}</span>`;
    }
    if (g1)
      result += `<span class="${styles.tokenString}">${escapeHtml(g1)}</span>`;
    else if (g2)
      result += `<span class="${styles.tokenKeyword}">${escapeHtml(g2)}</span>`;
    else if (g3)
      result += `<span class="${styles.tokenFunction}">${escapeHtml(
        g3,
      )}</span>`;
    else if (g4)
      result += `<span class="${styles.tokenType}">${escapeHtml(g4)}</span>`;
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < code.length) {
    result += `<span class="${styles.tokenPlain}">${escapeHtml(
      code.slice(lastIndex),
    )}</span>`;
  }
  return result;
};

const TechHighlight = ({
  techKey,
  className,
  children,
}: TechHighlightProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedCode, setDisplayedCode] = useState("");

  const [layout, setLayout] = useState({ top: 0, left: 0, transform: "" });

  const spanRef = useRef<HTMLSpanElement>(null);
  const typeTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const fullCode = snippets[techKey] || "";

  const updatePosition = () => {
    if (!spanRef.current) return;

    const rect = spanRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isMobile = windowWidth < 768;

    let top = 0;
    let left = 0;
    let transform = "";

    if (isMobile) {
      left = windowWidth / 2;

      const spaceAbove = rect.top;
      const spaceBelow = windowHeight - rect.bottom;

      if (spaceAbove > 300 || spaceAbove > spaceBelow) {
        top = rect.top - 15;
        transform = "translate(-50%, -100%)";
      } else {
        top = rect.bottom + 15;
        transform = "translate(-50%, 0)";
      }
    } else {
      left = rect.left + rect.width / 2;

      top = rect.top - 15;
      transform = "translate(-50%, -100%) translateY(-10px)";

      if (rect.top < 300) {
        top = rect.bottom + 15;
        transform = "translate(-50%, 0) translateY(10px)";
      }
    }

    setLayout({ top, left, transform });
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) {
      setDisplayedCode("");
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
      return;
    }

    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    let currentIndex = 0;

    const typeChar = () => {
      currentIndex++;
      const currentText = fullCode.slice(0, currentIndex);
      setDisplayedCode(highlightSyntax(currentText));

      if (currentIndex < fullCode.length) {
        const randomSpeed = 5 + Math.random() * 25;
        typeTimeoutRef.current = window.setTimeout(typeChar, randomSpeed);
      }
    };

    typeChar();

    return () => {
      if (typeTimeoutRef.current) clearTimeout(typeTimeoutRef.current);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, fullCode]);

  return (
    <>
      <span
        ref={spanRef}
        className={`${styles.techWrapper} ${className || ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleMouseEnter}
      >
        {children}
      </span>

      {isOpen &&
        createPortal(
          <div
            className={styles.tooltipPortal}
            style={{
              top: layout.top,
              left: layout.left,
              transform: layout.transform,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.windowHeader}>
              <div className={styles.controls}>
                <span
                  className={`${styles.dot} ${styles.red}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                />
                <span className={`${styles.dot} ${styles.yellow}`} />
                <span className={`${styles.dot} ${styles.green}`} />
              </div>
              <span className={styles.languageLabel}>{techKey}</span>
            </div>

            <pre className={styles.codeBlock}>
              <code dangerouslySetInnerHTML={{ __html: displayedCode }} />
            </pre>
          </div>,
          document.body,
        )}
    </>
  );
};

export default TechHighlight;
