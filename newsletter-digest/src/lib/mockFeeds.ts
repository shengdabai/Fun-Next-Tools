export interface Article {
  id: string
  title: string
  url: string
  summary: string
  publishedAt: Date
  source: string
  sourceId: string
}

export interface FeedSource {
  id: string
  name: string
  url: string
  articles: Article[]
}

const now = new Date()
const h = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000)

export const MOCK_FEEDS: FeedSource[] = [
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    articles: [
      {
        id: 'tc-1',
        title: 'OpenAI Launches GPT-5 with Real-Time Reasoning Capabilities',
        url: 'https://techcrunch.com/2025/05/gpt5-launch',
        summary: 'OpenAI has officially unveiled GPT-5, its most capable model yet, featuring advanced real-time reasoning and a dramatically expanded context window. Early benchmarks show significant improvements across coding, math, and multi-step problem solving tasks.',
        publishedAt: h(2),
        source: 'TechCrunch',
        sourceId: 'techcrunch',
      },
      {
        id: 'tc-2',
        title: 'Anthropic Secures $2B in New Funding Round Led by Google',
        url: 'https://techcrunch.com/2025/05/anthropic-funding',
        summary: 'AI safety company Anthropic has raised an additional $2 billion in a funding round co-led by Google and a consortium of strategic investors. The capital will be used to expand Claude\'s capabilities and accelerate research into interpretability.',
        publishedAt: h(5),
        source: 'TechCrunch',
        sourceId: 'techcrunch',
      },
      {
        id: 'tc-3',
        title: 'Apple Intelligence Expands to 10 New Languages in iOS 18.5',
        url: 'https://techcrunch.com/2025/05/apple-intelligence-languages',
        summary: 'Apple has rolled out Apple Intelligence features to users in 10 additional languages, including Mandarin, Japanese, and French. The update also brings improvements to Writing Tools and a redesigned Siri interface with deeper app integration.',
        publishedAt: h(9),
        source: 'TechCrunch',
        sourceId: 'techcrunch',
      },
      {
        id: 'tc-4',
        title: 'Startup Raises $45M to Build AI-Powered Legal Document Review',
        url: 'https://techcrunch.com/2025/05/legal-ai-funding',
        summary: 'LegalMind, a San Francisco-based startup, has closed a $45M Series B to scale its AI-powered contract analysis platform. The tool cuts document review time by 80% and is already used by over 200 law firms across North America.',
        publishedAt: h(14),
        source: 'TechCrunch',
        sourceId: 'techcrunch',
      },
      {
        id: 'tc-5',
        title: 'Nvidia Unveils Next-Gen H200 Ultra GPU for AI Data Centers',
        url: 'https://techcrunch.com/2025/05/nvidia-h200-ultra',
        summary: 'Nvidia announced the H200 Ultra GPU, delivering 2.4x the training throughput of the H100. The chip is already on order from major cloud providers including AWS, Azure, and Google Cloud for deployment in AI supercomputing clusters.',
        publishedAt: h(20),
        source: 'TechCrunch',
        sourceId: 'techcrunch',
      },
    ],
  },
  {
    id: 'hackernews',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    articles: [
      {
        id: 'hn-1',
        title: 'Show HN: I built a local-first SQLite sync engine in Rust',
        url: 'https://news.ycombinator.com/item?id=40001',
        summary: 'A developer shares their open-source project implementing a conflict-free replicated data type (CRDT) based sync engine for SQLite, written in Rust. The project enables seamless offline-first apps with eventual consistency guarantees.',
        publishedAt: h(1),
        source: 'Hacker News',
        sourceId: 'hackernews',
      },
      {
        id: 'hn-2',
        title: 'The Bitter Lesson Revisited: Why Scale Still Wins in 2025',
        url: 'https://news.ycombinator.com/item?id=40002',
        summary: 'An in-depth essay argues that Rich Sutton\'s famous "Bitter Lesson" continues to hold true, with scale dominating specialized approaches across AI domains. The author reviews evidence from the past year of foundation model research.',
        publishedAt: h(4),
        source: 'Hacker News',
        sourceId: 'hackernews',
      },
      {
        id: 'hn-3',
        title: 'Postgres 17 Released: Major Performance Improvements and New Features',
        url: 'https://news.ycombinator.com/item?id=40003',
        summary: 'PostgreSQL 17 is out with a 30-40% improvement in vacuum performance, new MERGE command capabilities, and better logical replication. The release also adds support for incremental backup and improved JSON path functions.',
        publishedAt: h(7),
        source: 'Hacker News',
        sourceId: 'hackernews',
      },
      {
        id: 'hn-4',
        title: 'Ask HN: What\'s your current AI-assisted coding workflow?',
        url: 'https://news.ycombinator.com/item?id=40004',
        summary: 'A popular Ask HN thread gathers hundreds of responses from developers sharing how they\'ve integrated AI tools into their daily workflow. Top comments discuss Claude Code, Cursor, and Copilot, with nuanced takes on where AI excels vs. struggles.',
        publishedAt: h(11),
        source: 'Hacker News',
        sourceId: 'hackernews',
      },
      {
        id: 'hn-5',
        title: 'Bun 2.0 Brings Native TypeScript Compilation and 3x Faster Builds',
        url: 'https://news.ycombinator.com/item?id=40005',
        summary: 'Bun 2.0 launches with a revamped JavaScript bundler, native TypeScript compilation without transpilation overhead, and significant improvements to its Node.js compatibility layer. Benchmarks show 3x faster cold build times vs. esbuild.',
        publishedAt: h(18),
        source: 'Hacker News',
        sourceId: 'hackernews',
      },
    ],
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    url: 'https://www.producthunt.com/feed',
    articles: [
      {
        id: 'ph-1',
        title: 'Notion AI 2.0 — Your entire workspace, now AI-native',
        url: 'https://www.producthunt.com/posts/notion-ai-2',
        summary: 'Notion AI 2.0 reimagines the workspace with deeply integrated AI that can read, write, and act across all your pages and databases. New features include AI-powered project management, auto-generated meeting summaries, and cross-workspace search.',
        publishedAt: h(3),
        source: 'Product Hunt',
        sourceId: 'producthunt',
      },
      {
        id: 'ph-2',
        title: 'Framer Sites — Ship stunning websites without code',
        url: 'https://www.producthunt.com/posts/framer-sites',
        summary: 'Framer launches Sites, a new product category focused on marketing and landing pages. It features AI-generated sections, one-click animations, and a library of 500+ professionally designed components that can be customized without any coding.',
        publishedAt: h(6),
        source: 'Product Hunt',
        sourceId: 'producthunt',
      },
      {
        id: 'ph-3',
        title: 'Linear Cycles — Sprint planning that actually works',
        url: 'https://www.producthunt.com/posts/linear-cycles',
        summary: 'Linear introduces Cycles, a lightweight sprint management feature built directly into its issue tracking workflow. Teams can now plan two-week cycles, track progress with burndown charts, and retrospect with AI-generated insights.',
        publishedAt: h(10),
        source: 'Product Hunt',
        sourceId: 'producthunt',
      },
      {
        id: 'ph-4',
        title: 'Raycast Pro — Supercharge your Mac productivity',
        url: 'https://www.producthunt.com/posts/raycast-pro',
        summary: 'Raycast Pro upgrades the popular Mac launcher with AI-powered commands, unlimited cloud sync, team sharing, and a new snippet library. The Pro tier also unlocks custom Raycast Extensions and priority access to new AI models.',
        publishedAt: h(16),
        source: 'Product Hunt',
        sourceId: 'producthunt',
      },
      {
        id: 'ph-5',
        title: 'Clerk Organizations — Multi-tenant auth in minutes',
        url: 'https://www.producthunt.com/posts/clerk-organizations',
        summary: 'Clerk launches Organizations, making it trivial to add multi-tenant authentication to any web app. Developers get role-based permissions, invitation flows, and organization switching out of the box with just a few lines of configuration.',
        publishedAt: h(22),
        source: 'Product Hunt',
        sourceId: 'producthunt',
      },
    ],
  },
  {
    id: 'theverge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    articles: [
      {
        id: 'tv-1',
        title: 'Samsung Galaxy S25 Ultra Review: The Best Android Phone, Full Stop',
        url: 'https://www.theverge.com/reviews/galaxy-s25-ultra',
        summary: 'After two weeks with the Galaxy S25 Ultra, The Verge concludes it\'s the most complete Android flagship ever made. The new titanium frame, improved S Pen latency, and Snapdragon 8 Elite chip make it a compelling alternative to the iPhone 16 Pro Max.',
        publishedAt: h(2),
        source: 'The Verge',
        sourceId: 'theverge',
      },
      {
        id: 'tv-2',
        title: 'Apple Vision Pro 2 Leaks: Lighter Design, Better Battery, Lower Price',
        url: 'https://www.theverge.com/news/vision-pro-2-leaks',
        summary: 'New supply chain leaks suggest Apple Vision Pro 2 will weigh 150g less thanks to a new micro-OLED display and revised optical stack. Pricing is rumored to drop to $2,499, and Apple is said to be targeting enterprise customers with new productivity features.',
        publishedAt: h(8),
        source: 'The Verge',
        sourceId: 'theverge',
      },
      {
        id: 'tv-3',
        title: 'Sony WH-1000XM6 Review: The Gold Standard of Noise-Canceling Headphones',
        url: 'https://www.theverge.com/reviews/sony-wh-1000xm6',
        summary: 'Sony\'s latest flagship headphones set a new bar for noise cancellation and call quality. The XM6 introduces a six-mic beamforming array, 40-hour battery life, and a revised headband design that\'s more comfortable for all-day wear.',
        publishedAt: h(12),
        source: 'The Verge',
        sourceId: 'theverge',
      },
      {
        id: 'tv-4',
        title: 'Google Pixel 9a Hands-On: The Best Value Phone of 2025',
        url: 'https://www.theverge.com/news/pixel-9a-hands-on',
        summary: 'The Pixel 9a packs the same Tensor G4 chip as the flagship Pixel 9, adds Google\'s Gemini AI features, and ships with a 48MP camera — all for $499. Hands-on time confirms it feels premium despite the lower price tag.',
        publishedAt: h(19),
        source: 'The Verge',
        sourceId: 'theverge',
      },
      {
        id: 'tv-5',
        title: 'The EV Revolution Is Stalling — Here\'s What Went Wrong',
        url: 'https://www.theverge.com/analysis/ev-slowdown-2025',
        summary: 'An investigative report examines why EV adoption has plateaued in the US despite falling battery prices. The piece explores charging infrastructure gaps, insurance cost spikes, and shifting consumer sentiment as key factors in the slowdown.',
        publishedAt: h(23),
        source: 'The Verge',
        sourceId: 'theverge',
      },
    ],
  },
]
