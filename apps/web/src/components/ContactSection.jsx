import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github } from 'lucide-react';

const ContactSection = () => {
  const { t } = useLanguage();

  const contactMethods = [
    {
      icon: Mail,
      label: t.contact.email,
      value: 'ismail.bellakhel@gmail.com',
      href: 'mailto:ismail.bellakhel@gmail.com',
      color: 'text-white'
    },
    {
      icon: Linkedin,
      label: t.contact.linkedin,
      value: 'linkedin.com/in/ismailbellakhel',
      href: 'https://www.linkedin.com/in/ismailbellakhel/',
      color: 'text-white'
    },
    {
      icon: Github,
      label: t.contact.github,
      value: 'github.com/ismail-bellakhel',
      href: 'https://github.com/ismail-bellakhel',
      color: 'text-gray-800 dark:text-gray-200'
    }
  ];

  return (
    <section id="contact" className="py-20 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance" style={{ letterSpacing: '-0.02em' }}>
            {t.contact.title}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t.contact.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-panel-interactive h-full p-6 rounded-[20px] text-center flex flex-col items-center"
              >
                <div className={`glass-pill inline-flex items-center justify-center p-3 rounded-xl mb-4 ${method.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{method.label}</h3>
                <p className="text-sm text-muted-foreground break-words">{method.value}</p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
