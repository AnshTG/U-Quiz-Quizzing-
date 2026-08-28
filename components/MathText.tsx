import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MathTextProps {
  content: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      try {
        (window as any).renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
          output: 'html',
        });
      } catch (e) {
        console.warn('KaTeX rendering error', e);
      }
    }
  }, [content]);

  if (!content) return null;

  return (
    <div ref={containerRef} className={`markdown-body text-slate-200 text-sm leading-relaxed space-y-2.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold font-display text-white mt-3 mb-1.5 pb-1 border-b border-slate-800 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold font-display text-emerald-400 mt-2.5 mb-1 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-sm font-semibold text-teal-300 mt-2 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-slate-200 mt-1.5 mb-0.5 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed text-slate-200">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2.5 space-y-1 text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white tracking-normal">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-300">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-emerald-500/60 pl-3.5 my-2.5 text-slate-300 italic bg-emerald-500/5 py-1.5 rounded-r-xl text-xs sm:text-sm">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            if (isInline) {
              return (
                <code className="bg-slate-900/90 border border-slate-800 text-emerald-300 text-[12px] font-mono px-1.5 py-0.5 rounded" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                {match && (
                  <div className="bg-slate-900/80 px-3 py-1 text-[10px] font-mono text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                    {match[1]}
                  </div>
                )}
                <pre className="p-3 overflow-x-auto text-xs font-mono text-emerald-300">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-xs text-left">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-900 text-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-900/40 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2 text-xs font-semibold text-slate-300">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-xs text-slate-300">
              {children}
            </td>
          ),
          hr: () => <hr className="border-slate-800 my-3" />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
