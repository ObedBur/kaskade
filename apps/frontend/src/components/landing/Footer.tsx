"use client";

export default function Footer() {
  return (
    <footer className="w-full bg-chocolat text-off-white rounded-t-3xl md:rounded-t-[4rem] mt-24 pt-24 pb-12 overflow-hidden relative shadow-2xl">
      <div className="absolute inset-0 bg-ocre/5 backdrop-blur-3xl -z-0 pointer-events-none"></div>
      
      <div className="arcture-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24 mb-24">
          
          {/* Logo & Info */}
          <div className="lg:col-span-1">
            <a className="text-4xl font-serif font-black text-ocre mb-10 block tracking-tighter uppercase" href="#">Kaskade.</a>
            <p className="text-off-white/60 text-base leading-relaxed font-sans tracking-wide">
              La référence premium pour connecter talents locaux et clients visionnaires au sein de l'écosystème architectural de Kaskade.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h5 className="font-serif font-black mb-10 text-[10px] uppercase tracking-[0.4em] text-ocre opacity-80">Réseau.</h5>
            <ul className="space-y-5 text-off-white/50 font-sans uppercase text-[10px] tracking-widest font-bold">
              <li><a className="hover:text-ocre transition-all" href="#">Devenir Expert</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Nos Services</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Marketplace</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-serif font-black mb-10 text-[10px] uppercase tracking-[0.4em] text-ocre opacity-80">Juridique.</h5>
            <ul className="space-y-5 text-off-white/50 font-sans uppercase text-[10px] tracking-widest font-bold">
              <li><a className="hover:text-ocre transition-all" href="#">Confidentialité</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Conditions</a></li>
              <li><a className="hover:text-ocre transition-all" href="#">Sécurité</a></li>
            </ul>
          </div>

          {/* Infrastructure */}
          <div>
            <h5 className="font-serif font-black mb-10 text-[10px] uppercase tracking-[0.4em] text-ocre opacity-80">Infrastructure.</h5>
            <div className="flex flex-col gap-4">
              <div className="px-6 py-4 border border-ocre/20 bg-white/5 rounded-sm flex items-center gap-4 hover:border-ocre/50 transition-all group max-w-xs">
                <div className="w-2 h-2 rounded-full bg-ocre animate-pulse"></div>
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80 group-hover:text-ocre">M-PESA INTÉGRÉ</span>
              </div>
            </div>
          </div>

        </div>

        {/* Arcture Copyright Area */}
        <div className="pt-16 border-t border-ocre/10 flex flex-col md:flex-row justify-between items-center text-off-white/30 text-[9px] font-bold uppercase tracking-[0.2em] gap-8">
          <p>© 2026 KAS-KADE SYSTEMS. TOUS DROITS RÉSERVÉS.</p>
          <div className="flex gap-8">
             <a href="#" className="hover:text-ocre transition-colors italic">INSTAGRAM</a>
             <a href="#" className="hover:text-ocre transition-colors italic">LINKEDIN</a>
          </div>
          <p className="italic">L'exclusivité par la proximité.</p>
        </div>
      </div>
    </footer>
  );
}
