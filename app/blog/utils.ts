import hljs from 'highlight.js';
import { Tokens, marked } from 'marked';
import { markedHighlight } from 'marked-highlight';

export function markdownToHtml(markdown: string) {
  marked.use(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  marked.use({
    useNewRenderer: true,
    renderer: {
      heading(token: Tokens.Heading) {
        let text = token.text.replace(/\*\*/g, ''); // Remove **
        let escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        escapedText = escapedText.replace(/-+$/, ''); // Remove trailing dashes

        return `<h${token.depth} id="${escapedText}" class="tracking-tight">
                  <a href="#${escapedText}" class="font-semibold">${text}</a>
                </h${token.depth}>`;
      },
      image(token: Tokens.Image) {
        if (token.href === null) {
          return token.text;
        }
        return `<a target="_blank" rel="noreferrer noopener" href="${token.href}">
                  <img src="${token.href}" alt="${token.text}" loading="lazy" />
                </a>`;
      },
      link(token: Tokens.Link) {
        return `<a href="${token.href}" target="_blank" rel="noopener noreferrer">${token.text}</a>`;
      }
    }
  });

  return marked.parse(markdown);
}
