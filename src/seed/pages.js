/**
 * Phase 4 seed content for Page / GlobalBanner models.
 *
 * Legal fields are taken from license document images under
 * jdgold-fe/public/images/license-*.png where readable.
 * Unverified contact / marketing claims use [PLACEHOLDER: …] markers.
 * Image paths reference existing frontend public assets — no file copies.
 */

export const PAGE_SEEDS = [
  {
    title: 'Home',
    slug: 'home',
    pageType: 'home',
    metaTitle: 'JD Gold | Building Trust In Gold',
    metaDescription:
      'JD GOLD — trusted gold trading, refining, and jewellery with global presence.',
    isActive: true,
    sortOrder: 0,
    hero: {
      heading: 'JD GOLD',
      subheading: 'Building Trust In Gold',
      description:
        'Excellence and purity in gold trading, refining, and jewellery.',
      logoSrc: '/images/jd-gold-logo.png',
      brandTagline: 'Building Trust In Gold',
      image: '/images/product-investment-grade-bar.png',
      imageAlt: 'JD GOLD Fine Gold 999.9 bar',
    },
    // Home body remains in data/site.json / Figma home until a later CMS phase.
    sections: [],
  },
  {
    title: 'About JD Gold',
    slug: 'about',
    pageType: 'about',
    metaTitle: 'About JD Gold | Trust, Excellence & Quality',
    metaDescription:
      'Learn about JD GOLD — decades of trust, premium purity, and leadership in the gold industry.',
    isActive: true,
    sortOrder: 1,
    hero: {
      heading: 'ABOUT JD GOLD',
      subheading: 'Building Trust In Gold',
      description:
        'JD GOLD is a name of trust, excellence and quality in the gold industry.',
      logoSrc: '/images/jd-gold-logo.png',
      brandTagline: 'Building Trust In Gold',
      image: '/images/product-investment-grade-bar.png',
      imageAlt: 'JD GOLD Fine Gold 999.9 1000g bar',
      backgroundImage: '/images/product-cast-gold-bars.png',
    },
    sections: [
      {
        key: 'about-intro',
        type: 'text',
        sortOrder: 0,
        heading: 'ABOUT JD GOLD',
        description:
          'JD GOLD is a name of trust, excellence and quality in the gold industry. With decades of experience, a commitment to purity, and customer satisfaction, we continue to set new benchmarks in the world of gold trading, refining, and jewelry.',
        subheading:
          'We believe in honesty, transparency, and building lasting relationships with our clients worldwide.',
      },
      {
        key: 'pillars',
        type: 'features',
        sortOrder: 1,
        heading: 'Our Pillars',
        features: [
          {
            title: 'TRUSTED LEGACY',
            description:
              'Built on decades of trust, integrity, and excellence in the gold industry.',
            icon: 'shield',
          },
          {
            title: 'PREMIUM QUALITY',
            description:
              'We deal in 99.9% pure gold, ensuring the highest international standards.',
            icon: 'diamond',
          },
          {
            title: 'INTEGRITY & TRANSPARENCY',
            description:
              'Our business is built on honesty, transparency, and ethical gold practices.',
            icon: 'handshake',
          },
          {
            title: 'GLOBAL PRESENCE',
            description:
              'Proudly serving clients across the globe with dedication and professionalism.',
            icon: 'globe',
          },
        ],
      },
      {
        key: 'leadership',
        type: 'leadership',
        sortOrder: 2,
        heading: 'OUR LEADERSHIP',
        leadership: [
          {
            title: 'DIRECTOR & FOUNDER',
            name: 'Syed Abid Hussain Bukhari',
            experience: '45 Years Experience in Gold Industry',
            image: '/images/management-lead-1.png',
            imageAlt: 'Syed Abid Hussain Bukhari',
          },
          {
            title: 'CHAIRMAN & FOUNDER',
            name: 'Syed Amir Abid Bukhari',
            experience: '15 Years Experience in Gold Industry',
            image: '/images/management-lead-2-new.png',
            imageAlt: 'Syed Amir Abid Bukhari',
          },
          {
            title: 'CEO & CO-FOUNDER',
            name: "Ma'am Dilara Amir Bukhari",
            experience: '10 Years Experience in Gold Industry',
            image: '/images/management-lead-dilara-new.png',
            imageAlt: "Ma'am Dilara Amir Bukhari",
          },
        ],
      },
      {
        key: 'jewellery-department',
        type: 'gallery',
        sortOrder: 3,
        heading: 'JD GOLD JEWELLERY DEPARTMENT',
        subheading: "Managed By Ma'am Dilara Amir Bukhari",
        description:
          "Our Jewellery Department is managed by Ma'am Dilara Amir Bukhari, ensuring creativity, quality, and customer satisfaction in every piece we create.",
        gallery: [
          {
            url: '/images/hero-slide-whatsapp-03.png',
            alt: 'JD Gold jewellery department — production and counter',
            order: 0,
          },
          {
            url: '/images/management-collage-01.png',
            alt: 'JD Gold jewellery display',
            order: 1,
          },
        ],
      },
      {
        key: 'jewellery-collection',
        type: 'gallery',
        sortOrder: 4,
        heading: 'OUR JEWELLERY COLLECTION',
        gallery: [
          {
            url: '/images/hero-slide-whatsapp-04.png',
            alt: 'Gold bracelet inventory display',
            order: 0,
          },
          {
            url: '/images/hero-slide-whatsapp-05.png',
            alt: 'Gold pendant collection tray',
            order: 1,
          },
          {
            url: '/images/hero-slide-whatsapp-06.png',
            alt: 'Engraved pendant assortment',
            order: 2,
          },
          {
            url: '/images/hero-slide-whatsapp-07.png',
            alt: 'Gold chain bundles in production tray',
            order: 3,
          },
          {
            url: '/images/management-collage-01.png',
            alt: 'Jewellery collection gallery',
            order: 4,
          },
        ],
      },
      {
        key: 'commitment',
        type: 'features',
        sortOrder: 5,
        heading: 'OUR COMMITMENT',
        description:
          'At JD GOLD, we are committed to delivering excellence in every gram of gold and every piece of jewellery. Your trust is our greatest asset.',
        image: '/images/product-cast-gold-bars.png',
        features: [
          {
            title: 'BEST QUALITY',
            description: 'Guaranteed purity and authenticity.',
            icon: 'badge',
          },
          {
            title: 'FAIR PRICING',
            description: 'Transparent rates and fair deals.',
            icon: 'scale',
          },
          {
            title: 'SAFE & SECURE',
            description: 'Secure transactions and data protection.',
            icon: 'lock',
          },
          {
            title: 'CUSTOMER SATISFACTION',
            description: 'Your satisfaction is our top priority.',
            icon: 'people',
          },
        ],
      },
      {
        key: 'contact',
        type: 'cards',
        sortOrder: 6,
        heading: 'Contact',
        cards: [
          {
            title: 'Phone',
            description: '[PLACEHOLDER: Official public phone number]',
            icon: 'phone',
          },
          {
            title: 'WhatsApp',
            description: '+86 18340320420',
            icon: 'whatsapp',
          },
          {
            title: 'Email',
            description: 'info@jdgold.com',
            icon: 'email',
          },
          {
            title: 'Website',
            description: 'www.jdgold.com',
            link: 'https://www.jdgold.com',
            icon: 'globe',
          },
          {
            title: 'Address',
            description:
              '[PLACEHOLDER: Official public street address — replace with verified HQ address]',
            icon: 'location',
          },
        ],
      },
    ],
  },
  {
    title: 'License & Offices',
    slug: 'license-and-offices',
    pageType: 'license-offices',
    metaTitle: 'JD Gold License & Offices | Global Presence',
    metaDescription:
      'JD GOLD licenses and offices across China/Hong Kong, Dubai, Qatar, Pakistan, USA, and Uganda.',
    isActive: true,
    sortOrder: 2,
    hero: {
      heading: 'JD GOLD LICENSE & OFFICES',
      subheading: 'GLOBAL LICENSES. WORLDWIDE OFFICES. TRUSTED EVERYWHERE.',
      logoSrc: '/images/jd-gold-logo.png',
      image: '/images/product-investment-grade-bar.png',
      imageAlt: 'JD GOLD Fine Gold 999.9 bar',
    },
    sections: [
      {
        key: 'offices',
        type: 'offices',
        sortOrder: 0,
        heading: 'JD GOLD LICENSE & OFFICES',
        subheading: 'GLOBAL LICENSES. WORLDWIDE OFFICES. TRUSTED EVERYWHERE.',
        offices: [
          {
            number: 1,
            country: 'CHINA',
            flagSrc: '/images/flags/china.svg',
            details: [
              {
                label: 'LICENSE TYPE',
                value: 'Business Registration Certificate',
              },
              {
                label: 'LICENSE / CERTIFICATE',
                value: 'Hong Kong Inland Revenue Department',
              },
              {
                label: 'REGISTERED COMPANY',
                value: 'JD GOLD CO., LIMITED',
              },
              {
                label: 'CERTIFICATE NUMBER',
                value: '77803274-000-03-25-5',
              },
              { label: 'COMMENCEMENT DATE', value: '06/03/2025' },
              { label: 'EXPIRY DATE', value: '05/03/2026' },
              {
                label: 'REGISTERED ADDRESS',
                value:
                  'RM 511, 5/F, Ming Sang Ind Bldg, 19-21 Hing Yip Street, Kwun Tong, Hong Kong',
              },
            ],
            officeLocation: 'Hong Kong, China (Head Office)',
            licenseImage: '/images/license-hong-kong-incorporation.png',
            licenseImageAlt:
              'Hong Kong Business Registration Certificate — JD GOLD CO., LIMITED',
            officeImage: '/images/management-collage-10.png',
            officeImageAlt:
              '[PLACEHOLDER: China / Hong Kong office photograph]',
          },
          {
            number: 2,
            country: 'DUBAI',
            flagSrc: '/images/flags/dubai.svg',
            details: [
              { label: 'LICENSE TYPE', value: 'Commercial License' },
              {
                label: 'LICENSE / CERTIFICATE',
                value: 'Dubai Economy & Tourism',
              },
              {
                label: 'REGISTERED COMPANY',
                value: 'JINENCHI INTERNATIONAL TRADING L.L.C',
              },
              { label: 'LICENSE NUMBER', value: '1183376' },
              { label: 'REGISTER NO.', value: '1974523' },
              { label: 'ISSUE DATE', value: '08/05/2023' },
              { label: 'EXPIRY DATE', value: '07/05/2024' },
              {
                label: 'OFFICE ADDRESS',
                value:
                  'Office No. 809, Business Bay, Bur Dubai, Dubai, United Arab Emirates',
              },
            ],
            officeLocation: 'Dubai, United Arab Emirates (Office)',
            licenseImage: '/images/license-dubai-ded-commercial-license.png',
            licenseImageAlt: 'Dubai DED commercial license',
            officeImage: '/images/location-dubai-refinery.png',
            officeImageAlt: 'JD Gold Dubai location / refinery exterior',
          },
          {
            number: 3,
            country: 'QATAR',
            flagSrc: '/images/flags/qatar.svg',
            details: [
              { label: 'LICENSE TYPE', value: 'Commercial Registration' },
              {
                label: 'LICENSE / CERTIFICATE',
                value: 'Ministry of Commerce & Industry',
              },
              { label: 'TRADE NAME', value: 'JD Gold Company' },
              {
                label: 'COMMERCIAL REG. NO.',
                value: '1',
              },
              { label: 'ISSUE DATE', value: '20/07/2018' },
              { label: 'EXPIRY DATE', value: '19/07/2028' },
              {
                label: 'NOTE',
                value:
                  '[PLACEHOLDER: Confirm full Commercial Registration number with original CR extract — document scan shows "1"]',
              },
            ],
            officeLocation: 'Doha, Qatar (Office)',
            licenseImage: '/images/license-qatar-commercial-registration.png',
            licenseImageAlt: 'Qatar commercial registration data',
            officeImage: '/images/management-gallery-12.png',
            officeImageAlt: '[PLACEHOLDER: Qatar office photograph]',
          },
          {
            number: 4,
            country: 'PAKISTAN',
            flagSrc: '/images/flags/pakistan.svg',
            details: [
              { label: 'LICENSE TYPE', value: 'Certificate of Incorporation' },
              {
                label: 'LICENSE / CERTIFICATE',
                value: 'Securities & Exchange Commission of Pakistan (SECP)',
              },
              {
                label: 'REGISTERED COMPANY',
                value: 'JD GOLD TRADING L.L.C (PRIVATE) LIMITED',
              },
              { label: 'CUIN', value: '0110375' },
              { label: 'CERTIFICATE SERIAL', value: 'A031656' },
              { label: 'INCORPORATION DATE', value: '28 July 2017' },
              {
                label: 'COMPANY TYPE',
                value: 'Private Limited Company (limited by shares)',
              },
            ],
            officeLocation: 'Karachi, Pakistan (Office)',
            licenseImage: '/images/license-pakistan-secp-incorporation.png',
            licenseImageAlt: 'Pakistan SECP certificate of incorporation',
            officeImage: '/images/about-refinery-portrait.png',
            officeImageAlt: '[PLACEHOLDER: Pakistan office photograph]',
          },
          {
            number: 5,
            country: 'USA',
            flagSrc: '/images/flags/usa.svg',
            details: [
              {
                label: 'LICENSE TYPE',
                value: 'Certificate of Trading Licence',
              },
              {
                label: 'LICENSE / CERTIFICATE',
                value: 'Financial Service Commission',
              },
              {
                label: 'REGISTERED COMPANY',
                value: 'JD Gold Trading L.L.C',
              },
              { label: 'COMPANY NUMBER', value: '14597' },
              { label: 'ISSUE DATE', value: '20 February 2014' },
              {
                label: 'COMPANY TYPE',
                value:
                  'Gold Bullions, Nuggets, Jewelry Imports & Export Services',
              },
            ],
            officeLocation: 'New York, USA (Office)',
            licenseImage: '/images/license-usa-jd-gold-trading.png',
            licenseImageAlt: 'USA trading licence — JD Gold Trading L.L.C',
            officeImage: '/images/management-collage-16.png',
            officeImageAlt: '[PLACEHOLDER: USA office photograph]',
          },
          {
            number: 6,
            country: 'UGANDA',
            flagSrc: '/images/flags/uganda.svg',
            details: [
              { label: 'LICENSE TYPE', value: 'Certificate of Incorporation' },
              {
                label: 'LICENSE / CERTIFICATE',
                value: 'Uganda Registration Services Bureau (URSB)',
              },
              {
                label: 'REGISTERED COMPANY',
                value: 'JD GOLD CO. LIMITED',
              },
              { label: 'REGISTRATION NUMBER', value: '80034124514441' },
              { label: 'INCORPORATION DATE', value: '27 April 2026' },
              {
                label: 'COMPANY TYPE',
                value: 'Private Limited By Shares',
              },
            ],
            officeLocation: 'Kampala, Uganda (Office)',
            licenseImage:
              '/images/license-uganda-certificate-of-incorporation.png',
            licenseImageAlt:
              'Uganda URSB certificate of incorporation — JD GOLD CO. LIMITED',
            officeImage: '/images/management-collage-18.png',
            officeImageAlt: '[PLACEHOLDER: Uganda office photograph]',
          },
        ],
      },
      {
        key: 'footer-points',
        type: 'features',
        sortOrder: 1,
        heading: 'Why Our Licenses Matter',
        features: [
          {
            title: 'Legally Licensed',
            description:
              'All licenses are valid and issued by respective government authorities.',
            icon: 'shield',
          },
          {
            title: 'Global Presence',
            description:
              'Strategic offices in key markets around the world.',
            icon: 'globe',
          },
          {
            title: 'Trust & Transparency',
            description:
              'Committed to legal compliance and ethical business practices.',
            icon: 'handshake',
          },
          {
            title: 'Excellence',
            description:
              'Delivering quality, value and excellence worldwide.',
            icon: 'trophy',
          },
        ],
      },
    ],
  },
  {
    title: 'Market, Advantages & Achievements',
    slug: 'factories-and-refinery',
    pageType: 'market-advantages',
    metaTitle: 'JD Gold Market, Advantages & Achievements',
    metaDescription:
      'Discover JD GOLD market advantages — quality, pricing, technology, experience, and achievements.',
    isActive: true,
    sortOrder: 3,
    hero: {
      heading: 'JD GOLD MARKET, ADVANTAGES & ACHIEVEMENTS',
      subheading: 'A LEADER IN PURITY. A LEGACY OF TRUST.',
      logoSrc: '/images/jd-gold-logo.png',
      image: '/images/product-cast-gold-bars.png',
      imageAlt: 'JD GOLD Fine Gold bar and coins',
    },
    sections: [
      {
        key: 'market-advantages',
        type: 'market-advantages',
        sortOrder: 0,
        heading: 'Market Advantages',
        marketAdvantages: [
          {
            number: '1',
            title: 'QUALITY',
            subtitle: 'OUR PROMISE OF PURITY',
            image: '/images/hero-slide-gold-bar-hand.png',
            imageAlt: 'JD Gold bar quality inspection',
            points: [
              'We source only the finest raw materials from trusted and verified suppliers.',
              'All our gold is 100% pure with 999.9 finest quality.',
              'International quality standards and strict quality control at every stage.',
              'Advanced assaying and testing to ensure perfection.',
              'Commitment to delivering unmatched quality and lasting value.',
            ],
            sideItems: [
              { title: '100% PURE GOLD 999.9' },
              { title: 'INTERNATIONAL QUALITY STANDARDS' },
              { title: 'STRICT QUALITY CONTROL' },
              { title: 'TRUSTED & VERIFIED SUPPLY CHAIN' },
            ],
          },
          {
            number: '2',
            title: 'PRICING',
            subtitle: 'TRANSPARENT. FAIR. COMPETITIVE.',
            image: '/images/product-cast-gold-bars.png',
            imageAlt: 'JD Gold bars — fair market pricing',
            points: [
              'Competitive pricing in the global gold market.',
              'Transparent and clear pricing with no hidden charges.',
              'Best value for money with assured purity.',
              'Long-term relationships built on trust and fairness.',
              'Flexible solutions tailored to client needs.',
            ],
            sideItems: [
              { title: 'MARKET-ALIGNED RATES' },
              { title: 'NO HIDDEN CHARGES' },
              { title: 'FLEXIBLE SOLUTIONS' },
              { title: 'TRANSPARENT TRADE' },
            ],
          },
          {
            number: '3',
            title: 'TECHNOLOGY',
            subtitle: 'INNOVATION THAT DELIVERS EXCELLENCE.',
            image: '/images/hero-slide-whatsapp-08.png',
            imageAlt: 'Modern refining technology',
            imageFirst: true,
            points: [
              'State-of-the-art refining and manufacturing technology.',
              'Advanced testing, assaying and quality verification systems.',
              'Secure digital systems for transparency and traceability.',
              'Continuous investment in innovation and modern infrastructure.',
              'Technology-driven operations for excellence and growth.',
            ],
            sideItems: [
              { title: 'ADVANCED MACHINERY' },
              { title: 'PRECISION ASSAYING' },
              { title: 'DIGITAL SECURITY' },
              { title: 'INNOVATION ALWAYS' },
            ],
          },
          {
            number: '4',
            title: 'EXPERIENCE',
            subtitle: 'YEARS OF TRUST. WORLDWIDE IMPACT.',
            image: '/images/hero-slide-company-wealth.png',
            imageAlt: 'Global shipping and trade',
            points: [
              'Years of experience have made us a name of trust in the global gold industry.',
              'Decades of expertise in gold trading, refining and distribution.',
              'Deep understanding of global markets and client needs.',
              'Skilled professionals and dedicated team.',
              'Strong global network and industry reputation.',
            ],
            sideItems: [
              { title: 'DECADES OF EXPERIENCE' },
              { title: 'GLOBAL MARKET EXPERTISE' },
              { title: 'LONG-TERM CLIENT RELATIONSHIPS' },
              { title: 'TRUSTED BY PARTNERS WORLDWIDE' },
            ],
          },
          {
            number: '5',
            title: 'SPEED OR RELIABILITY',
            subtitle: 'ON TIME. EVERY TIME.',
            image: '/images/product-gold-weighed.png',
            imageAlt: 'On-time delivery and reliability',
            imageFirst: true,
            points: [
              'We deliver on time, every time — with speed and reliability.',
              'Timely delivery and quick turnaround.',
              'Reliable logistics and secure transportation.',
              '24/7 operational support and client assistance.',
              'Consistent performance and commitment.',
              'Your trust is our responsibility.',
            ],
            sideItems: [
              { title: 'ON TIME DELIVERY' },
              { title: 'SECURE & RELIABLE LOGISTICS' },
              { title: '24/7 SUPPORT' },
              { title: 'TRUSTED WORLDWIDE' },
            ],
          },
        ],
      },
      {
        key: 'achievements',
        type: 'achievements',
        sortOrder: 1,
        heading:
          'OUR ACHIEVEMENTS ARE A REFLECTION OF OUR HARD WORK, DEDICATION AND CLIENT TRUST.',
        achievements: [
          {
            title: 'AWARDS',
            points: [
              'Committed to excellence in quality and purity.',
              '[PLACEHOLDER: Award / recognition name, year, and issuing body]',
              '[PLACEHOLDER: ISO / award certificate name, number, and issuing body]',
            ],
            image: '/images/management-gallery-award.png',
            imageAlt: 'Awards gallery',
          },
          {
            title: 'MAJOR CLIENTS',
            points: [
              'Serving banks, jewellers, investors and institutions.',
              'Long-term partnerships built on trust.',
              '[PLACEHOLDER: Named major clients — replace with approved client list]',
            ],
            image: '/images/management-collage-03.png',
            imageAlt: 'Major clients',
          },
          {
            title: 'COMPLETED PROJECTS',
            points: [
              'Supporting gold supply across industries and markets.',
              '[PLACEHOLDER: Named completed projects / volumes]',
              '[PLACEHOLDER: Project scope and delivery notes]',
            ],
            image: '/images/product-cast-gold-bars.png',
            imageAlt: 'Completed projects',
          },
          {
            title: 'GLOBAL PRESENCE',
            points: [
              'Offices in China, Dubai, Qatar, Pakistan, USA and Uganda.',
              'Strong global network and presence.',
              'Expanding for a brighter and golden future.',
            ],
            image: '/images/location-dubai-refinery.png',
            imageAlt: 'Global presence',
          },
        ],
      },
      {
        key: 'footer-mottos',
        type: 'features',
        sortOrder: 2,
        heading: 'JD GOLD – POWERED BY TRUST, DRIVEN BY EXCELLENCE.',
        subheading: 'A SYMBOL OF TRUST, QUALITY & EXCELLENCE.',
        features: [
          { title: 'PURITY', description: 'YOU CAN TRUST', icon: 'shield' },
          { title: 'VALUE', description: 'YOU DESERVE', icon: 'bars' },
          {
            title: 'PARTNERSHIP',
            description: 'YOU CAN RELY ON',
            icon: 'handshake',
          },
          { title: 'EXCELLENCE', description: 'WE DELIVER', icon: 'star' },
        ],
      },
    ],
  },
];

/**
 * Global top horizontal banner / gallery.
 * Mirrors the sticky hero media strip near the top of the live site
 * (see jdgold-fe/src/sections/Hero.tsx DEFAULT_HERO_SLIDES — image slides only).
 */
export const GLOBAL_BANNER_SEEDS = [
  {
    title: 'JD Gold Site Banner',
    imageAlt: 'JD Gold gallery banner',
    link: '',
    order: 0,
    active: true,
    images: [
      {
        url: '/images/hero-slide-gold-bar-hand.png',
        alt: 'JD Gold branded gold bar',
        order: 0,
      },
      {
        url: '/images/hero-slide-company-wealth.png',
        alt: 'JD Gold — company wealth',
        order: 1,
      },
      {
        url: '/images/hero-slide-pricing.png',
        alt: 'JD Gold pricing and market leadership',
        order: 2,
      },
      {
        url: '/images/about-refinery-portrait.png',
        alt: 'JD Gold refinery representative portrait',
        order: 3,
      },
      {
        url: '/images/hero-slide-whatsapp-01.png',
        alt: 'JD Gold one kilo fine gold bar',
        order: 4,
      },
      {
        url: '/images/hero-slide-whatsapp-02.png',
        alt: 'JD Gold meeting at waterfront location',
        order: 5,
      },
      {
        url: '/images/hero-slide-whatsapp-03.png',
        alt: 'JD Gold jewelry production trays',
        order: 6,
      },
      {
        url: '/images/hero-slide-whatsapp-04.png',
        alt: 'JD Gold bracelet inventory display',
        order: 7,
      },
      {
        url: '/images/hero-slide-whatsapp-05.png',
        alt: 'JD Gold pendant collection tray',
        order: 8,
      },
      {
        url: '/images/hero-slide-whatsapp-06.png',
        alt: 'JD Gold engraved pendant assortment',
        order: 9,
      },
      {
        url: '/images/hero-slide-whatsapp-07.png',
        alt: 'JD Gold chain bundles in production tray',
        order: 10,
      },
      {
        url: '/images/hero-slide-whatsapp-08.png',
        alt: 'JD Gold machining workshop floor',
        order: 11,
      },
      {
        url: '/images/hero-slide-whatsapp-09.png',
        alt: 'Gold granules and analyzer device',
        order: 12,
      },
      {
        url: '/images/product-cast-gold-bars.png',
        alt: 'JD Gold cast bars',
        order: 13,
      },
      {
        url: '/images/product-investment-grade-bar.png',
        alt: 'Investment grade gold bar',
        order: 14,
      },
    ],
  },
];

/** Slugs this seed owns (used by clear / upsert). */
export const SEEDED_PAGE_SLUGS = PAGE_SEEDS.map((p) => p.slug);

/** Banner titles this seed owns. */
export const SEEDED_BANNER_TITLES = GLOBAL_BANNER_SEEDS.map((b) => b.title);

/**
 * Accidental implementation slugs → canonical public API slugs.
 * Prefer: license-and-offices, factories-and-refinery.
 */
export const PAGE_SLUG_ALIASES = {
  'license-offices': 'license-and-offices',
  'market-advantages-achievements': 'factories-and-refinery',
};
