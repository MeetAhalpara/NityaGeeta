"use client";

/**
 * TextGenerate — word-by-word fade-in animation for bot responses.
 *
 * Each word fades in with a slight upward drift, staggered left-to-right.
 * Preserves newlines and whitespace. Works with Markdown rendered by
 * ReactMarkdown by wrapping the rendered output in a parent that
 * animates once when the content first mounts (key = content hash).
 *
 * Inspired by Aceternity's Text Generate Effect — implemented with
 * motion/react (already installed) so no new dependencies.
 */

import { motion, useAnimation } from "motion/react";
import { useEffect, useRef } from "react";
import React from "react";

interface TextGenerateProps {
  /** The full text content — used only to detect when new content arrives */
  content: string;
  /** The pre-rendered React children (e.g. ReactMarkdown output) */
  children: React.ReactNode;
  /** Delay between each word in seconds. Default: 0.018 */
  stagger?: number;
  /** Whether to animate. Pass false for user messages or old messages. */
  animate?: boolean;
}

export function TextGenerate({
  content,
  children,
  stagger = 0.018,
  animate = true,
}: TextGenerateProps) {
  const controls = useAnimation();
  const prevContent = useRef<string>("");

  useEffect(() => {
    if (!animate) return;
    if (content !== prevContent.current) {
      prevContent.current = content;
      controls.set({ opacity: 0, filter: "blur(4px)", y: 6 });
      controls.start((i) => ({
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        transition: {
          delay: i * stagger,
          duration: 0.35,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }));
    }
  }, [content, animate, controls, stagger]);

  if (!animate) {
    return <>{children}</>;
  }

  // Split children (rendered nodes) into word-level spans for animation.
  // We do this by walking the text nodes and wrapping each word.
  const words = splitToAnimatedWords(children);

  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          animate={controls}
          initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
          style={{ display: "inline" }}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Recursively walks React children and splits text nodes into
 * word-level span fragments, preserving non-text elements intact.
 */
function splitToAnimatedWords(children: React.ReactNode): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let wordIndex = 0;

  function walk(node: React.ReactNode): void {
    if (node === null || node === undefined) return;

    if (typeof node === "string") {
      // Split on whitespace boundaries, keep the spaces
      const parts = node.split(/(\s+)/);
      for (const part of parts) {
        if (part === "") continue;
        if (/^\s+$/.test(part)) {
          // Pure whitespace — add as-is without animation overhead
          result.push(part);
        } else {
          result.push(
            <React.Fragment key={`w-${wordIndex++}`}>{part}</React.Fragment>
          );
        }
      }
      return;
    }

    if (typeof node === "number" || typeof node === "boolean") {
      result.push(String(node));
      return;
    }

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    // React element — clone with walked children
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      const childWords: React.ReactNode[] = [];
      const save = result.splice(0, result.length);

      if (el.props.children) {
        walk(el.props.children);
        childWords.push(...result.splice(0, result.length));
      }

      result.push(...save);
      result.push(
        React.cloneElement(el, { key: el.key ?? `el-${wordIndex}`, children: childWords.length > 0 ? childWords : el.props.children })
      );
    }
  }

  walk(children);
  return result;
}
