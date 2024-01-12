import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

export function markdownToHtml(markdown: string) {
  const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  marked.use({
    renderer: {
      heading(text: string, level: number) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

        return `<a class="!no-underline hover:underline" href="#${escapedText}">
                  <h${level} id="${escapedText}">${text}</h${level}>
                </a>`;
      },
      image(href: string, title: string | null, text: string) {
        if (href === null) {
          return text;
        }
        const out =
          '<a target="_blank" rel="noreferrer noopener" href="' +
          href +
          '"><img src="https://praveenjuge.com' +
          href +
          '" alt="' +
          text +
          '" loading="lazy" /></a>';
        return out;
      },
      link(href: string, title: string | null | undefined, text: string) {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">
                ${text}
                </a>`;
      }
    }
  });

  return marked.parse(markdown);
}
