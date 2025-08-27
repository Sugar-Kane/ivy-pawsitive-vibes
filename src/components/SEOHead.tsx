import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  keywords?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  ogImage = "/lovable-uploads/d9959ce2-f4f0-4aa0-a500-5514aacbc97c.png", 
  canonical,
  keywords 
}: SEOHeadProps) => {
  const fullTitle = title.includes("Ivy Therapy") ? title : `${title} | Ivy Therapy`;
  const currentUrl = canonical || window.location.href;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Ivy Therapy" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content="Ivy Therapy" />
    </Helmet>
  );
};