'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a3a5c] overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-14 py-7 transition-all duration-400 ${
        scrolled 
          ? 'bg-[#f5f0ea]/92 backdrop-blur-md border-b border-[#4a6fa5]/12' 
          : 'bg-transparent'
      }`}>
        <ul className="flex gap-9 list-none">
          <li>
            <a href="#" className="text-xs font-medium tracking-[0.18em] uppercase text-[#1a3a5c] opacity-70 hover:opacity-100 transition-opacity duration-200 no-underline">
              Prestataires
            </a>
          </li>
          <li>
            <a href="#" className="text-xs font-medium tracking-[0.18em] uppercase text-[#1a3a5c] opacity-70 hover:opacity-100 transition-opacity duration-200 no-underline">
              À Propos
            </a>
          </li>
        </ul>
        
        <div className="text-center">
          <div className="font-serif text-[22px] font-medium tracking-[0.10em] text-[#1a3a5c]">
            <span className="font-cursive text-[28px] tracking-[0.02em] text-[#4a6fa5] mr-0.5">E</span>
            ventIO
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link
            href="/login"
            className="text-xs tracking-[0.12em] uppercase text-[#1a3a5c] opacity-70 hover:opacity-100 no-underline font-medium transition-opacity duration-200"
          >
            Se Connecter
          </Link>
          <Link
            href="/choose-role"
            className="text-xs font-medium tracking-[0.14em] uppercase px-7 py-2.5 rounded-full bg-[#1a3a5c] text-white border-none cursor-pointer transition-all duration-200 hover:bg-[#4a6fa5] hover:scale-[1.03]"
          >
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-[#faf8f5] flex flex-col overflow-hidden">
        {/* Blue panel on left */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-[38%] bg-[#1a3a5c]"
          style={{
            clipPath: 'polygon(0 0, 85% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(160deg, #1a3a5c 0%, #2d5a8e 60%, #4a6fa5 100%)'
          }}
        >
          {/* Decorative circles */}
          <div className="absolute w-80 h-80 -top-15 -left-25 rounded-full border border-white/8"></div>
          <div className="absolute w-50 h-50 bottom-25 left-10 rounded-full border border-white/8"></div>
        </div>

        {/* Left copy on blue panel */}
        <div className="absolute top-1/2 left-14 transform -translate-y-1/2 max-w-[280px] text-white/90 z-10">
          <p className="text-sm leading-relaxed tracking-[0.01em] font-light mb-5">
            De la première esquisse<br />
            à la célébration finale,<br />
            nous orchestrons chaque détail<br />
            avec intention.
          </p>
          <div className="w-8 h-px bg-[#a8c0d8] mb-5"></div>
          <div className="flex gap-7">
            <div>
              <div className="font-serif text-[32px] font-light text-white leading-none">50K+</div>
              <div className="text-[9px] tracking-[0.14em] uppercase text-[#a8c0d8] mt-1">Événements</div>
            </div>
            <div>
              <div className="font-serif text-[32px] font-light text-white leading-none">2K+</div>
              <div className="text-[9px] tracking-[0.14em] uppercase text-[#a8c0d8] mt-1">Prestataires</div>
            </div>
          </div>
        </div>

        {/* Script tagline */}
        <div className="font-cursive text-[42px] text-[#4a6fa5] absolute bottom-[180px] left-1/2 transform -translate-x-[45%] whitespace-nowrap pointer-events-none">
          votre moment parfait
        </div>

        {/* Right copy */}
        <div className="absolute top-1/2 right-14 transform -translate-y-1/2 max-w-[220px] text-right z-10">
          <p className="text-sm leading-relaxed text-[#1a3a5c] opacity-80 mb-[18px]">
            Créez des moments qui restent gravés bien après le dernier verre.
          </p>
          <Link
            href="/choose-role"
            className="inline-block px-7 py-3 rounded-full bg-[#1a3a5c] text-white text-[10px] font-medium tracking-[0.18em] uppercase border-none cursor-pointer transition-all duration-200 hover:bg-[#4a6fa5] hover:scale-[1.04] no-underline"
          >
            Commencer →
          </Link>
        </div>

        {/* Large display text */}
        <div className="absolute bottom-0 left-0 right-0 px-14 pb-9 flex items-end justify-between">
          <div className="flex items-end gap-0">
            <div className="font-serif font-light leading-[0.88] text-[#1a3a5c] tracking-[-0.01em] select-none text-[clamp(72px,10vw,140px)]">
              Event
            </div>
            <div className="font-serif font-light leading-[0.88] text-[#4a6fa5] tracking-[-0.01em] select-none text-[clamp(72px,10vw,140px)]">
              <em className="font-cursive not-italic text-[#4a6fa5]">IO</em>
            </div>
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-[#6b8db8] flex items-center gap-2">
            <div className="w-7 h-px bg-[#6b8db8]"></div>
            Scroll to see more ↓
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 px-14 bg-[#faf8f5] relative">
        <div className="text-[10px] tracking-[0.22em] uppercase text-[#4a6fa5] mb-4 font-medium">
          Nos Services
        </div>
        <h2 className="font-serif text-[52px] font-light text-[#1a3a5c] leading-[1.1] mb-16 max-w-[480px]">
          Tout ce dont vous avez besoin pour un <em className="italic text-[#4a6fa5]">événement parfait</em>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              name: "Photographie & Vidéo",
              desc: "Des artistes qui capturent vos émotions avec sensibilité — de l'arrivée des premiers invités au dernier instant de la soirée."
            },
            {
              num: "02", 
              name: "Traiteur & Art de la Table",
              desc: "Des chefs talentueux qui transforment chaque repas en une expérience culinaire mémorable, adaptée à votre vision et votre budget."
            },
            {
              num: "03",
              name: "Musique & Animation", 
              desc: "DJs, orchestres, animateurs — des artistes qui donnent le ton et maintiennent l'énergie tout au long de votre célébration."
            },
            {
              num: "04",
              name: "Fleuriste & Décoration",
              desc: "Des créateurs qui habillent votre espace avec des compositions florales sur mesure et une décoration qui vous ressemble."
            },
            {
              num: "05",
              name: "Lieu & Réception",
              desc: "Châteaux, salles de prestige, jardins secrets — trouvez l'écrin parfait pour votre événement, quelle que soit sa taille."
            },
            {
              num: "06",
              name: "Coordination",
              desc: "Des wedding planners et coordinateurs expérimentés pour orchestrer chaque détail et vous permettre de vivre pleinement votre jour."
            }
          ].map((service, index) => (
            <div key={index} className="py-9 px-7 border-t border-[#dce8f2] transition-colors duration-300 cursor-default hover:border-[#4a6fa5]">
              <div className="font-serif text-[48px] font-light text-[#dce8f2] leading-none mb-5 transition-colors duration-300 hover:text-[#a8c0d8]">
                {service.num}
              </div>
              <div className="font-serif text-[24px] font-medium text-[#1a3a5c] mb-3 tracking-[0.01em]">
                {service.name}
              </div>
              <div className="text-sm leading-relaxed text-[#1a3a5c] opacity-60 font-light">
                {service.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-25 px-14 bg-[#1a3a5c] relative overflow-hidden">
        <div className="text-[10px] tracking-[0.22em] uppercase text-[#a8c0d8] mb-4 font-medium">
          Comment ça fonctionne
        </div>
        <h2 className="font-serif text-[52px] font-light text-white mb-14">
          Simple, rapide,<br />
          <em className="italic text-[#a8c0d8]">élégant.</em>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          <div className="absolute top-7 left-[calc(16.6%+28px)] right-[calc(16.6%+28px)] h-px bg-white/12"></div>
          
          {[
            {
              num: "1",
              title: "Choisissez votre rôle",
              desc: "Vous organisez un événement ou vous êtes prestataire ? EventIO s'adapte à vos besoins en quelques secondes."
            },
            {
              num: "2",
              title: "Explorez & Connectez", 
              desc: "Parcourez les profils vérifiés, comparez les offres, et entrez en contact directement avec les prestataires qui vous correspondent."
            },
            {
              num: "3",
              title: "Célébrez sereinement",
              desc: "Gérez votre équipe, votre budget et vos sélections depuis un seul tableau de bord. Votre événement entre de bonnes mains."
            }
          ].map((step, index) => (
            <div key={index} className="pr-8">
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center mb-6 font-serif text-[20px] font-light text-white relative z-10 bg-[#1a3a5c] transition-all duration-300 hover:border-[#4a6fa5] hover:bg-[#4a6fa5]">
                {step.num}
              </div>
              <div className="font-serif text-[22px] font-medium text-white mb-3">
                {step.title}
              </div>
              <div className="text-sm leading-relaxed text-white/55 font-light">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-[#f5f0ea]" id="roles-section">
        {/* Client Panel */}
        <div className="py-16 px-14 bg-white flex flex-col relative overflow-hidden cursor-pointer transition-colors duration-300 hover:bg-[#dce8f2]">
          <div className="w-13 h-13 rounded-xl bg-[#dce8f2] flex items-center justify-center mb-7">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#4a6fa5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase mb-3 font-medium text-[#4a6fa5]">
            Pour les clients
          </div>
          <h3 className="font-serif text-[36px] font-light leading-[1.2] mb-4 text-[#1a3a5c]">
            Je cherche des prestataires pour mon événement
          </h3>
          <p className="text-sm leading-relaxed font-light mb-8 max-w-[320px] text-[#1a3a5c]/65">
            Mariages, anniversaires, événements corporate — trouvez les meilleurs talents et gérez votre projet de A à Z.
          </p>
          <ul className="list-none flex flex-col gap-2.5 mb-9">
            {[
              "Recherche filtrée par type, ville, budget",
              "Comparaison de prestataires côte à côte", 
              "Gestion d'équipe & collections",
              "Suivi du budget en temps réel"
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2.5 text-sm font-light text-[#1a3a5c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a6fa5] flex-shrink-0"></span>
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/choose-role"
            className="self-start py-3 px-8 rounded-full text-[10px] tracking-[0.16em] uppercase font-medium border-none cursor-pointer transition-all duration-200 bg-[#1a3a5c] text-white hover:bg-[#4a6fa5] no-underline"
          >
            Je suis un Client →
          </Link>
        </div>

        {/* Provider Panel */}
        <div className="py-16 px-14 bg-[#1a3a5c] flex flex-col relative overflow-hidden cursor-pointer transition-colors duration-300 hover:bg-[#1f4570]">
          <div className="w-13 h-13 rounded-xl bg-white/10 flex items-center justify-center mb-7">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase mb-3 font-medium text-[#a8c0d8]">
            Pour les prestataires
          </div>
          <h3 className="font-serif text-[36px] font-light leading-[1.2] mb-4 text-white">
            Je propose mes services pour des événements
          </h3>
          <p className="text-sm leading-relaxed font-light mb-8 max-w-[320px] text-white/55">
            Développez votre activité, gérez vos demandes et construisez une réputation solide sur la première plateforme événementielle française.
          </p>
          <ul className="list-none flex flex-col gap-2.5 mb-9">
            {[
              "Profil professionnel mis en valeur",
              "Gestion des demandes entrantes",
              "Statistiques de performance", 
              "Visibilité auprès de milliers de clients"
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2.5 text-sm font-light text-white/75">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a8c0d8] flex-shrink-0"></span>
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/choose-role"
            className="self-start py-3 px-8 rounded-full text-[10px] tracking-[0.16em] uppercase font-medium border-none cursor-pointer transition-all duration-200 bg-white text-[#1a3a5c] hover:bg-[#dce8f2] no-underline"
          >
            Je suis un Prestataire →
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-14 bg-[#dce8f2] grid grid-cols-2 md:grid-cols-4 gap-0">
        {[
          { number: "50K+", name: "Événements Créés" },
          { number: "2K+", name: "Prestataires Vérifiés" },
          { number: "99.9%", name: "Satisfaction Client" },
          { number: "12", name: "Villes Couvertes" }
        ].map((stat, index) => (
          <div key={index} className="py-7 px-8 border-r border-[#4a6fa5]/15 text-center last:border-r-0">
            <div className="font-serif text-[52px] font-light text-[#1a3a5c] leading-none mb-2">
              {stat.number}
            </div>
            <div className="text-[10px] tracking-[0.16em] uppercase text-[#4a6fa5] font-medium">
              {stat.name}
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="bg-[#1a3a5c] py-14 px-14 flex items-center justify-between">
        <div className="font-cursive text-[36px] text-white">
          EventIO
        </div>
        <ul className="flex gap-7 list-none">
          {["Prestataires", "À Propos", "Contact", "Confidentialité"].map((link, index) => (
            <li key={index}>
              <a href="#" className="text-[10px] tracking-[0.14em] uppercase text-white/45 no-underline font-normal transition-colors duration-200 hover:text-white">
                {link}
              </a>
            </li>
          ))}
        </ul>
        <div className="text-xs text-white/30 tracking-[0.04em]">
          © 2024 EventIO. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}