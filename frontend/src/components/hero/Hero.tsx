import { Dumbbell, Instagram, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import { useState } from "react";

export function Hero() {
  const setActiveTab = useStore(state => state.setActiveTab);
  const navigate = useNavigate();
  const [videoError, setVideoError] = useState(false);
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/";

  const openCatalog = () => {
    setActiveTab('catalogo');
    navigate('/catalogo');
  };

  const categorySignals = [
    "Moda Fitness",
    "Performance",
    "Suplementos",
    "Acessorios"
  ];

  return (
    <div className="relative w-full flex-1 flex flex-col overflow-hidden bg-white">
      {/* Background Media */}
      <div className="absolute inset-0 z-0 bg-white">
        {!videoError ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover mix-blend-multiply opacity-[0.18] grayscale"
          >
            <source
              src="https://videos.pexels.com/video-files/6550881/6550881-uhd_2560_1440_30fps.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-athlete-jumping-on-a-box-in-a-gym-43368-large.mp4"
              type="video/mp4"
            />
          </video>
        ) : (
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop"
            alt="Catalogo fitness PulseFit"
            className="w-full h-full object-cover mix-blend-multiply opacity-[0.18] grayscale"
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Overlay - Claro para manter o texto legivel e o logo nitido */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/78 to-purple-100/35"></div>
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 dot-pattern opacity-60"></div>
      </div>

      <div className="relative z-10 w-full flex-1 flex flex-col justify-center container mx-auto px-6 lg:px-16 pt-12 pb-52 sm:pb-40 lg:pb-32">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 border border-purple-200 text-purple-800 font-bold uppercase tracking-widest text-[10px] rounded shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Catalogo Fitness Premium
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="text-[36px] md:text-[64px] font-bold uppercase tracking-[-0.04em] leading-[1.05] text-neutral-900 mb-6"
          >
            Performance pronta para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-500">seu treino.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease: "easeOut" }}
            className="max-w-xl text-sm md:text-base font-medium text-neutral-600 leading-relaxed mb-5"
          >
            Roupas, suplementos e acessorios selecionados para quem treina com foco, conforto e estilo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38, ease: "easeOut" }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categorySignals.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/85 border border-neutral-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-neutral-700 shadow-sm">
                <Dumbbell className="w-3 h-3 text-purple-600" />
                {item}
              </span>
            ))}
          </motion.div>

          <motion.button
            onClick={openCatalog}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-800 to-purple-500 text-white font-bold text-sm uppercase tracking-tight rounded-full hover:from-purple-700 hover:to-purple-400 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_32px_rgba(168,85,247,0.3)]"
          >
            <ShoppingBag className="w-5 h-5" />
            Ver Catalogo
          </motion.button>
        </div>
      </div>

      {/* Bottom Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-4 right-4 left-auto w-[190px] sm:w-[230px] lg:bottom-8 lg:right-16 lg:w-[280px] z-20"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bento-card p-2.5 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3 bg-white/90 backdrop-blur-md shadow-xl"
        >
          <div className="flex gap-2.5 sm:gap-3 items-center">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 bg-purple-100 border border-purple-200 flex items-center justify-center rounded-full text-purple-700">
              <Instagram className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-tight text-neutral-900 mb-1">
                Siga a PulseFit
              </h3>
              <p className="hidden sm:block text-[10px] font-medium text-neutral-500 leading-tight">
                Veja novidades, looks e ofertas no Instagram.
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.open(instagramUrl, "_blank", "noopener,noreferrer")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-100 text-neutral-900 border border-neutral-200 font-bold text-[10px] sm:text-[11px] uppercase rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 transition-colors w-full"
          >
            <Instagram className="inline-block w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2 align-[-2px]" />
            Instagram
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
