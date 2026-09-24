/**
 * One help-centre article.
 *
 * The answer is the studio's own text, already translated server side. It is
 * rendered as plain paragraphs rather than Markdown: the SDK does not ship a
 * parser for a body the studio wrote in a rich-text field, and a stray `*`
 * shown as a `*` is better than a dependency.
 */

import { useUi, useWidgetState } from './app.tsx'

export function FaqScreen({ faqId }: { faqId: string }) {
  const { strings } = useUi()
  const state = useWidgetState()
  const faq = state.faqs.find((entry) => entry.id === faqId)

  if (!faq) {
    return (
      <div class="screen empty">
        <p class="empty-title">{strings.noArticles}</p>
      </div>
    )
  }

  return (
    <article class="screen article">
      <h2 class="article-title">{faq.question}</h2>
      {faq.answer.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} class="article-body">
          {paragraph}
        </p>
      ))}
    </article>
  )
}
