// lib/seo-utils.ts

export const siteConfig = {
  name: "NextPrepBD",
  url: "https://nextprepbd.com",
  ogImage: "https://nextprepbd.com/og-image.png",
  description: "Bangladesh's Largest Education Portal for SSC, HSC, and University Admission notes, question banks, and suggestions.",
  links: {
    facebook: "https://www.facebook.com/profile.php?id=61584943876571",
    youtube: "https://www.youtube.com/@nextprepbd",
    whatsapp: "https://wa.me/8801619663933",
  },
  contact: {
    email: "nextprepbd@gmail.com",
    phone: "+880 1619663933"
  }
};

/**
 * Generate Organization JSON-LD Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "logo": `${siteConfig.url}/icon.png`,
    "sameAs": [
      siteConfig.links.facebook,
      siteConfig.links.youtube
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": siteConfig.contact.phone,
        "contactType": "customer service",
        "email": siteConfig.contact.email,
        "availableLanguage": ["Bengali", "English"]
      }
    ]
  };
}

/**
 * Generate BreadcrumbList JSON-LD Schema
 */
export function getBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteConfig.url}${item.item.startsWith('/') ? item.item : '/' + item.item}`
    }))
  };
}

/**
 * Generate Article JSON-LD Schema
 */
export function getArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image || siteConfig.ogImage,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "author": {
      "@type": "Person",
      "name": article.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
}

/**
 * Generate Product JSON-LD Schema (for Ebooks/Courses)
 */
export function getProductSchema(product: {
  name: string;
  description: string;
  image?: string;
  sku?: string;
  brandName?: string;
  category?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || siteConfig.ogImage,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brandName || siteConfig.name
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": product.url,
      "price": "0",
      "priceCurrency": "BDT",
      "availability": "https://schema.org/InStock"
    }
  };
}
