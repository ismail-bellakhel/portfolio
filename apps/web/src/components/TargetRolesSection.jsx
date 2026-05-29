import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const TargetRolesSection = () => {
  const { t } = useLanguage();
  const [activeArea, setActiveArea] = useState('all');
  const svgRef = useRef(null);

  // Mouse move handler for mathematical Venn hover detection
  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Circle centers and radius (in percentage of SVG viewBox 0 0 100 100)
    // Marketing: Top Left
    const cM = { x: 35, y: 40, r: 30 };
    // Analytics: Top Right
    const cA = { x: 65, y: 40, r: 30 };
    // Customer: Bottom Center
    const cC = { x: 50, y: 65, r: 30 };

    const inCircle = (c) => Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2) <= Math.pow(c.r, 2);

    const inM = inCircle(cM);
    const inA = inCircle(cA);
    const inC = inCircle(cC);

    let area = 'all';
    if (inM && inA && inC) area = 'all';
    else if (inM && inA) area = 'marketingAnalytics';
    else if (inM && inC) area = 'marketingCustomer';
    else if (inA && inC) area = 'analyticsCustomer';
    else if (inM) area = 'marketing';
    else if (inA) area = 'analytics';
    else if (inC) area = 'customer';
    else area = 'all'; // Default to all if outside

    if (area !== activeArea) {
      setActiveArea(area);
    }
  };

  const handleMouseLeave = () => {
    setActiveArea('all');
  };

  const activeRoles = t.roles.positions[activeArea] || t.roles.positions.all;
  const activeCategoryName = t.roles.categories[activeArea];

  // Helper to check if a circle should be highlighted
  const isHighlighted = (circleName) => {
    if (activeArea === 'all') return true;
    if (activeArea === circleName) return true;
    if (activeArea.toLowerCase().includes(circleName.toLowerCase())) return true;
    return false;
  };

  return (
    <section id="roles" className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance tracking-tight">
            {t.roles.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl">
            {t.roles.subtitle}. {t.roles.diagramInstruction}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Interactive Venn Diagram */}
          <div className="lg:col-span-7 flex justify-center order-2 lg:order-1">
            <div 
              className="relative w-full max-w-[500px] aspect-square"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <svg 
                ref={svgRef}
                viewBox="0 0 100 100" 
                className="w-full h-full drop-shadow-2xl"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.1))" }}
              >
                {/* Marketing Circle */}
                <motion.circle 
                  cx="35" cy="40" r="30" 
                  fill="var(--glass-bg)"
                  stroke="var(--glass-border)"
                  strokeWidth="0.5"
                  className="transition-all duration-500 origin-[35%_40%]"
                  animate={{ 
                    fill: isHighlighted('marketing') ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.1)',
                    scale: isHighlighted('marketing') ? 1.02 : 1
                  }}
                />
                
                {/* Analytics Circle */}
                <motion.circle 
                  cx="65" cy="40" r="30" 
                  fill="var(--glass-bg)"
                  stroke="var(--glass-border)"
                  strokeWidth="0.5"
                  className="transition-all duration-500 origin-[65%_40%]"
                  animate={{ 
                    fill: isHighlighted('analytics') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.1)',
                    scale: isHighlighted('analytics') ? 1.02 : 1
                  }}
                />
                
                {/* Customer Circle */}
                <motion.circle 
                  cx="50" cy="65" r="30" 
                  fill="var(--glass-bg)"
                  stroke="var(--glass-border)"
                  strokeWidth="0.5"
                  className="transition-all duration-500 origin-[50%_65%]"
                  animate={{ 
                    fill: isHighlighted('customer') ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.1)',
                    scale: isHighlighted('customer') ? 1.02 : 1
                  }}
                />

                {/* Labels */}
                <text x="25" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.marketing}</text>
                <text x="75" y="35" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.analytics}</text>
                <text x="50" y="80" textAnchor="middle" className="text-[4px] font-bold fill-foreground mix-blend-overlay pointer-events-none select-none">{t.roles.categories.customer}</text>
              </svg>
            </div>
          </div>

          {/* Roles Display */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="glass-panel p-8 rounded-[24px] min-h-[350px] flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {activeCategoryName}
              </h3>
              
              <div className="space-y-4 flex-1">
                <AnimatePresence mode="popLayout">
                  {activeRoles.map((role, idx) => (
                    <motion.div
                      key={`${activeArea}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                      transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.4, 0, 0.2, 1] }}
                      className="p-5 rounded-[16px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <h4 className="text-lg font-bold text-foreground mb-2">{role.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed font-medium">{role.description}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TargetRolesSection;