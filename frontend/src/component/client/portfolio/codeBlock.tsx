// 역할: 문제와 해결의 코드 조각. highlight.js 로 문법 색을 입히고, 색은 index.css 의 --code-* 토큰이 라이트 · 다크를 나눠 맡는다

import { useMemo } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import nginx from "highlight.js/lib/languages/nginx";

/* 포트폴리오에 실제로 쓰는 언어만 등록해 번들을 작게 둔다 */
hljs.registerLanguage("python", python);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("nginx", nginx);
hljs.registerAliases(["tsx", "ts"], { languageName: "typescript" });
hljs.registerAliases(["jsx", "js"], { languageName: "javascript" });
hljs.registerAliases(["sh", "shell"], { languageName: "bash" });
hljs.registerAliases(["py"], { languageName: "python" });

interface CodeBlockProps {
  lang: string;
  snippet: string;
}

const CodeBlock = ({ lang, snippet }: CodeBlockProps) => {
  /* highlight.js 는 입력을 이스케이프한 뒤 span 만 덧붙이므로 innerHTML 로 넣어도 된다.
     모르는 언어는 색 없이 그대로 보여준다 */
  const html = useMemo(() => {
    const language = hljs.getLanguage(lang.toLowerCase()) ? lang.toLowerCase() : null;
    if (!language) return null;
    return hljs.highlight(snippet, { language, ignoreIllegals: true }).value;
  }, [lang, snippet]);

  return (
    <div className="code-block overflow-hidden rounded-lg border border-line">
      <div className="code-block-bar flex items-center justify-between px-3 py-1.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        {lang && <span className="text-[11px] font-semibold text-txt-sub">{lang}</span>}
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed">
        {html ? (
          <code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code className="hljs font-mono">{snippet}</code>
        )}
      </pre>
    </div>
  );
};

export default CodeBlock;
