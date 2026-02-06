'use client'

import { useCallback, useState } from 'react'
import { ArrowUpCircle, Copy, Check, MessageSquare, Bot, ExternalLink, Github } from 'lucide-react'
import { Button } from '@/lib/custom/ui/button'
import { siteConfig } from '@/lib/portfolio-data'

const actionStyles = "my-2 flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"

export function ScrollToTop() {
  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <button
      className={actionStyles}
      onClick={handleScrollToTop}
      type="button"
    >
      <ArrowUpCircle className="size-3.5" />
      <span>Scroll to top</span>
    </button>
  )
}

export function CopyPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const content = document.querySelector('article')?.innerText || ''
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const Icon = copied ? Check : Copy

  return (
    <button
      className={actionStyles}
      onClick={handleCopy}
      type="button"
    >
      <Icon className="size-3.5" />
      <span>{copied ? 'Copied!' : 'Copy page'}</span>
    </button>
  )
}

export function CopyPageButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const content = document.querySelector('article')?.innerText || ''
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const Icon = copied ? Check : Copy

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleCopy}
      className="shadow-none shrink-0"
      title={copied ? 'Copied!' : 'Copy Page'}
    >
      <Icon />
      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Page'}</span>
    </Button>
  )
}

export function EditOnGitHub({ slug }: { slug: string }) {
  const url = `${siteConfig.repo}/edit/main/apps/www-tron/blog/${slug}.mdx`

  return (
    <a
      className={actionStyles}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Github className="size-3.5" />
      <span>Edit this page on GitHub</span>
    </a>
  )
}

export function GiveFeedback({ slug }: { slug: string }) {
  const url = `${siteConfig.repo}/issues/new?title=Feedback on: ${slug}&labels=feedback`

  return (
    <a
      className={actionStyles}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <MessageSquare className="size-3.5" />
      <span>Give feedback</span>
    </a>
  )
}

export function AskAI({ slug }: { slug: string }) {
  const url = `https://claude.ai/new?q=${encodeURIComponent(`Help me understand this article: https://claycurry.com/blog/${slug}`)}`

  return (
    <a
      className={actionStyles}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Bot className="size-3.5" />
      <span>Ask AI about this page</span>
    </a>
  )
}

export function OpenInChat({ slug }: { slug: string }) {
  const url = `https://chatgpt.com/?q=${encodeURIComponent(`Summarize this article: https://claycurry.com/blog/${slug}`)}`

  return (
    <a
      className={actionStyles}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ExternalLink className="size-3.5" />
      <span>Open in chat</span>
    </a>
  )
}

export function ShareOnX({ slug, title }: { slug: string; title: string }) {
  const postUrl = `https://claycurry.com/blog/${slug}`
  const url = `https://x.com/intent/tweet?text=${encodeURIComponent(`"${title}"`)}&url=${encodeURIComponent(postUrl)}`

  return (
    <a
      className={actionStyles}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
      title="Share on X"
    >
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span className="hidden sm:inline">Share on X</span>
    </a>
  )
}

export function ShareOnLinkedIn({ slug }: { slug: string }) {
  const postUrl = `https://claycurry.com/blog/${slug}`
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`

  return (
    <a
      className={actionStyles}
      href={url}
      rel="noopener noreferrer"
      target="_blank"
      title="Share on LinkedIn"
    >
      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      <span className="hidden sm:inline">Share on LinkedIn</span>
    </a>
  )
}

export function PageActions({ slug }: { slug: string }) {
  return (
    <div className="p-4 bg-sidebar rounded-b-xl border border-sidebar-border">
      <div className="space-y-1">
        <EditOnGitHub slug={slug} />
        <ScrollToTop />
        <GiveFeedback slug={slug} />
        <CopyPage />
        <AskAI slug={slug} />
        <OpenInChat slug={slug} />
      </div>
    </div>
  )
}
