import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import katex from 'katex';
import 'katex/dist/katex.min.css';
// Ensure katex is globally exposed before mhchem loads in all environments
if (typeof window !== 'undefined' && !(window as any).katex) {
  (window as any).katex = katex;
}
if (typeof globalThis !== 'undefined' && !(globalThis as any).katex) {
  (globalThis as any).katex = katex;
}
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

function isLikelyChemicalEquation(str: string): boolean {
  if (!/(?:->|-->|→|\\rightarrow|⇌|<=>|\\rightleftharpoons)/.test(str)) return false;
  const englishWords = /\b(?:moves|enters|glass|light|speed|ray|the|is|and|or|then|when|which|what|statement|following|reaction|calculate|find|where|with|from|into|towards|left|right)\b/i;
  if (englishWords.test(str)) return false;
  return /[A-Z][a-z]?\d|\([A-Za-z0-9]+\)\d|\b(?:NaCl|HCl|NaOH|KOH|CaO|MgO|CO|NO|SO|H2O|MnO2|MnCl2|Cl2|O2|H2|N2)\b/.test(str);
}

/**
 * Preprocesses mathematical & chemical strings to ensure formula typography & Markdown render seamlessly
 * without leaving raw dollar signs ($), raw slashes (/Omega, /times, /right), unrendered LaTeX commands,
 * form-feed artefacts (f\f22\7 or \f\f\frac{1}{2}), geometry corruptions (anglePQR, \tangleQ),
 * broken chemical formulas (\ce{\ce{...}}), or unescaped math expressions.
 */
export function sanitizeAndFormatMath(rawContent: string): string {
  if (!rawContent) return '';

  let text = String(rawContent);

  // 1. Normalize line endings, form feeds, and tabs
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/[\u000c\x0c]/g, '');
  text = text.replace(/[\t\x09]/g, ' ');

  // 2. Normalize unicode Celsius ℃ (U+2103) & Fahrenheit ℉ (U+2109) to standard °C and °F
  text = text.replace(/\u2103/g, '°C');
  text = text.replace(/\u2109/g, '°F');

  // 3. Fix corrupt fraction expressions (e.g. f\f22\7, \f\f22\7, f\f22/7, \f\f\frac{1}{2}, f\f\frac{1}{2})
  text = text.replace(/(?:\\*f[\\/]+f|\\+f)\s*(\d+)\s*(?:\\+|[\/])\s*(\d+)/gi, '\\frac{$1}{$2}');
  text = text.replace(/(?:\\*f\s*\\*f|\\+f|f\\+f)\s*\\*frac\{([^{}]+)\}\{([^{}]+)\}/gi, '\\frac{$1}{$2}');
  text = text.replace(/(?:\\+f|f\\+f)\s*rac\{([^{}]+)\}\{([^{}]+)\}/gi, '\\frac{$1}{$2}');
  text = text.replace(/\\+rac\{([^{}]+)\}\{([^{}]+)\}/gi, '\\frac{$1}{$2}');
  text = text.replace(/(^|[^\\])\brac\{([^{}]+)\}\{([^{}]+)\}/g, '$1\\frac{$2}{$3}');

  // 4. Fix tab-corrupted \text or units (e.g., 100extml -> 100 ml)
  text = text.replace(/(\d+)\s*ext\s*(ml|mL|l|L|g|kg|mg|cm|mm|nm|pm|km|m|s|sec|min|h|hr|hrs|Pa|kPa|atm|bar|N|J|kJ|W|kW|V|mV|A|mA|Hz|kHz|MHz|mol|mmol|K|cal|kcal|dB|rpm|cm3|cm³|m3|m³)\b/gi, '$1 $2');
  text = text.replace(/(\d+)\s*\\?text\s*\{\s*(ml|mL|l|L|g|kg|mg|cm|mm|nm|pm|km|m|s|sec|min|h|hr|hrs|Pa|kPa|atm|bar|N|J|kJ|W|kW|V|mV|A|mA|Hz|kHz|MHz|mol|mmol|K|cal|kcal|dB|rpm|cm3|cm³|m3|m³)\s*\}/gi, '$1 $2');
  text = text.replace(/\\?text\{\s*([a-zA-Z0-9\s]+)\s*\}/g, (_m, inner) => {
    if (/^angle\s*([A-Z]{1,4})$/i.test(inner.trim())) {
      return `\\angle ${inner.trim().replace(/^angle\s*/i, '')}`;
    }
    return inner;
  });

  // 5. Fix geometry angle & triangle corruptions:
  text = text.replace(/\\+tangle\s*([A-Z]{1,4})\b/gi, '\\angle $1');
  text = text.replace(/\btangle\s*([A-Z]{1,4})\b/gi, '\\angle $1');
  text = text.replace(/\\+triagle\b/gi, '\\triangle');
  text = text.replace(/\bangle\s*([A-Z]{1,4})\b/g, '\\angle $1');
  text = text.replace(/\btriangle\s+([A-Z]{3,4})\b/gi, '\\triangle $1');

  // 6. Convert standard LaTeX delimiters \( ... \) to $ ... $ and \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$$');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 7. Fix forward-slash LaTeX commands: /Omega, /times, /right, /rightarrow, /degree, etc.
  // Handle /right specially:
  // If followed by bracket/parenthesis/period e.g. /right), /right], /right. -> \right
  text = text.replace(/\/right(?=[)\]}.|])/g, '\\right');
  // If followed by arrow e.g. /rightarrow -> \rightarrow
  text = text.replace(/\/rightarrow\b/g, '\\rightarrow');
  // If standalone /right in math or arrow context e.g. "moves /right" or "A /right B"
  text = text.replace(/(^|[\s$({[=+,><-])\/right\b(?![)\]}.|])/g, '$1\\rightarrow');
  text = text.replace(/(^|[\s$({[=+,><-])\/left\b(?![([{|.])/g, '$1\\leftarrow');
  text = text.replace(/\/left(?=[([{|.])/g, '\\left');

  // Other forward-slash commands: /Omega, /times, /degree, /Delta, etc.
  const slashKeywords = 'Omega|omega|times|degree|Delta|delta|theta|alpha|beta|gamma|lambda|mu|pi|rho|sigma|phi|sqrt|frac|pm|approx|cdot|leq|geq|le|ge|neq|ne|infty|circ|angle|triangle|ce|text|mathrm';
  // If attached to a number or symbol e.g. "5/Omega", "10/times"
  text = text.replace(new RegExp(`(\\d+)\\/(${slashKeywords})\\b`, 'gi'), '$1 \\$2');
  // Spaced or isolated e.g. " /Omega", " /times", " /degree"
  text = text.replace(new RegExp(`(^|[\\s$({[=+,><\\-])\\/(${slashKeywords})\\b`, 'gi'), '$1\\$2');

  // 8. Fix double-escaped backslashes in math commands
  text = text.replace(/\\\\(frac|sqrt|times|div|pm|approx|theta|alpha|beta|gamma|pi|Delta|lambda|mu|sigma|omega|Omega|degree|text|mathrm|ce|rightarrow|leftarrow|to|rightleftharpoons|cdot|le|ge|leq|geq|neq|ne|sin|cos|tan|log|ln|int|sum|prod|angle|triangle|circ|infty|partial|nabla|left|right)/g, '\\$1');

  // 9. Clean reaction formulas introduced by 'reaction:' or 'equation:' or chemical reactions with arrows
  // e.g. "regarding the reaction: \ce{\ce{MnO2}}+4HCl->\ce{MnCl2}+2H2O+Cl2}."
  text = text.replace(/(reaction|equation)\s*:\s*([A-Za-z0-9+()·.\s\\/{}-]+?(?:->|-->|→|\\rightarrow|⇌|<=>|\\rightleftharpoons)[A-Za-z0-9+()·.\s\\/{}-]+?)(?=[.,\n]|\s*\(Select|\s*$)/gi, (_m, label, eq) => {
    let clean = eq.replace(/\\*ce\s*\{?/gi, ' ');
    clean = clean.replace(/[{}\\]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (isLikelyChemicalEquation(clean)) {
      clean = clean.replace(/-->|→|\\rightarrow/g, '->').replace(/·/g, '.').trim();
      clean = clean.replace(/\s*->\s*/g, ' -> ').replace(/\s*\+\s*/g, ' + ');
      return `${label}: $\\ce{${clean}}$`;
    }
    return _m;
  });

  // 10. Iteratively unwrap any nested \ce{\ce{...}} or \ce{$\ce{...}$} or \ce{$...$}
  let prev = '';
  while (prev !== text) {
    prev = text;
    text = text.replace(/\\ce\{\s*\\ce\{([^{}]+)\}\s*\}/g, '\\ce{$1}');
    text = text.replace(/\\ce\{\s*\$\\ce\{([^{}]+)\}\$\s*\}/g, '\\ce{$1}');
    text = text.replace(/\\ce\{\s*\$([^{}$]+)\$\s*\}/g, '\\ce{$1}');
    text = text.replace(/\$\\ce\{\s*\$\\ce\{([^{}]+)\}\$\s*\}\$/g, '$\\ce{$1}$');
    // Remove dangling closing braces e.g. \ce{CO2}} -> \ce{CO2}
    text = text.replace(/\\ce\{([^{}]+)\}\}/g, '\\ce{$1}');
  }

  // 11. Normalize degrees
  text = text.replace(/\\degree\s*C\b/g, '^{\\circ}\\mathrm{C}');
  text = text.replace(/\\degree/g, '^{\\circ}');

  // 12. PROTECT existing math and \ce blocks before applying word-level regexes
  const protectedBlocks: string[] = [];
  const protect = (blockContent: string): string => {
    const idx = protectedBlocks.length;
    protectedBlocks.push(blockContent);
    return `__MATH_PROTECTED_${idx}__`;
  };

  // Protect $$...$$, $...$, and bare \ce{...}
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => protect(`$$${inner}$$`));
  text = text.replace(/\$([^\$\n]+)\$/g, (_m, inner) => protect(`$${inner}$`));
  text = text.replace(/\\ce\{([^{}]+)\}/g, (_m, inner) => protect(`$\\ce{${inner}}$`));

  // --- EVERYTHING BELOW RUNS ONLY ON PLAIN TEXT OUTSIDE FORMULAS ---

  // 13. Bare Resistance / Ohms: e.g. "5 \Omega", "5\Omega", "5 Ω", "5Ω", "5 ohm", "5 ohms"
  text = text.replace(/\b(\d+(?:\.\d+)?)\s*(?:\\Omega|Ω|\bohm\b|\bohms\b)\b/gi, (_m, num) => {
    return protect(`$${num}\\ \\Omega$`);
  });
  text = text.replace(/(?<![A-Za-z0-9])(?:\\Omega|Ω)(?![A-Za-z0-9])/g, () => {
    return protect('$\\Omega$');
  });

  // 14. Bare scientific notation & powers of 10:
  // e.g. "3 \times 10^8", "3 \times 10^{8}", "3 x 10^8", "3 × 10^8"
  text = text.replace(/\b(\d+(?:\.\d+)?)\s*(?:\\times|×|\bx\b|\*)\s*10\^([{-]?\d+}?)/gi, (_m, num, exp) => {
    const cleanExp = exp.replace(/[{}]/g, '');
    return protect(`$${num} \\times 10^{${cleanExp}}$`);
  });

  // 15. Bare temperatures with degrees:
  // e.g. "5^\circ C", "5^{\circ}C", "5^{\circ}\text{C}", "40^\circ C", "40°C", "37 °C"
  text = text.replace(/\b(\d+(?:\.\d+)?)\s*\^?(?:\\circ|°)\s*(?:\\text\{C\}|\\mathrm\{C\}|C)\b/gi, (_m, num) => {
    return protect(`$${num}^{\\circ}\\mathrm{C}$`);
  });
  text = text.replace(/\b(\d+(?:\.\d+)?)\s*\^\{\\circ\}\s*(?:\\text\{C\}|\\mathrm\{C\}|C)\b/gi, (_m, num) => {
    return protect(`$${num}^{\\circ}\\mathrm{C}$`);
  });
  text = text.replace(/\b(\d+(?:\.\d+)?)\s*°\s*F\b/gi, (_m, num) => {
    return protect(`$${num}^{\\circ}\\mathrm{F}$`);
  });
  text = text.replace(/\b(\d+(?:\.\d+)?)\s*\^?(?:\\circ|°)\b(?!\s*C)/gi, (_m, num) => {
    return protect(`$${num}^{\\circ}$`);
  });

  // 16. Bare fractions: \frac{a}{b} outside math
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, a, b) => {
    return protect(`$\\frac{${a}}{${b}}$`);
  });

  // 17. Bare square roots: \sqrt{...} or \sqrt[n]{...} outside math
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, (_m, n, a) => {
    return protect(`$\\sqrt[${n}]{${a}}$`);
  });
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, (_m, a) => {
    return protect(`$\\sqrt{${a}}$`);
  });

  // 18. Bare angles & triangles: \angle PQR -> $\angle PQR$, \triangle ABC -> $\triangle ABC$
  text = text.replace(/\\(angle|triangle)\s*([A-Z]{1,4})\b/g, (_m, kind, letters) => {
    return protect(`$\\${kind} ${letters}$`);
  });

  // 19. Bare standalone math & Greek symbols: \pi, \theta, \pm, \approx, etc.
  text = text.replace(/\\(theta|alpha|beta|gamma|Delta|delta|lambda|mu|sigma|omega|pi|rho|phi|approx|pm|times|div|leq|geq|le|ge|neq|ne|cdot|perp|parallel|infty|rightarrow|leftarrow|to|rightleftharpoons)\b/g, (_m, sym) => {
    return protect(`$\\${sym}$`);
  });

  // 20. Bare chemical equations with reaction arrows:
  // e.g. "2H2 + O2 -> 2H2O" or "CaCO3 -> CaO + CO2" or "Zn + H2SO4 -> ZnSO4 + H2"
  text = text.replace(/(?:^|\n)([0-9]*\s*[A-Z][a-zA-Z0-9()·.\s+]*\s*(?:->|-->|→|\\rightarrow|⇌|<=>|\\rightleftharpoons)\s*[0-9]*\s*[A-Z][a-zA-Z0-9()·.\s+^v]*(?:\([a-z]+\))?)(?=\n|$|\.|\s*\(Select)/g, (match, eq) => {
    if (!isLikelyChemicalEquation(eq)) return match;
    const cleanEq = eq.replace(/-->|→|\\rightarrow/g, '->').replace(/·/g, '.').trim();
    return protect(`$\\ce{${cleanEq}}$`);
  });

  // 21. Standalone chemical formulas outside math:
  // e.g. H2O, CO2, CaCO3, H2SO4, Ca(OH)2, CuSO4·5H2O, FeSO4, Fe2O3, NaCl, NaOH, HCl, MnO2, MnCl2, Cl2
  text = text.replace(/(?<![A-Za-z0-9])\b([A-Z][a-z]?_?\d*(?:[A-Z][a-z]?_?\d*|\([A-Za-z0-9]+\)_?\d+)+)(?:[·.]\s*\d*H2O)?(?![A-Za-z0-9])/g, (m) => {
    const hasNumOrStructure = /\d|_|\(\w+\)\d+/.test(m);
    const isKnownChem = /^(NaCl|HCl|NaOH|KOH|CaO|MgO|CO|NO|SO|KI|HF|HBr|HI)$/.test(m);
    if (!hasNumOrStructure && !isKnownChem) return m;
    const cleanFormula = m.replace(/_/g, '').replace(/·/g, '.');
    return protect(`$\\ce{${cleanFormula}}$`);
  });

  // --- RESTORE PROTECTED BLOCKS ---
  text = text.replace(/__MATH_PROTECTED_(\d+)__/g, (_m, id) => {
    let block = protectedBlocks[parseInt(id, 10)] || '';

    // Inside math block: fix degrees, subscripts, hydrate dots
    block = block.replace(/°\s*C\b/g, '^\\circ\\mathrm{C}');
    block = block.replace(/°\s*F\b/g, '^\\circ\\mathrm{F}');
    block = block.replace(/°/g, '^\\circ');
    block = block.replace(/\\text\{C\}/g, '\\mathrm{C}');
    block = block.replace(/\\text\{F\}/g, '\\mathrm{F}');

    // Convert unicode subscripts inside math to standard LaTeX _n
    block = block.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (sub: string) => {
      const converted = Array.from(sub).map((c: string) => UNICODE_SUBSCRIPTS[c] || c).join('');
      return `_{${converted}}`;
    });

    // Convert unicode superscripts inside math to standard LaTeX ^n
    block = block.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, (sup: string) => {
      const converted = Array.from(sup).map((c: string) => UNICODE_SUPERSCRIPTS[c] || c).join('');
      return `^{${converted}}`;
    });

    // Clean hydrate dots in \ce{...}
    if (block.includes('\\ce{')) {
      block = block.replace(/\\ce\{([^}]+)\}/g, (_m2, ceInner) => {
        let norm = ceInner.replace(/·/g, '.').replace(/\\cdot/g, '.');
        return `\\ce{${norm}}`;
      });
      // Unwrap any nested \ce inside
      while (/\\ce\{\s*\\ce\{([^{}]+)\}\s*\}/.test(block)) {
        block = block.replace(/\\ce\{\s*\\ce\{([^{}]+)\}\s*\}/g, '\\ce{$1}');
      }
      // Remove any trailing unmatched brace
      block = block.replace(/\\ce\{([^{}]+)\}\}/g, '\\ce{$1}');
    }

    return block;
  });

  // Final sanity check: ensure any bare \ce{...} that might remain are wrapped in $...$
  text = text.replace(/(?<!\$)\\ce\{([^{}]+)\}(?!\$)/g, '$\\ce{$1}$');

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
              "\\triagle": "\\triangle",
              "\\ohm": "\\Omega"
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
