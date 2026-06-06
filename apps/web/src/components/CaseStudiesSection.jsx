import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Award, Server, Target, Shield, Database, BarChart3, Globe, Workflow } from 'lucide-react';

// ── 4-pointed sparkle star ──────────────────────────────────────────────────
const StarSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0 L9.3 6.7 L16 8 L9.3 9.3 L8 16 L6.7 9.3 L0 8 L6.7 6.7 Z" />
  </svg>
);

const SPARKLE_DEFS = [
  { top: '7%',  left: '10%',  size: 8,  delay: 0.00, rep: 0.40 },
  { top: '10%', right: '8%',  size: 11, delay: 0.22, rep: 0.30 },
  { top: '80%', left: '7%',   size: 7,  delay: 0.09, rep: 0.50 },
  { top: '85%', right: '9%',  size: 9,  delay: 0.30, rep: 0.35 },
  { top: '44%', left: '2%',   size: 12, delay: 0.15, rep: 0.45 },
  { top: '48%', right: '2%',  size: 8,  delay: 0.38, rep: 0.28 },
  { top: '3%',  left: '50%',  size: 7,  delay: 0.05, rep: 0.55 },
  { top: '94%', left: '35%',  size: 10, delay: 0.24, rep: 0.42 },
];

const SeoAwardCard = ({ t }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="case-card-award h-full p-8 rounded-[20px] flex flex-col relative overflow-hidden cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Sparkles */}
      {SPARKLE_DEFS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ top: s.top, left: s.left, right: s.right, width: s.size, height: s.size, color: 'hsl(50,72%,62%)' }}
          animate={hovered
            ? { opacity: [0, 1, 0.75, 0], scale: [0, 1, 0.8, 0], rotate: [0, 90, 200] }
            : { opacity: 0, scale: 0 }
          }
          transition={hovered
            ? { duration: 1.15, delay: s.delay, repeat: Infinity, repeatDelay: s.rep, ease: 'easeInOut' }
            : { duration: 0.25 }
          }
        >
          <StarSVG size={s.size} />
        </motion.div>
      ))}

      {/* Icon + title row */}
      <div className="flex items-start gap-4 mb-6">
        <div className="p-4 rounded-[14px] case-card-award-icon transition-transform duration-500 ease-out" style={{ transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
          <Award className="h-6 w-6 case-card-award-icon-color" />
        </div>
        <div className="flex-1 pt-1">
          <h3 className="text-xl font-bold leading-snug tracking-tight mb-2 case-card-award-title">
            {t.caseStudies.seoAward.title}
          </h3>
          <div className="inline-flex items-center px-3 py-1 rounded-full case-card-award-badge font-bold text-sm tracking-wide">
            <AnimatedMetric value={t.caseStudies.seoAward.metric} />
          </div>
        </div>
      </div>
      <p className="leading-relaxed font-medium mt-auto case-card-award-desc">
        {t.caseStudies.seoAward.description}
      </p>
    </div>
  );
};

const AnimatedMetric = ({ value }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");
  
  useEffect(() => {
    if (!isInView) return;
    
    // Parse value. E.g., "161%" -> 161, "%". "Winner" -> just display.
    const numMatch = value.match(/(\d+)(.*)/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetStr = numMatch[1];
    const suffix = numMatch[2];
    const target = parseInt(targetStr, 10);
    
    let start = 0;
    const duration = 1500;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;
    
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeProgress * target);
      
      setDisplayValue(`${current}${suffix}`);
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayValue(value); // Ensure exact final string
      }
    }, frameRate);
    
    return () => clearInterval(counter);
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}</span>;
};

const CaseStudiesSection = () => {
  const { t } = useLanguage();

  const caseStudies = [
    { key: 'organicGrowth', icon: TrendingUp },
    { key: 'adRevenue', icon: BarChart3 },
    { key: 'seoAward', icon: Award },
    { key: 'serverSideTracking', icon: Server },
    { key: 'croExperimentation', icon: Target },
    { key: 'consentOptimisation', icon: Shield },
    { key: 'dataPipelines', icon: Database },
    { key: 'dashboarding', icon: BarChart3 },
    { key: 'campaignOptimisation', icon: Globe },
    { key: 'crmAutomation', icon: Workflow }
  ];

  return (
    <section id="cases" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-3xl mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance tracking-tight">
            {t.caseStudies.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            {t.caseStudies.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caseStudies.map((study, index) => {
            const Icon = study.icon;
            return (
              <motion.div
                key={study.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
              >
                {study.key === 'seoAward' ? (
                  <SeoAwardCard t={t} />
                ) : (
                  <div className="glass-panel-interactive h-full p-8 rounded-[20px] flex flex-col group">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="p-4 rounded-[14px] glass-panel bg-primary/5 text-primary group-hover:scale-110 transition-transform duration-500 ease-out">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl font-bold leading-snug text-foreground tracking-tight mb-2">
                          {t.caseStudies[study.key].title}
                        </h3>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide">
                          <AnimatedMetric value={t.caseStudies[study.key].metric} />
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed font-medium mt-auto">
                      {t.caseStudies[study.key].description}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;