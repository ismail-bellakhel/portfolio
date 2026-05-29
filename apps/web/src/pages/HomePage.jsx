import React from 'react';
import { Helmet } from 'react-helmet';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import SectorExperienceSection from '@/components/SectorExperienceSection.jsx';
import TargetRolesSection from '@/components/TargetRolesSection.jsx';
import CaseStudiesSection from '@/components/CaseStudiesSection.jsx';
import TechnicalStackSection from '@/components/TechnicalStackSection.jsx';
import ExperimentsSection from '@/components/ExperimentsSection.jsx';
import WritingSection from '@/components/WritingSection.jsx';
import ContactSection from '@/components/ContactSection.jsx';

const HomePage = () => {
  const { t, language } = useLanguage();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ismail Bellakhel",
    "jobTitle": "Technical Growth & Analytics Professional",
    "email": "ismail.bellakhel@gmail.com",
    "url": `https://ismailbellakhel.com/${language}`,
    "sameAs": [
      "https://www.linkedin.com/in/ismailbellakhel/",
      "https://github.com/ismail-bellakhel"
    ],
    "knowsAbout": [
      "Growth Marketing",
      "Marketing Analytics",
      "Technical SEO",
      "Conversion Rate Optimization",
      "Customer Experience",
      "Data Analytics",
      "Marketing Technology",
      "Automation"
    ],
    "award": "Svenska SEO-priset"
  };

  const hreflangs = [
    { lang: 'en', url: 'https://ismailbellakhel.com/en' },
    { lang: 'sv', url: 'https://ismailbellakhel.com/sv' },
    { lang: 'no', url: 'https://ismailbellakhel.com/no' },
    { lang: 'fr', url: 'https://ismailbellakhel.com/fr' },
    { lang: 'x-default', url: 'https://ismailbellakhel.com/en' }
  ];

  return (
    <>
      <Helmet>
        <html lang={language} />
        <title>{t.metadata.title}</title>
        <meta name="description" content={t.metadata.description} />
        <meta name="keywords" content={t.metadata.keywords} />
        
        <meta property="og:title" content={t.metadata.title} />
        <meta property="og:description" content={t.metadata.description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://ismailbellakhel.com/${language}`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.metadata.title} />
        <meta name="twitter:description" content={t.metadata.description} />
        
        {hreflangs.map((hreflang) => (
          <link
            key={hreflang.lang}
            rel="alternate"
            hrefLang={hreflang.lang}
            href={hreflang.url}
          />
        ))}
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <SectorExperienceSection />
          <TargetRolesSection />
          <CaseStudiesSection />
          <TechnicalStackSection />
          <ExperimentsSection />
          <WritingSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;