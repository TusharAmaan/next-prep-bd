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

/**
 * Generate Course JSON-LD Schema
 */
export function getCourseSchema(course: {
  name: string;
  description: string;
  providerName?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": course.providerName || siteConfig.name,
      "sameAs": siteConfig.url
    }
  };
}

/**
 * Generate Book JSON-LD Schema
 */
export function getBookSchema(book: {
  name: string;
  description: string;
  authorName?: string;
  url: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.name,
    "description": book.description,
    "author": {
      "@type": "Person",
      "name": book.authorName || siteConfig.name
    },
    "url": book.url,
    "image": book.image || siteConfig.ogImage
  };
}

/**
 * Generate DiscussionForumPosting JSON-LD Schema
 */
export function getDiscussionForumPostingSchema(post: {
  title: string;
  text: string;
  authorName: string;
  datePublished: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": post.title,
    "text": post.text,
    "author": {
      "@type": "Person",
      "name": post.authorName
    },
    "datePublished": post.datePublished,
    "url": post.url
  };
}

/**
 * Generate QAPage JSON-LD Schema
 */
export function getQAPageSchema(qa: {
  title: string;
  text: string;
  authorName: string;
  datePublished: string;
  url: string;
  acceptedAnswerText?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": qa.title,
      "text": qa.text,
      "dateCreated": qa.datePublished,
      "author": {
        "@type": "Person",
        "name": qa.authorName
      }
    }
  };
  
  if (qa.acceptedAnswerText) {
    schema.mainEntity.acceptedAnswer = {
      "@type": "Answer",
      "text": qa.acceptedAnswerText,
      "dateCreated": qa.datePublished,
      "author": {
        "@type": "Organization",
        "name": siteConfig.name
      }
    };
  }
  
  return schema;
}

/**
 * Generate LearningResource JSON-LD Schema (for Curriculum Lessons)
 * Conforms to Google Educational Material / LearningResource structured data
 */
export function getLearningResourceSchema(resource: {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  educationalLevel?: string;
  courseName?: string;
  unitName?: string;
  lessonName?: string;
  inLanguage?: string;
}) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": ["Article", "LearningResource"],
    "headline": resource.name,
    "name": resource.name,
    "description": resource.description,
    "learningResourceType": "LessonPlan",
    "educationalLevel": resource.educationalLevel || "National Curriculum and Textbook Board (NCTB)",
    "inLanguage": resource.inLanguage || "bn-BD",
    "isAccessibleForFree": true,
    "url": resource.url,
    "datePublished": resource.datePublished,
    "dateModified": resource.dateModified || resource.datePublished,
    "teaches": resource.name,
    "author": {
      "@type": "Person",
      "name": resource.authorName || "NextPrepBD Academic Faculty"
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "url": siteConfig.url,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/icon.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": resource.url
    }
  };

  if (resource.courseName) {
    schema.isPartOf = {
      "@type": "Course",
      "name": resource.courseName,
      "provider": {
        "@type": "Organization",
        "name": siteConfig.name,
        "sameAs": siteConfig.url
      }
    };
  }

  return schema;
}

/**
 * Generate Course JSON-LD Schema with Units/Syllabus
 */
export function getCurriculumCourseSchema(course: {
  name: string;
  description: string;
  url: string;
  educationalLevel?: string;
  providerName?: string;
  syllabusUnits?: { name: string; description?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "url": course.url,
    "educationalCredentialAwarded": course.educationalLevel || "National Curriculum (NCTB)",
    "inLanguage": "bn-BD",
    "isAccessibleForFree": true,
    "provider": {
      "@type": "Organization",
      "name": course.providerName || siteConfig.name,
      "sameAs": siteConfig.url
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "inLanguage": "bn-BD"
    },
    ...(course.syllabusUnits && course.syllabusUnits.length > 0 ? {
      "syllabusSections": course.syllabusUnits.map((unit, idx) => ({
        "@type": "Syllabus",
        "position": idx + 1,
        "name": unit.name,
        "description": unit.description || `${unit.name} syllabus unit`
      }))
    } : {})
  };
}

/**
 * Generate EducationalOccupationalProgram schema (for Segments & Groups)
 */
export function getEducationalProgramSchema(program: {
  name: string;
  description: string;
  url: string;
  courses?: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    "name": program.name,
    "description": program.description,
    "url": program.url,
    "provider": {
      "@type": "EducationalOrganization",
      "name": siteConfig.name,
      "url": siteConfig.url
    },
    "hasCourse": (program.courses || []).map(course => ({
      "@type": "Course",
      "name": course.name,
      "url": course.url,
      "provider": {
        "@type": "Organization",
        "name": siteConfig.name
      }
    }))
  };
}

