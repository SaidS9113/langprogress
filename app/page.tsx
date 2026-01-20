'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { motion, Variants } from 'framer-motion';
import { Volume2, Brain, Play, CheckCircle, Sparkles, ChevronDown, Clock, User, HelpCircle, Menu, X, ArrowUpRight, Video, BookOpen, Target, TrendingUp, Globe, Headphones, Code, Database, Layers, Linkedin, Github, Smartphone } from 'lucide-react';
import VisitorCounter from './components/VisitorCounter';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

function AnimatedText({ text, className }: { text: string; className?: string }) {
  const words = useMemo(() => text.split(' '), [text]);
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.5 }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-[0.25em]"
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.3, 
                delay: index * 0.03
              }
            }
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: string; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const hasDecimal = value.includes('.');
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCount(0);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.5 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!isInView) return;
    
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [isInView, numericValue]);
  
  const displayValue = hasDecimal ? count.toFixed(1) : Math.floor(count);
  const suffixFromValue = value.replace(/[0-9.]/g, '');
  
  return (
    <motion.p
      ref={ref}
      className="text-5xl font-bold text-gray-900 mb-2"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue}{suffixFromValue}{suffix}
    </motion.p>
  );
}

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div 
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white mb-4"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-lg">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ 
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-5">
          <p className="text-gray-500 leading-relaxed">{answer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: Code,
      title: 'Next.js 15 & React 19',
      description: 'Architecture moderne avec App Router, Server Components et optimisations automatiques.',
      bgColor: 'bg-sky-50',
      iconBg: 'bg-sky-500',
    },
    {
      icon: Database,
      title: 'Prisma & Base de données',
      description: 'ORM type-safe avec migrations automatiques et gestion optimisée des données.',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-500',
    },
    {
      icon: Video,
      title: 'Lecteur vidéo intégré',
      description: 'Streaming vidéo avec Cloudflare, suivi de progression et reprise automatique.',
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-500',
    },
    {
      icon: Brain,
      title: 'Quiz interactifs',
      description: 'Système de quiz avec validation en temps réel et suivi des scores.',
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500',
    },
    {
      icon: Layers,
      title: 'Architecture modulaire',
      description: 'Code structuré et réutilisable, facilement adaptable à différents contenus.',
      bgColor: 'bg-lime-50',
      iconBg: 'bg-lime-500',
    },
    {
      icon: Smartphone,
      title: 'Responsive',
      description: 'Interface adaptative mobile-first.',
      bgColor: 'bg-gray-100',
      iconBg: 'bg-gray-500',
    },
  ];

  const faqs = [
    {
      question: 'Qu\'est-ce que LangProgress ?',
      answer: 'LangProgress est une plateforme e-learning automatisée dédiée à l\'apprentissage des langues. Elle offre une expérience d\'apprentissage complète avec vidéos, quiz interactifs et suivi de progression.',
    },
    {
      question: 'Quel est le but de cette plateforme ?',
      answer: 'Cette plateforme a pour but de démontrer mes compétences d\'autodidacte et ma capacité à rechercher des informations, tout en mettant en avant mes compétences techniques et ma maîtrise des outils nécessaires pour livrer un projet en temps et en heure. Ce qui était simplement une expression de besoin est devenu un projet concret et réaliste.',
    },
    {
      question: 'Comment ça fonctionne ?',
      answer: 'Pour les développeurs : clonez le projet depuis mon repository GitHub et testez-le en local. Pour les autres : inscrivez-vous ou cliquez sur "Connexion rapide" pour tester directement.',
    },
    {
      question: 'Quelles langues peut-on apprendre ?',
      answer: 'LangProgress est entièrement modulable ! L\'architecture permet d\'enseigner n\'importe quelle langue en ajoutant simplement du contenu : vidéos, leçons, quiz.',
    },
    {
      question: 'Qui a développé cette plateforme ?',
      answer: 'Je suis Said Soidroudine, développeur fullstack passionné. N\'hésitez pas à me contacter sur LinkedIn pour échanger sur ce projet ou toute autre question.',
    },
    {
      question: 'Quelles technologies sont utilisées ?',
      answer: 'Next.js 15, React 19, TypeScript, Prisma, Tailwind CSS, Framer Motion, et Cloudflare pour le streaming vidéo. Une stack moderne et performante.',
    },
  ];

  const techStack = [
    {
      name: 'Frontend',
      description: 'Interface utilisateur moderne',
      icon: Layers,
      technologies: [
        'Next.js 15 (App Router)',
        'React 19',
        'TypeScript',
        'Tailwind CSS',
        'Framer Motion',
      ],
      highlighted: false,
    },
    {
      name: 'Backend',
      description: 'API robuste et sécurisée',
      icon: Database,
      technologies: [
        'API Routes Next.js',
        'Prisma ORM',
        'NextAuth.js',
        'Middleware sécurisé',
      ],
      highlighted: true,
    },
    {
      name: 'Fonctionnalités',
      description: 'Expérience utilisateur complète',
      icon: Target,
      technologies: [
        'Streaming vidéo Cloudflare',
        'Système de progression',
        'Quiz interactifs',
        'Dashboard admin',
        'Responsive design',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="hidden md:block fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Lang<span className="text-sky-500">Progress</span>
              </span>
            </Link>

            <nav className="flex items-center gap-8">
              <button onClick={() => scrollToSection('accueil')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer">
                Accueil
              </button>
              <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer">
                Fonctionnalités
              </button>
              <button onClick={() => scrollToSection('tech')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer">
                Tech Stack
              </button>
              <button onClick={() => scrollToSection('founder')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer">
                Fondateur
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <VisitorCounter />
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      <header className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="relative rounded-xl border transition-colors duration-300 bg-sky-500/60 backdrop-blur-xl border-white/10 px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-xl font-bold text-white">
              LangProgress
            </span>
          </Link>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="relative rounded-xl border transition-colors duration-300 bg-sky-500/60 backdrop-blur-xl border-white/10 mt-2 py-4 px-4">
            <div className="flex flex-col gap-2">
              <button onClick={() => scrollToSection('accueil')} className="text-left text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer">
                Accueil
              </button>
              <button onClick={() => scrollToSection('features')} className="text-left text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer">
                Fonctionnalités
              </button>
              <button onClick={() => scrollToSection('tech')} className="text-left text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer">
                Tech Stack
              </button>
              <button onClick={() => scrollToSection('founder')} className="text-left text-white/80 hover:text-white hover:bg-white/10 font-medium py-3 px-4 rounded-xl transition-colors cursor-pointer">
                Fondateur
              </button>
              <div className="flex flex-col gap-2 mt-2">
                <Link
                  href="/login"
                  className="bg-white/20 text-white hover:bg-white/30 px-6 py-3 rounded-xl font-semibold text-center transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-sky-500 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold text-center transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <div className="main-container">
          <section id="accueil" className="pt-32 md:pt-40 pb-20 bg-gradient-to-b from-sky-200/30 to-white">
            <div className="section-container">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="lg:w-1/2 text-center lg:text-left"
              >
                <motion.div 
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-2 mb-4"
                >
                  <Code className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-600">LangProgress - Démo E-Learning</span>
                </motion.div>

               

                <motion.h1 
                  variants={fadeInUp}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
                >
                  <AnimatedText text="Apprenez n'importe quelle" />
                  <motion.span 
                    className="text-sky-500 block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    langue facilement
                  </motion.span>
                </motion.h1>

                <motion.p 
                  variants={fadeInUp}
                  className="text-lg text-gray-500 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                  LangProgress est une plateforme e-learning automatisée d'apprentissage de langues. 
                  Testez la Démo de LangProgress !
                </motion.p>

                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <button
                      onClick={() => scrollToSection('faq')}
                      className="bg-[#0A66C2] hover:bg-[#004182] text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      En savoir plus
                    </button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/login"
                      className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Essayer la démo
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:w-1/2"
              >
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-sky-200 rounded-full blur-3xl opacity-60" />
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sky-300 rounded-full blur-3xl opacity-40" />
                  <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-sky-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Votre progression</h3>
                        <p className="text-gray-500">Chapitre 3 - Vocabulaire</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-500">Progression globale</span>
                        <span className="font-bold text-sky-500">68%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-sky-500 to-sky-400 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "68%" }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { icon: BookOpen, color: 'sky', label: 'Leçons' },
                        { icon: Brain, color: 'green', label: 'Quiz' },
                        { icon: Play, color: 'indigo', label: 'Vidéos' }
                      ].map((item, index) => (
                        <motion.div 
                          key={item.label}
                          className={`bg-${item.color}-50 rounded-xl p-4 text-center`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                          whileHover={{ scale: 1.03, y: -3 }}
                        >
                          <item.icon className={`w-6 h-6 text-${item.color}-500 mx-auto mb-2`} />
                          <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              </div>
            </div>
          </section>

          <section className="py-16 border-t border-gray-100">
            <div className="section-container">
              <motion.div 
                className="grid md:grid-cols-3 gap-8 md:gap-16 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={staggerContainer}
              >
              <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }}>
                <AnimatedCounter value="15" prefix="+" />
                <motion.p 
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  Composants React
                </motion.p>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }}>
                <AnimatedCounter value="100%" />
                <motion.p 
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  TypeScript
                </motion.p>
              </motion.div>
              <motion.div variants={scaleIn} whileHover={{ scale: 1.05 }}>
                <AnimatedCounter value="5" prefix="+" />
                <motion.p 
                  className="text-gray-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  Chapitres
                </motion.p>
                </motion.div>
              </motion.div>
            </div>
          </section>

          <section id="features" className="py-20 border-t border-gray-100">
            <div className="section-container">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                <div className="lg:sticky lg:top-32 lg:h-fit">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.3 }}
                    variants={fadeInLeft}
                  >
                    <motion.div 
                      className="flex items-center gap-3 mb-6"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 15 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sparkles className="w-5 h-5 text-white" />
                      </motion.div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                        <AnimatedText text="Fonctionnalités" />
                      </h2>
                    </motion.div>
                    <motion.p 
                      className="text-gray-500 text-lg leading-relaxed mb-8"
                      variants={fadeInUp}
                    >
                      Une architecture technique solide pour une plateforme e-learning complète et performante.
                    </motion.p>

                    <motion.div 
                      className="bg-sky-500 rounded-2xl p-6 text-white"
                      variants={scaleIn}
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="font-semibold text-lg mb-4">
                      Découvrez le stack technique complet.
                    </p>
                    <motion.div whileHover={{ scale: 1.02, x: 3 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="#tech"
                        onClick={(e) => { e.preventDefault(); scrollToSection('tech'); }}
                        className="inline-flex items-center gap-2 bg-white text-sky-500 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
                      >
                        Voir le Tech Stack
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </motion.div>
                  </motion.div>
                </div>

                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={staggerContainer}
                >
                  {features.map((feature) => (
                    <motion.div
                      key={feature.title}
                      variants={fadeInRight}
                      whileHover={{ scale: 1.01, x: 5 }}
                      className={`${feature.bgColor} rounded-2xl p-6 cursor-pointer`}
                    >
                      <div className={`w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          <section id="founder" className="py-20 border-t border-gray-100">
            <div className="section-container">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    <AnimatedText text="Fondateur & Développeur" />
                  </h2>
                </div>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  LangProgress est un bac à sable démonstratif pour vous permettre de vous visualiser à travers cette stack technique.
                </p>
              </motion.div>

              <motion.div 
                className="max-w-3xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={fadeInUp}
              >
                <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-12 shadow-lg">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <img 
                      src="/img/profil.jpeg" 
                      alt="Said Soidroudine" 
                      className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                    />
                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Said Soidroudine</h3>
                      <p className="text-sky-500 font-semibold mb-4">Développeur Fullstack</p>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Développeur autodidacte, passionné et animé par une grande détermination. 
                        Cette détermination me permet de passer d'une expression de besoin vers un projet fini et de livrer en temps et en heure.
                      </p>
                      <p className="text-gray-600 leading-relaxed mb-4">
                        Je sais collaborer efficacement et exécuter ce qui doit être fait pour livrer les résultats en temps et en heure.
                      </p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        <motion.a
                          href="https://www.linkedin.com/in/soidroudine-said/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#0077B5] hover:bg-[#006699] text-white px-5 py-2.5 rounded-full font-semibold transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Linkedin className="w-5 h-5" />
                          Me suivre sur LinkedIn
                        </motion.a>
                        <motion.a
                          href="https://github.com/SaidS9113"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-full font-semibold transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github className="w-5 h-5" />
                          GitHub
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section id="faq" className="py-20 border-t border-gray-100">
            <div className="section-container">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    <AnimatedText text="Questions fréquentes" />
                  </h2>
                </div>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  Tout ce que vous devez savoir sur LangProgress.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8 items-start">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={fadeInLeft}
                >
                  {faqs.map((faq, index) => (
                    <FAQItem
                      key={index}
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFAQ === index}
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    />
                  ))}
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                  variants={fadeInRight}
                  className="lg:sticky lg:top-32"
                >
                  <motion.div 
                    className="bg-sky-500 rounded-2xl p-8 text-white"
                    whileHover={{ scale: 1.01 }}
                  >
                    <p className="text-xl font-semibold mb-2">
                      Intéressé par ce projet ?
                    </p>
                    <p className="text-white/80 mb-4">
                      Explorez la démo ou contactez-moi pour discuter de votre projet.
                    </p>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-white text-sky-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Explorer la démo
                      </Link>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>

          <section id="tech" className="py-20 border-t border-gray-100">
            <div className="section-container">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    <AnimatedText text="Stack Technique" />
                  </h2>
                </div>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                  Les technologies modernes utilisées pour construire cette plateforme.
                </p>
              </motion.div>

              <motion.div 
                className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={staggerContainer}
              >
                {techStack.map((stack) => (
                  <motion.div
                    key={stack.name}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl p-8 flex flex-col ${
                      stack.highlighted
                        ? 'bg-sky-500 text-white ring-4 ring-sky-200'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                      stack.highlighted ? 'bg-white/20' : 'bg-sky-50'
                    }`}>
                      <stack.icon className={`w-7 h-7 ${stack.highlighted ? 'text-white' : 'text-sky-500'}`} />
                    </div>

                    <h3 className={`text-2xl font-bold mb-2 ${stack.highlighted ? 'text-white' : 'text-gray-900'}`}>
                      {stack.name}
                    </h3>
                    <p className={`text-base mb-6 ${stack.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
                      {stack.description}
                    </p>

                    <ul className="space-y-3 mt-auto">
                      {stack.technologies.map((tech, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false, amount: 0.3 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                        >
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${
                            stack.highlighted ? 'text-white' : 'text-sky-500'
                          }`} />
                          <span className={`${stack.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                            {tech}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </div>

        <motion.footer 
          className="bg-gradient-to-b from-sky-50 to-sky-100 mt-20 rounded-t-3xl relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.4 }}
        >
          <div className="section-container py-16 relative z-10">
            <motion.div 
              className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 text-center md:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex flex-col items-center md:items-start">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    Lang<span className="text-sky-500">Progress</span>
                  </span>
                </Link>
                <p className="text-gray-600 max-w-sm">
                  Plateforme e-learning modulable - Projet démo par Said Soidroudine.
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col items-center md:items-start">
                <h4 className="text-sky-500 font-bold uppercase tracking-wider text-sm mb-4">Navigation</h4>
                <ul className="space-y-3">
                  <li>
                    <button onClick={() => scrollToSection('accueil')} className="text-gray-600 hover:text-sky-500 font-medium transition-colors">
                      Accueil
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-sky-500 font-medium transition-colors">
                      Fonctionnalités
                    </button>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('tech')} className="text-gray-600 hover:text-sky-500 font-medium transition-colors">
                      Tech Stack
                    </button>
                  </li>
                </ul>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col items-center md:items-start">
                <h4 className="text-sky-500 font-bold uppercase tracking-wider text-sm mb-4">Contact</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="https://www.linkedin.com/in/soidroudine-said/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-sky-500 font-medium transition-colors flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/SaidS9113" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-sky-500 font-medium transition-colors flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  </li>
                  <li>
                    <button onClick={() => scrollToSection('founder')} className="text-gray-600 hover:text-sky-500 font-medium transition-colors">
                      À propos
                    </button>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-12 pt-8 border-t border-sky-200 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <p className="text-gray-500 text-sm">
                © 2026 LangProgress - Projet démo développé par Said Soidroudine. Technologies: Next.js, React, TypeScript, Prisma.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pointer-events-none select-none overflow-hidden w-full">
            <motion.div 
              className="flex items-center gap-2 md:gap-4 text-sky-200/40 mb-[-20px] max-w-full overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 md:w-20 h-12 md:h-20 bg-sky-200/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-8 md:w-12 h-8 md:h-12" />
              </div>
              <span className="text-[60px] sm:text-[80px] md:text-[120px] lg:text-[180px] font-bold leading-none truncate">LangProgress</span>
            </motion.div>
          </div>
        </motion.footer>
      </main>

      {/* Schema FAQPage pour SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Qu'est-ce que LangProgress ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "LangProgress est une plateforme e-learning automatisée dédiée à l'apprentissage des langues. Elle offre une expérience d'apprentissage complète avec vidéos, quiz interactifs et suivi de progression."
                }
              },
              {
                "@type": "Question",
                "name": "Quel est le but de cette plateforme ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Cette plateforme a pour but de démontrer mes compétences d'autodidacte et ma capacité à rechercher des informations, tout en mettant en avant mes compétences techniques et ma maîtrise des outils nécessaires pour livrer un projet en temps et en heure. Ce qui était simplement une expression de besoin est devenu un projet concret et réaliste."
                }
              },
              {
                "@type": "Question",
                "name": "Comment ça fonctionne ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Pour les développeurs : clonez le projet depuis mon repository GitHub et testez-le en local. Pour les autres : inscrivez-vous ou cliquez sur Connexion rapide pour tester directement."
                }
              },
              {
                "@type": "Question",
                "name": "Quelles langues peut-on apprendre ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "LangProgress est entièrement modulable ! L'architecture permet d'enseigner n'importe quelle langue en ajoutant simplement du contenu : vidéos, leçons, quiz."
                }
              },
              {
                "@type": "Question",
                "name": "Qui a développé cette plateforme ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Said Soidroudine, développeur fullstack passionné. Contactez-le sur LinkedIn pour échanger sur ce projet ou toute autre question."
                }
              },
              {
                "@type": "Question",
                "name": "Quelles technologies sont utilisées ?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Next.js 15, React 19, TypeScript, Prisma, Tailwind CSS, Framer Motion, et Cloudflare pour le streaming vidéo. Une stack moderne et performante."
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}
