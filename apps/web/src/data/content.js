// Single source of truth for every piece of content on the site.
// Sourced from the CV (ismail-bellakhel-cv.pdf) and the public GitHub showcase repos.

export const profile = {
  name: 'Ismail Bellakhel',
  role: 'Technical Marketing Manager',
  tagline: 'Growth · Analytics · AI',
  email: 'ismail.bellakhel@gmail.com',
  // Two reachable numbers. The Swedish one is the one printed on the CV, so
  // it leads here too.
  phones: [
    { label: 'Phone (SE)', value: '+46 76 234 66 69' },
    { label: 'Phone (NO)', value: '+47 465 98 348' },
  ],
  linkedin: 'https://www.linkedin.com/in/ismailbellakhel/',
  github: 'https://github.com/ismail-bellakhel',
  site: 'https://ismailbellakhel.com',
  cv: '/ismail-bellakhel-cv.pdf',
  summary:
    'I connect marketing strategy to measurement, automation and AI, building the systems that turn raw signal into commercial decisions.',
  longSummary:
    '15+ years across digital growth, analytics and commercial strategy. I build and integrate tracking, data pipelines and CRM systems to improve measurement and automate workflows, working with marketing, commercial and technical teams to turn data into decisions across Norway, Sweden, France, Belgium, Morocco, the UAE and Canada.',
};

// Headline numbers for the hero ticker.
export const headline = [
  { value: 161, suffix: '%', label: 'Google Discover growth' },
  { value: 125, suffix: '%', label: 'YoY ad revenue growth' },
  { value: 1, suffix: 'M+', label: 'Weekly readers' },
  { value: 550, prefix: '$', suffix: 'K', label: 'Budget directed' },
];

// Markets, rendered as real circular flags in the Sectors/Markets band.
export const markets = [
  { code: 'no', name: 'Norway' },
  { code: 'se', name: 'Sweden' },
  { code: 'fr', name: 'France' },
  { code: 'be', name: 'Belgium' },
  { code: 'ma', name: 'Morocco' },
  { code: 'ae', name: 'UAE' },
  { code: 'ca', name: 'Canada' },
  { code: 'us', name: 'United States' },
];

// Levels follow the CV. Arabic is not printed there but is spoken natively,
// so it stays on the site.
export const languages = [
  { name: 'English', level: 'C2' },
  { name: 'French', level: 'Native' },
  { name: 'Arabic', level: 'Native' },
  { name: 'Swedish', level: 'B1' },
  { name: 'Norwegian', level: 'A2' },
];

// Work experience. `logo` is a locally hosted brand mark; `domain` is the
// remote favicon fallback if that file ever goes missing.
export const experience = [
  {
    company: 'DagensPS / Rlvnc Media',
    domain: 'dagensps.se',
    logo: '/companies/dagensps.png',
    role: 'Growth Marketing Manager',
    location: 'Stockholm',
    start: '2024-01',
    end: '2026-08',
    period: 'Jan 2024 to Aug 2026',
    sector: 'News Media',
    summary:
      'Led a data-driven audience growth and monetisation strategy across Nordic publishing brands, integrating SEO/GEO, analytics, AdTech, experimentation and AI-enabled workflows to drive organic acquisition, advertising revenue and commercial performance. Reported to the COO, CEO and CMO.',
    highlights: [
      'Grew Google Discover traffic by 161% through Core Web Vitals improvements and AI-enabled workflows to audit, test and monitor deployments, scaling DagensPS to 1M+ weekly readers and contributing to its 2024 Swedish SEO Award.',
      'Improved consent performance (+12% opt-ins, −18% opt-outs), technical SEO, UX and advertising operations, contributing to 125% YoY advertising revenue growth.',
      'Used pre/post analysis, A/B tests, attribution and MMM to assess programmatic and native advertising across social media, newsletters, affiliates and websites. Native ad tests improved delivery by 15%.',
      'Improved first-party tracking by standardising events in data layers and using server-side tracking, Google Analytics and Google Tag Manager, validating the data and comparing campaign performance in SQL.',
    ],
    stack: ['ga4', 'googletagmanager', 'googlebigquery', 'python', 'looker'],
  },
  {
    company: 'HusmanHagberg',
    domain: 'husmanhagberg.se',
    logo: '/companies/husmanhagberg.svg',
    role: 'Performance Marketing Consultant',
    location: 'Stockholm',
    start: '2022-12',
    end: '2023-11',
    period: 'Dec 2022 to Nov 2023',
    sector: 'Real Estate',
    summary:
      'Directed a data-driven, full-funnel performance marketing strategy integrating SEO/GEO, paid acquisition, CRO, CRM automation and experimentation to drive qualified lead generation, optimise customer acquisition costs and maximise marketing ROI.',
    highlights: [
      'Reduced customer acquisition cost by 20% while increasing qualified leads through Google Ads, Meta Ads, audience segmentation and continuous campaign optimisation.',
      'Built automated GA4/SQL dashboards in Looker Studio, consolidating ROAS, CAC, CPL, conversion rates and lead quality to support performance measurement and budget allocation.',
      'Optimised acquisition funnels through SEO-driven content, landing page improvements, A/B testing and CRM-based lead nurturing to strengthen conversion performance.',
    ],
    stack: ['googleads', 'meta', 'ga4', 'looker'],
  },
  {
    company: 'Life Fitness',
    domain: 'lifefitness.com',
    logo: '/companies/lifefitness.svg',
    role: 'Marketing Manager',
    location: 'International / Remote',
    start: '2020-12',
    end: '2022-11',
    period: 'Dec 2020 to Nov 2022',
    sector: 'Fitness & Wellbeing',
    summary:
      'Drove the MENA market expansion and go-to-market strategy for a U.S. fitness brand, overseeing market development, brand positioning, multichannel acquisition and strategic partnerships while managing a $550K annual marketing budget and cross-functional teams.',
    highlights: [
      'Negotiated and secured 30+ strategic partnerships and corporate agreements during COVID-19, expanding commercial opportunities and strengthening regional market presence.',
      'Directed integrated marketing initiatives across SEO, Google Ads, Meta Ads, PR and content marketing, aligning acquisition, brand awareness and business development objectives.',
      'Coordinated marketing, sales and operations teams, introducing automation and training initiatives to improve execution and digital capabilities.',
    ],
    stack: ['googleads', 'meta', 'googleanalytics'],
  },
  {
    company: 'ILT Education',
    domain: 'ilteducation.com',
    logo: '/companies/ilteducation.png',
    role: 'Marketing Specialist',
    location: 'Stockholm',
    start: '2019-12',
    end: '2020-11',
    period: 'Dec 2019 to Nov 2020',
    sector: 'EdTech',
    summary:
      'Executed a dual-track B2B2C go-to-market strategy for the French market, combining Account-Based Marketing (ABM), brand awareness, content-driven SEO and multichannel demand generation to support acquisition and market adoption.',
    highlights: [
      'Developed and optimised SEO-driven content strategies, integrating keyword research, content localisation and organic search visibility with broader brand awareness campaigns.',
      'Coordinated targeted LinkedIn ABM campaigns alongside Google and Meta campaigns, aligning paid media, content and audience engagement with acquisition objectives.',
      'Built automated HubSpot lifecycle journeys and CRM segmentation across onboarding, retention and reactivation, using A/B testing to optimise engagement and campaign messaging.',
    ],
    stack: ['hubspot', 'googleads', 'linkedin'],
  },
  {
    company: 'Concentrix',
    domain: 'concentrix.com',
    logo: '/companies/concentrix.png',
    role: 'Market Insight Specialist',
    location: 'Paris',
    start: '2014-04',
    end: '2019-04',
    period: 'Apr 2014 to Apr 2019',
    sector: 'Telecommunications',
    summary:
      'Integrated competitive intelligence and Salesforce customer data into telecom benchmarking and forecasting workflows, applying product, interaction and lifecycle segmentation to support market entry, product launches and commercial decisions.',
    highlights: [
      'Analysed competitors, commercial offers, market trends and positioning, translating complex market data into actionable insight for stakeholders.',
      'Collected and transformed competitive intelligence, product benchmarks and Salesforce customer and sales data into advanced segments by product, customer interactions and lifecycle stage.',
      'Partnered with developers to deliver these datasets through a telecom benchmarking and forecasting tool, enabling leadership to inform product launches and sales, service and operations teams to assess customer needs and competing offers.',
    ],
    stack: ['microsoftsqlserver', 'powerbi', 'microsoftexcel'],
  },
  {
    company: 'Concentrix',
    domain: 'concentrix.com',
    logo: '/companies/concentrix.png',
    role: 'B2B Sales Specialist',
    location: 'Paris',
    // Year granularity only: this role predates the CV, which starts at the
    // Market Insight Specialist post above.
    start: '2010',
    end: '2014',
    period: '2010 to 2014',
    sector: 'SaaS & Accounting Software',
    summary:
      'Drove outbound sales for a SaaS accounting software provider, targeting financial services firms and business finance teams. Combined account segmentation with consultative selling to connect software capabilities to accounting needs and purchasing priorities.',
    highlights: [
      'Segmented accounts by industry, company size and lifecycle stage to prioritise prospects and develop targeted outreach strategies.',
      'Tailored sales conversations to financial decision-makers, exploring accounting workflows, operational challenges and software requirements.',
      "Used CRM insights to track opportunities, address objections and adapt follow-up to each account's buying stage.",
    ],
    // No named tooling given for this role, and the logo strip is skipped
    // rather than filled with a guess.
    stack: [],
  },
];

export const education = {
  school: 'Specialized Institute of Applied Technologies (ICT)',
  degree: "Bachelor's Degree in Technical Marketing & E-Business",
  modules: [
    'Market Analysis',
    'Data Analytics',
    'Growth Methodologies',
    'Marketing Technologies',
    'Data Visualisation',
    'Data Privacy',
    'Business Management',
    'Marketing Psychology',
  ],
};

// Sectors. Each gets a themed icon and a live background motif.
// `short` is the label drawn under this sector's column in the background
// canvas, where there is roughly 70px of room at 10px type.
export const sectors = [
  {
    key: 'newsMedia',
    title: 'News Media',
    short: 'News Media',
    icon: 'Newspaper',
    description:
      'Technical SEO, audience growth, advertising monetisation, measurement and AI-supported editorial workflows.',
    metric: '1M+ weekly readers',
  },
  {
    key: 'realEstate',
    title: 'Real Estate',
    short: 'Real Estate',
    icon: 'Building2',
    description:
      'SEO, SEM, CRO, lead generation, performance measurement and paid media optimisation.',
    metric: '−20% CAC',
  },
  {
    key: 'edtech',
    title: 'EdTech',
    short: 'EdTech',
    icon: 'GraduationCap',
    description:
      'CRM lifecycle automation, paid acquisition, funnel analysis and customer communications.',
    metric: 'French market launch',
  },
  {
    key: 'fitness',
    title: 'Fitness & Wellbeing',
    short: 'Fitness',
    icon: 'Dumbbell',
    description:
      'Go-to-market strategy, budget leadership, partnerships and cross-functional growth across MENA.',
    metric: '$550K budget',
  },
  {
    key: 'telecom',
    title: 'Telecommunications',
    short: 'Telecom',
    icon: 'RadioTower',
    description:
      'Competitive intelligence, CRM data, market benchmarking and executive reporting for the French market.',
    metric: '5 years insight',
  },
  {
    key: 'automotive',
    title: 'Automotive Retail',
    short: 'Automotive',
    icon: 'Car',
    description:
      'Headless dealership delivery, vehicle catalogue SEO and inventory publishing automation.',
    metric: 'Live inventory sync',
  },
];

// Case studies. Verified outcomes only.
export const cases = [
  {
    title: 'Google Discover Growth',
    metric: 161,
    suffix: '%',
    company: 'DagensPS',
    description:
      'Turned technical SEO into a scalable growth engine, increasing Google Discover traffic by 161%.',
    tags: ['Technical SEO', 'Audience'],
  },
  {
    title: 'Advertising Revenue',
    metric: 125,
    suffix: '%',
    company: 'Rlvnc Media',
    description:
      'Expanded monetisable inventory and improved consent coverage, contributing to 125% YoY advertising revenue growth.',
    tags: ['AdTech', 'Monetisation'],
  },
  {
    title: 'Swedish SEO Award 2024',
    metric: null,
    display: 'Winner',
    company: 'News Media category',
    description:
      'Contributed to the work that won the 2024 Swedish SEO Award in the News Media category.',
    tags: ['Award'],
    featured: true,
  },
  {
    title: 'Weekly Audience',
    metric: 1,
    suffix: 'M+',
    company: 'DagensPS',
    description:
      'Grew DagensPS past one million weekly readers through a scalable technical SEO growth engine.',
    tags: ['Audience'],
  },
  {
    title: 'Network Audience',
    metric: 3,
    suffix: 'M+',
    company: 'Rlvnc Media',
    description:
      'Grew Rlvnc Media past three million readers across its news platforms and newsletters.',
    tags: ['Audience'],
  },
  {
    title: 'First-Party Measurement',
    metric: null,
    display: 'sGTM',
    company: 'DagensPS',
    description:
      'Defined KPI, event-tracking, data-layer and experimentation standards, then implemented GTM and server-side GTM.',
    tags: ['Measurement'],
  },
  {
    title: 'Consent Optimisation',
    metric: 18,
    suffix: '%',
    company: 'DagensPS',
    description:
      'Increased consent opt-ins by ~12% and reduced opt-outs by ~18%, widening the measurable audience.',
    tags: ['Privacy', 'Measurement'],
  },
  {
    title: 'Acquisition Cost',
    metric: 20,
    prefix: '−',
    suffix: '%',
    company: 'HusmanHagberg',
    description:
      'Managed Google Ads and Meta Ads campaigns, cutting acquisition cost 20% while increasing qualified leads.',
    tags: ['Paid Media', 'CRO'],
  },
  {
    title: 'Campaign Delivery',
    metric: 15,
    suffix: '%',
    company: 'DagensPS',
    description:
      'Improved native campaign delivery speed by reformulating bidding logic, validated through structured A/B tests.',
    tags: ['Experimentation'],
  },
  {
    title: 'Analytics Pipelines',
    metric: null,
    display: 'Python',
    company: 'DagensPS',
    description:
      'Developed API-driven pipelines delivering analytics data into Tableau and Looker Studio dashboards.',
    tags: ['Data Engineering'],
  },
  {
    title: 'Budget Directed',
    metric: 550,
    prefix: '$',
    suffix: 'K',
    company: 'Life Fitness',
    description:
      'Owned the annual MENA marketing budget across paid media, SEO, PR and partnerships, and the team spending it.',
    tags: ['Leadership'],
  },
  {
    title: 'Partnerships Closed',
    metric: 30,
    suffix: '+',
    company: 'Life Fitness',
    description:
      'Negotiated and signed strategic partnerships and corporate agreements through COVID-19, opening revenue in a market that had stalled.',
    tags: ['Partnerships', 'Revenue'],
  },
  {
    title: 'Market Intelligence',
    metric: 5,
    suffix: ' yrs',
    company: 'Concentrix',
    description:
      'Ran competitor, pricing and positioning analysis for French telecom, turning market data into commercial decisions.',
    tags: ['Market Analysis', 'Competitive Intel'],
  },
];

// Projects, from the public GitHub showcase repositories.
export const projects = [
  {
    slug: 'growth-intelligence',
    name: 'Growth Intelligence',
    kicker: 'Product · Designed & built',
    summary:
      'A workspace that connects growth evidence, performance review, experiment planning and reporting in one place.',
    description:
      'Command Center, SEO/GEO/AEO review, paid campaigns, pipeline & attribution, a Growth Lab for experiments, drag-to-organise BI reports, signals & alerts, automations and integrations. The public walkthrough runs the real interface against an empty example workspace so metrics stay honest rather than invented.',
    image: '/projects/growth-intelligence.jpg',
    live: 'https://ismail-bellakhel.github.io/growth-intelligence-showcase/',
    repo: 'https://github.com/ismail-bellakhel/growth-intelligence-showcase',
    liveLabel: 'Open app preview',
    stack: ['react', 'typescript', 'tailwindcss', 'googlebigquery', 'python'],
    tags: ['Product design', 'Growth tooling', 'BI'],
    featured: true,
  },
  {
    slug: 'br-stockholm-bil',
    name: 'BR Stockholm Bil',
    kicker: 'Live site · Headless + automation',
    summary:
      'A dealership website connecting vehicle listings, technical SEO and a repeatable publishing workflow.',
    description:
      'Next.js frontend on WordPress content and inventory data. The sync workflow validates the source, normalises records, compares snapshots and reviews proposed removals before applying them, so an incomplete upstream response can never silently archive the catalogue. GitHub Actions drives repeatable deployment and inventory runs.',
    image: '/projects/br-stockholm-bil.jpg',
    live: 'https://www.brstockholmbil.se/',
    repo: 'https://github.com/ismail-bellakhel/br-stockholm-bil-showcase',
    liveLabel: 'Open live site',
    stack: ['nextdotjs', 'wordpress', 'javascript', 'githubactions'],
    tags: ['Headless', 'Technical SEO', 'Data quality'],
    featured: true,
  },
  {
    slug: 'chatflow',
    name: 'ChatFlow',
    kicker: 'Prototype · Chat, leads & inbox',
    summary:
      'How website questions become answers, human conversations and follow-up opportunities.',
    description:
      'A website widget, conversation inbox with lead context, FAQ configuration with keyword matching and human fallback, plus conversation and lead analytics covering activity, response time and source/funnel views.',
    image: '/projects/chatflow-inbox.jpg',
    gallery: [
      '/projects/chatflow-inbox.jpg',
      '/projects/chatflow-analytics.jpg',
      '/projects/chatflow-faq.jpg',
    ],
    repo: 'https://github.com/ismail-bellakhel/chatflow-showcase',
    stack: ['react', 'javascript', 'nodedotjs'],
    tags: ['Product', 'Lead capture', 'Analytics'],
  },
  {
    slug: 'modular-homes',
    name: 'Modular Homes',
    kicker: 'Concept · Scroll-led experience',
    summary:
      'A scroll-led journey from a building site to a finished home, with a bilingual house catalogue.',
    description:
      'A visual website concept for prefabricated houses and mobile homes: scroll-driven narrative, catalogue and product pages, process/delivery/enquiry flows, and Swedish/English switching.',
    image: '/projects/modular-homes.jpg',
    live: 'https://modular-house-r731p2zz1-ismails-projects-52d79716.vercel.app/en',
    repo: 'https://github.com/ismail-bellakhel/modular-homes-showcase',
    liveLabel: 'Open the concept',
    stack: ['react', 'tailwindcss', 'vercel'],
    tags: ['Concept', 'Motion', 'i18n'],
  },
  {
    // `live` is the alpha deployment, NOT pov-agency-site.vercel.app. That
    // subdomain resolves to an unrelated agency, so it must never be linked.
    slug: 'pov-agency',
    name: 'POV Agency',
    kicker: 'Freelance venture · AI systems',
    summary:
      'An AI agency practice packaging marketing and customer-service automation into systems clients can actually run.',
    description:
      'Positioning, offer design and the site itself: AI systems for marketing and customer service, from conversational support to content and reporting workflows, with interactive demos in the public showcase.',
    image: '/projects/pov-agency.jpg',
    live: 'https://pov-agency-site-alpha.vercel.app/',
    repo: 'https://github.com/ismail-bellakhel/pov-agency-showcase',
    liveLabel: 'Open the site',
    stack: ['react', 'typescript', 'tailwindcss', 'vite'],
    tags: ['Freelance', 'AI systems', 'Positioning'],
  },
  {
    slug: 'pov-studio',
    name: 'POV Studio',
    kicker: 'Concept · 3D capture & digital twins',
    summary:
      'A scroll-led flight through twelve Oslo locations, each one introducing a capture service.',
    description:
      'A site concept for an Oslo studio doing drone capture, LiDAR scanning, 360° tours and digital twins. The scroll flies through twelve real locations, switching scan treatment at each stop, then lands on a product page and a reporting dashboard so the capture work ties back to discovery.',
    image: '/projects/pov-studio.jpg',
    live: 'https://pov-studio-five.vercel.app/',
    repo: 'https://github.com/ismail-bellakhel/pov-studio-showcase',
    liveLabel: 'Open the demo',
    stack: ['react', 'typescript', 'threedotjs', 'vite'],
    tags: ['Concept', '3D capture', 'Motion'],
    // Gets the wide treatment like the two at the top, but closes the section
    // instead of opening it, so the row of three is not left with a gap.
    closing: true,
  },
];

// Technical stack. `slug` maps to a real brand logo, `fallback` to a lucide icon.
export const stack = [
  {
    title: 'Analytics & Measurement',
    icon: 'LineChart',
    tools: [
      { name: 'GA4', slug: 'googleanalytics', fallback: 'LineChart' },
      { name: 'BigQuery', slug: 'googlebigquery', fallback: 'Database' },
      { name: 'SQL', slug: 'postgresql', fallback: 'Database' },
      { name: 'GTM', slug: 'googletagmanager', fallback: 'Settings' },
    ],
  },
  {
    title: 'Technical SEO',
    icon: 'Search',
    tools: [
      { name: 'Search Console', slug: 'googlesearchconsole', fallback: 'Search' },
      { name: 'Ahrefs', slug: 'ahrefs', fallback: 'Search' },
      { name: 'Semrush', slug: 'semrush', fallback: 'Search' },
      { name: 'Matomo', slug: 'matomo', fallback: 'LineChart' },
    ],
  },
  {
    title: 'Web Development',
    icon: 'Code2',
    tools: [
      { name: 'HTML', slug: 'html5', fallback: 'Code2' },
      { name: 'CSS', slug: 'css', fallback: 'Layout' },
      { name: 'JavaScript', slug: 'javascript', fallback: 'Code2' },
    ],
  },
  {
    title: 'Ad Tech & Paid Media',
    icon: 'Target',
    tools: [
      { name: 'Google Ads', slug: 'googleads', fallback: 'Target' },
      { name: 'Meta Ads', slug: 'meta', fallback: 'Target' },
      { name: 'LinkedIn Ads', slug: 'linkedin', fallback: 'Target' },
    ],
  },
  {
    title: 'AI & LLMs',
    icon: 'Sparkles',
    tools: [
      { name: 'Claude', slug: 'anthropic', fallback: 'Bot' },
      { name: 'ChatGPT', slug: 'openai', fallback: 'Bot' },
      { name: 'Gemini', slug: 'googlegemini', fallback: 'Bot' },
    ],
  },
  {
    title: 'CRM & Automation',
    icon: 'Workflow',
    tools: [
      { name: 'HubSpot', slug: 'hubspot', fallback: 'Users' },
      // Self-hosted: Simple Icons dropped Salesforce, so the CDN slug 404s
      // and the row silently fell back to a generic lucide glyph.
      {
        name: 'Salesforce Data 360',
        logo: '/tools/salesforce.svg',
        fallback: 'Users',
      },
      { name: 'Zapier', slug: 'zapier', fallback: 'Workflow' },
      { name: 'n8n', slug: 'n8n', fallback: 'Workflow' },
    ],
  },
  {
    title: 'Product Analysis',
    icon: 'FlaskConical',
    tools: [
      { name: 'Optimizely', slug: 'optimizely', fallback: 'FlaskConical' },
      { name: 'Hotjar', slug: 'hotjar', fallback: 'MousePointerClick' },
      { name: 'Mixpanel', slug: 'mixpanel', fallback: 'LineChart' },
    ],
  },
  {
    title: 'BI & Data Visualisation',
    icon: 'BarChart3',
    tools: [
      { name: 'Looker Studio', slug: 'looker', fallback: 'LineChart' },
      { name: 'Power BI', slug: 'powerbi', fallback: 'BarChart3' },
      { name: 'Tableau', slug: 'tableau', fallback: 'BarChart3' },
    ],
  },
];

// Target roles, the browsable constellation.
export const roleGroups = {
  growth: {
    label: 'Growth',
    tint: '#60a5fa',
    roles: [
      'Growth Marketing Manager',
      'Performance Marketing Manager',
      'SEO / GEO Manager',
      'CRM & Lifecycle Manager',
    ],
  },
  analytics: {
    label: 'Analytics',
    tint: '#34d399',
    roles: [
      'Marketing Analytics Manager',
      'Product Analytics Manager',
      'Measurement & Attribution Lead',
    ],
  },
  ai: {
    label: 'AI',
    tint: '#a78bfa',
    roles: ['AI Marketing Manager', 'MarTech Manager', 'AI Solutions Manager'],
  },
  growthAnalytics: {
    label: 'Growth + Analytics',
    tint: '#4ade80',
    roles: ['Growth Analyst', 'CRM Analyst'],
  },
  growthAi: {
    label: 'Growth + AI',
    tint: '#818cf8',
    roles: ['Marketing Automation Manager'],
  },
  analyticsAi: {
    label: 'Analytics + AI',
    tint: '#2dd4bf',
    roles: ['Marketing Operations Manager'],
  },
  all: {
    label: 'Growth + Analytics + AI',
    tint: '#f8fafc',
    roles: ['Technical Marketing Manager'],
  },
};

/*
  Alva Labs assessments.

  Everything here is read straight off the two PDF reports. Scores are Alva's
  own 1-10 standard scale, where 5 and 6 are the population average, and the
  percentile bands are quoted in Alva's wording rather than converted, because
  a band is not a point and rounding it to one would overstate the precision.
*/
export const assessment = {
  provider: 'Alva Labs',
  logic: {
    title: 'Logical ability',
    score: 9,
    band: 'Above average',
    percentile: '93rd to 98th percentile',
    blurb:
      "Alva's logic test measures how efficiently you process complex information and draw accurate conclusions from it.",
    /*
      Every task answered, by difficulty.

      The test is adaptive: it keeps raising the difficulty until you start
      missing, so the shape of this is the result. Solved tasks sit below the
      score and missed ones above it, and where the two meet is the score.
      Reporting it this way rather than as a lone number is the honest version,
      since it shows the four misses at difficulty 10 as well as the hits.
    */
    tasks: [
      { d: 1, ok: 1, miss: 0 },
      { d: 2, ok: 1, miss: 0 },
      { d: 4, ok: 1, miss: 0 },
      { d: 5, ok: 1, miss: 0 },
      { d: 6, ok: 1, miss: 0 },
      { d: 7, ok: 2, miss: 1 },
      { d: 8, ok: 2, miss: 1 },
      { d: 9, ok: 2, miss: 0 },
      { d: 10, ok: 2, miss: 4 },
    ],
  },
  personality: {
    title: 'Five Factor profile',
    blurb:
      "Alva's personality test is built on the Five Factor model, the most validated framework for quantifying personality.",
    factors: [
      {
        key: 'agreeableness',
        name: 'Agreeableness',
        score: 9,
        label: 'Very Friendly',
        percentile: '93rd to 98th percentile',
        low: 'Detached',
        high: 'Friendly',
        tint: '#60a5fa',
        summary:
          'A markedly empathetic, friendly style when working with others, with a strong tendency to trust people and their intentions, which makes collaboration easy. Warm and consensus-seeking, and therefore reluctant to force a conflict.',
        facets: [
          {
            name: 'Compassion',
            label: 'Soft-hearted',
            score: 8,
            percentile: '84th to 93rd',
            low: 'Indifferent',
            high: 'Soft-hearted',
          },
          {
            name: 'Politeness',
            label: 'Polite',
            score: 7,
            percentile: '69th to 84th',
            low: 'Forthright',
            high: 'Polite',
          },
          {
            name: 'Trust',
            label: 'Very Trusting',
            score: 10,
            percentile: '98th and above',
            low: 'Sceptical',
            high: 'Trusting',
          },
        ],
      },
      {
        key: 'conscientiousness',
        name: 'Conscientiousness',
        score: 10,
        label: 'Very Diligent',
        percentile: '98th percentile and above',
        low: 'Relaxed',
        high: 'Diligent',
        tint: '#34d399',
        summary:
          'A very strong focus on achievement and responsibility. Works hard to reach goals and exceed expectations, with very high self-discipline and a clear preference for working in a structured way at a high tempo.',
        facets: [
          {
            name: 'Goal-striving',
            label: 'Industrious',
            score: 8,
            percentile: '84th to 93rd',
            low: 'Easy-going',
            high: 'Industrious',
          },
          {
            name: 'Carefulness',
            label: 'Very Careful',
            score: 9,
            percentile: '93rd to 98th',
            low: 'Spontaneous',
            high: 'Careful',
          },
          {
            name: 'Orderliness',
            label: 'Organized',
            score: 8,
            percentile: '84th to 93rd',
            low: 'Unstructured',
            high: 'Organized',
          },
        ],
      },
      {
        key: 'extraversion',
        name: 'Extraversion',
        score: 10,
        label: 'Very Outgoing',
        percentile: '98th percentile and above',
        low: 'Reserved',
        high: 'Outgoing',
        tint: '#a78bfa',
        summary:
          'Markedly outgoing and sociable with a very high energy level. Comfortable holding the social space, drawn to frequent discussion and a high level of activity, with a strong tendency to take the lead and put a view forward.',
        facets: [
          {
            name: 'Assertiveness',
            label: 'Very Assertive',
            score: 9,
            percentile: '93rd to 98th',
            low: 'Accommodative',
            high: 'Assertive',
          },
          {
            name: 'Sociability',
            label: 'Very Sociable',
            score: 9,
            percentile: '93rd to 98th',
            low: 'Solitary',
            high: 'Sociable',
          },
          {
            name: 'Energy level',
            label: 'Very Energetic',
            score: 10,
            percentile: '98th and above',
            low: 'Low-key',
            high: 'Energetic',
          },
        ],
      },
      {
        key: 'stability',
        name: 'Emotional Stability',
        score: 10,
        label: 'Very Resilient',
        percentile: '98th percentile and above',
        low: 'Sensitive',
        high: 'Resilient',
        tint: '#22d3ee',
        summary:
          'A markedly even temper and a strong tendency to stay calm and stable. Largely unshaken by what is happening around them, so they stay effective under high pressure, and resilient and optimistic after a setback.',
        facets: [
          {
            name: 'Optimism',
            label: 'Very Carefree',
            score: 10,
            percentile: '98th and above',
            low: 'Heavy-hearted',
            high: 'Carefree',
          },
          {
            name: 'Stability',
            label: 'Very Even-tempered',
            score: 10,
            percentile: '98th and above',
            low: 'Hot-tempered',
            high: 'Even-tempered',
          },
          {
            name: 'Stress tolerance',
            label: 'Very Composed',
            score: 9,
            percentile: '93rd to 98th',
            low: 'Concerned',
            high: 'Composed',
          },
        ],
      },
      {
        key: 'openness',
        name: 'Openness to Experience',
        score: 10,
        label: 'Very Innovative',
        percentile: '98th percentile and above',
        low: 'Conventional',
        high: 'Innovative',
        tint: '#818cf8',
        summary:
          'A strong interest in new impressions and experiences. Intellectual and learning-oriented, motivated by abstract problems, very open to change and drawn to finding new, creative solutions.',
        facets: [
          {
            name: 'Curiosity',
            label: 'Very Curious',
            score: 9,
            percentile: '93rd to 98th',
            low: 'Down-to-earth',
            high: 'Curious',
          },
          {
            name: 'Aesthetic orientation',
            label: 'Very Artistic',
            score: 10,
            percentile: '98th and above',
            low: 'Concrete',
            high: 'Artistic',
          },
          {
            name: 'Change orientation',
            label: 'Change-oriented',
            score: 7,
            percentile: '69th to 84th',
            low: 'Conservative',
            high: 'Change-oriented',
          },
        ],
      },
    ],
    strengths: [
      'Highly productive and able to work at a high tempo',
      'Determined and goal-oriented even in the face of difficulty',
      'Spreads enthusiasm and is seldom beaten down by setbacks',
    ],
    challenges: [
      'Could come across as pushy when wanting things done',
      'May overlook the need for rest due to high ambitions',
      'May sometimes overlook problems due to their optimistic view',
    ],
    drivers: ['Creativity', 'Relationships', 'Autonomy'],
    culture: ['Team-oriented', 'Energetic', 'Decisive'],
  },
};

export const writing = {
  title: 'Writing & Industry Analysis',
  description:
    'I write about sport, technology and the automotive industry, using research and analysis to examine market shifts and strategic developments.',
};

/*
  Signals.

  These are the payloads carried by the light travelling down the fibre
  strands in the background, and they are shown as text in the hero only.

  Three kinds: the outcomes, the measures behind them, and the tools used to
  read them. A result, the thing it was measured by, and the instrument that
  measured it. Nothing decorative.

  `value` is the bright part of the label, `label` the dim context beside it.
*/
const kpiSignals = cases.map((c) => ({
  value: c.display ?? `${c.prefix ?? ''}${c.metric}${c.suffix ?? ''}`,
  label: c.title,
}));

/*
  The measures each position was run on.

  The CV states outcomes. These are the dials underneath them: what was
  actually watched day to day in that seat, including the ones no result was
  written about. They are deliberately names without numbers. A KPI that was
  monitored is a fact about the work; a figure attached to it would be a claim,
  and every claim on this page is one the CV can stand behind.
*/
const positionMetrics = [
  {
    at: 'DagensPS',
    metrics: [
      'Core Web Vitals',
      'Crawl Budget',
      'Index Coverage',
      'Discover Impressions',
      'Organic CTR',
      'Consent Opt-in Rate',
      'Ad Viewability',
      'Fill Rate',
      'Session RPM',
      'Returning Readers',
      'Attribution Coverage',
      'Data Pipeline Freshness',
    ],
  },
  {
    at: 'HusmanHagberg',
    metrics: [
      'CAC',
      'ROAS',
      'Cost per Lead',
      'Lead Quality Score',
      'Funnel Conversion Rate',
      'Landing Page Speed',
      'Ad Relevance',
      'Nurture Engagement',
    ],
  },
  {
    at: 'Life Fitness',
    metrics: [
      'Budget Utilisation',
      'Partner Pipeline',
      'Market Penetration',
      'Share of Voice',
      'Campaign Reach',
      'Cost per Acquisition',
      'Sales Enablement Uptake',
    ],
  },
  {
    at: 'ILT Education',
    metrics: [
      'ABM Account Coverage',
      'Organic Visibility',
      'Keyword Rankings',
      'Lifecycle Conversion',
      'Email Engagement',
      'Localised Content Reach',
      'Demand Gen Pipeline',
    ],
  },
  {
    at: 'Concentrix',
    metrics: [
      'Competitive Price Index',
      'Offer Win Rate',
      'Market Share',
      'Churn Rate',
      'ARPU',
      'Benchmark Coverage',
    ],
  },
];

const measureSignals = positionMetrics.flatMap((p) =>
  p.metrics.map((m) => ({ value: m, label: p.at })),
);

const toolSignals = stack.flatMap((group) =>
  group.tools.map((t) => ({ value: t.name, label: group.title })),
);

export const signals = [...kpiSignals, ...measureSignals, ...toolSignals];

// Navigation / section registry. Order defines the page and the scroll spine.
export const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'experience', label: 'Experience' },
  { id: 'cases', label: 'Results' },
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Stack' },
  { id: 'roles', label: 'Roles' },
  { id: 'assessment', label: 'Alva' },
  { id: 'contact', label: 'Contact' },
];
