import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import 'katex/dist/contrib/mhchem.js';

interface MathTextProps {
  content: string;
  className?: string;
}

// Map of unicode subscripts to standard digits
const UNICODE_SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '₊': '+', '₋': '-', '₍': '(', '₎': ')'
};

// Map of unicode superscripts to standard chars
const UNICODE_SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', '⁽': '(', '⁾': ')'
};

/**
 * Preprocesses mathematical & chemical strings to ensure formula typography & Markdown render seamlessly
 * without leaving raw dollar signs ($), raw slashes, unrendered LaTeX commands,
 * form-feed artefacts (f\f22\7 or \f\f\frac{1}{2}), geometry corruptions (anglePQR, \tangleQ),
 * broken chemical formulas, or unescaped math expressions.
 */
function sanitizeAndFormatMath(rawContent: string): string {
  if (!rawContent) return '';

  let text = String(rawContent);

  // 1. Normalize line endings
  text = text.replace(/\r\n/g, '\n');

  // 2. Normalize unicode Celsius ℃ (U+2103) & Fahrenheit ℉ (U+2109) to standard °C and °F
  text = text.replace(/\u2103/g, '°C');
  text = text.replace(/\u2109/g, '°F');

  // 3. Normalize literal form feed char \u000c and tab chars
  text = text.replace(/[\u000c\x0c]/g, '');
  text = text.replace(/[\t\x09]/g, ' ');

  // 4. Fix corrupt fraction expressions (e.g. f\f22\7, \f\f22\7, f\f22/7, \f\f\frac{1}{2}, f\f\frac{1}{2})
  text = text.replace(/(?:\\*f[\\/]+f|\\+f)\s*(\d+)\s*(?:\\+|[\/])\s*(\d+)/gi, '\\frac{$1}{$2}');
  text = text.replace(/(?:\\*f\s*\\*f|\\+f|f\\+f)\s*\\*frac\{([^{}]+)\}\{([^{}]+)\}/gi, '\\frac{$1}{$2}');
  text = text.replace(/(?:\\+f|f\\+f)\s*rac\{([^{}]+)\}\{([^{}]+)\}/gi, '\\frac{$1}{$2}');
  text = text.replace(/\\+rac\{([^{}]+)\}\{([^{}]+)\}/gi, '\\frac{$1}{$2}');
  text = text.replace(/(^|[^\\])\brac\{([^{}]+)\}\{([^{}]+)\}/g, '$1\\frac{$2}{$3}');

  // 5. Fix tab-corrupted \text or units (e.g., 100extml -> 100 ml)
  text = text.replace(/(\d+)\s*ext\s*(ml|mL|l|L|g|kg|mg|cm|mm|nm|pm|km|m|s|sec|min|h|hr|hrs|Pa|kPa|atm|bar|N|J|kJ|W|kW|V|mV|A|mA|Hz|kHz|MHz|mol|mmol|K|cal|kcal|dB|rpm|cm3|cm³|m3|m³)\b/gi, '$1 $2');
  text = text.replace(/(\d+)\s*\\?text\s*\{\s*(ml|mL|l|L|g|kg|mg|cm|mm|nm|pm|km|m|s|sec|min|h|hr|hrs|Pa|kPa|atm|bar|N|J|kJ|W|kW|V|mV|A|mA|Hz|kHz|MHz|mol|mmol|K|cal|kcal|dB|rpm|cm3|cm³|m3|m³)\s*\}/gi, '$1 $2');
  text = text.replace(/\\?text\{\s*([a-zA-Z0-9\s]+)\s*\}/g, (_m, inner) => {
    if (/^angle\s*([A-Z]{1,4})$/i.test(inner.trim())) {
      return `\\angle ${inner.trim().replace(/^angle\s*/i, '')}`;
    }
    return inner;
  });

  // 6. Fix geometry angle & triangle corruptions:
  // e.g. \tangleQ, tangleQ, \tangle Q -> \angle Q
  text = text.replace(/\\+tangle\s*([A-Z]{1,4})\b/gi, '\\angle $1');
  text = text.replace(/\btangle\s*([A-Z]{1,4})\b/gi, '\\angle $1');
  // \triagle or \triang -> \triangle
  text = text.replace(/\\+triagle\b/gi, '\\triangle');

  // Bare anglePQR, angle PQR, angle Q, angle A -> \angle PQR, \angle Q
  text = text.replace(/\bangle\s*([A-Z]{1,4})\b/g, '\\angle $1');

  // Bare triangle ABC, triangle XYZ, triangle PQR -> \triangle ABC
  text = text.replace(/\btriangle\s+([A-Z]{3,4})\b/gi, '\\triangle $1');

  // 7. Convert standard LaTeX delimiters \( ... \) to $ ... $ and \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 8. Fix double-escaped backslashes in math & chem formulas (e.g. \\frac -> \frac, \\ce -> \ce, \\sqrt -> \sqrt)
  text = text.replace(/\\\\(frac|sqrt|times|div|pm|approx|theta|alpha|beta|gamma|pi|Delta|lambda|mu|sigma|omega|degree|text|mathrm|ce|rightarrow|to|rightleftharpoons|cdot|le|ge|leq|geq|neq|ne|sin|cos|tan|log|ln|int|sum|prod|angle|triangle|circ|infty|partial|nabla)/g, '\\$1');

  // 9. Handle degree conversions in LaTeX contexts
  text = text.replace(/\\degree\s*C\b/g, '^{\\circ}\\mathrm{C}');
  text = text.replace(/\\degree/g, '^{\\circ}');

  // 10. Wrap bare \ce{...} in $...$ if not already inside a math block
  text = text.replace(/(?<!\$)\\ce\{([^{}]+)\}(?!\$)/g, '$\\ce{$1}$');

  // 11. Fix formulas inside math $...$ blocks (unicode subscripts, degrees, hydrate dots, \ce formatting)
  text = text.replace(/\$([^\$]+)\$/g, (_match, inner) => {
    let clean = inner;
    
    // Clean redundant backslashes or corrupt prefixes inside math
    clean = clean.replace(/\\+f+\s*\\*frac/g, '\\frac');
    clean = clean.replace(/f\\+f\s*\\*frac/g, '\\frac');
    clean = clean.replace(/\\+tangle/g, '\\angle');

    // Convert unicode degrees inside math
    clean = clean.replace(/°\s*C\b/g, '^\\circ\\mathrm{C}');
    clean = clean.replace(/°\s*F\b/g, '^\\circ\\mathrm{F}');
    clean = clean.replace(/°/g, '^\\circ');
    clean = clean.replace(/\\text\{C\}/g, '\\mathrm{C}');
    clean = clean.replace(/\\text\{F\}/g, '\\mathrm{F}');

    // Convert unicode subscripts inside math to standard LaTeX _n
    clean = clean.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (sub: string) => {
      const converted = Array.from(sub).map((c: string) => UNICODE_SUBSCRIPTS[c] || c).join('');
      return `_{${converted}}`;
    });

    // Convert unicode superscripts inside math to standard LaTeX ^n
    clean = clean.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (sup: string) => {
      const converted = Array.from(sup).map((c: string) => UNICODE_SUPERSCRIPTS[c] || c).join('');
      return `^{${converted}}`;
    });

    // Normalize hydrate center dots in \ce{...} or chemical formulas
    if (clean.includes('\\ce{')) {
      clean = clean.replace(/\\ce\{([^}]+)\}/g, (_m, ceInner) => {
        let norm = ceInner.replace(/·/g, '.').replace(/\\cdot/g, '.');
        return `\\ce{${norm}}`;
      });
    }

    return `$${clean}$`;
  });

  // 12. Wrap bare \frac{...}{...} in $...$ if not already in math block
  text = text.replace(/(?<!\$)\\frac\{([^{}]+)\}\{([^{}]+)\}(?!\$)/g, '$\\frac{$1}{$2}$');

  // 13. Wrap bare \sqrt{...} or \sqrt[n]{...} in $...$ if not already in math block
  text = text.replace(/(?<!\$)\\sqrt\[([^\]]+)\]\{([^{}]+)\}(?!\$)/g, '$\\sqrt[$1]{$2}$');
  text = text.replace(/(?<!\$)\\sqrt\{([^{}]+)\}(?!\$)/g, '$\\sqrt{$1}$');
  text = text.replace(/(?<![\$\\])\bsqrt\{([^{}]+)\}(?!\$)/g, '$\\sqrt{$1}$');

  // 14. Wrap angles and triangles with their target letters if outside math: e.g. \angle PQR -> $\angle PQR$, \triangle ABC -> $\triangle ABC$
  text = text.replace(/(?<!\$)\\(angle|triangle)\s*([A-Z]{1,4})(?!\$)/g, '$\\$1 $2$');

  // 15. Wrap standalone math symbols like \pi, \theta, \pm, \approx, \le, \ge, \times, \angle, \triangle
  text = text.replace(/(?<!\$)\\(theta|alpha|beta|gamma|pi|Delta|lambda|mu|sigma|omega|approx|pm|times|div|leq|geq|le|ge|neq|ne|cdot|perp|parallel|angle|triangle|infty|rightarrow|to|rightleftharpoons)(?!\$)/g, '$\\$1$');

  // 16. Support Chemical Equations with arrows (e.g. 2H2 + O2 -> 2H2O or CaCO3 -> CaO + CO2 or Zn + H2SO4 -> ZnSO4 + H2)
  text = text.replace(/(?:^|\n)([0-9]*\s*[A-Z][a-zA-Z0-9()·.\s+]*\s*(?:->|-->|→|\\rightarrow|⇌|<=>|\\rightleftharpoons)\s*[0-9]*\s*[A-Z][a-zA-Z0-9()·.\s+^v]*(?:\([a-z]+\))?)(?=\n|$|\.)/g, (match, eq) => {
    if (eq.includes('$') || eq.includes('\\frac')) return match;
    const cleanEq = eq.replace(/-->|→|\\rightarrow/g, '->').replace(/·/g, '.').trim();
    return `\n$\\ce{${cleanEq}}$\n`;
  });

  // 17. Standalone chemical formulas outside math (e.g. H2O, CO2, CaCO3, H2SO4, Ca(OH)2, CuSO4·5H2O, FeSO4, Fe2O3, NaCl, NaOH, HCl)
  // Ensure we don't match probability expressions like P(E) or regular variables
  text = text.replace(/(?<![A-Za-z0-9\$\\])\b([A-Z][a-z]?_?\d*(?:[A-Z][a-z]?_?\d*|\([A-Za-z0-9]+\)_?\d+)+)(?:[·.]\s*\d*H2O)?(?![A-Za-z0-9\$])/g, (m) => {
    const hasNumOrStructure = /\d|_|\(\w+\)\d+/.test(m);
    const isKnownChem = /^(NaCl|HCl|NaOH|KOH|CaO|MgO|CO|NO|SO|KI|HF|HBr|HI)$/.test(m);
    if (!hasNumOrStructure && !isKnownChem) return m;
    const cleanFormula = m.replace(/_/g, '').replace(/·/g, '.');
    return `$\\ce{${cleanFormula}}$`;
  });

  return text;
}

export const MathText: React.FC<MathTextProps> = ({ content, className = '' }) => {
  const processedContent = useMemo(() => {
    return sanitizeAndFormatMath(content);
  }, [content]);

  if (!content) return null;

  return (
    <div className={`markdown-body text-slate-200 text-sm leading-relaxed space-y-2.5 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, { 
            throwOnError: false, 
            strict: false,
            macros: {
              "\\degree": "^{\\circ}",
              "°": "^{\\circ}",
              "°C": "^{\\circ}\\mathrm{C}",
              "°F": "^{\\circ}\\mathrm{F}",
              "\\tangle": "\\angle",
              "\\triagle": "\\triangle"
            }
          }],
          rehypeRaw
        ]}
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
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
