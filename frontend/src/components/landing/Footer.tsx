export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-white rounded-t-[4rem] mt-20 pt-24 pb-12 overflow-hidden relative">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl -z-0"></div>
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-16">
          <div className="max-w-sm">
            <a className="text-3xl font-extrabold text-white mb-8 block tracking-tighter" href="#">Kaskade.com</a>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 text-pretty">
              La référence premium pour connecter talents locaux et clients exigeants en toute sécurité.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
            <div>
              <h5 className="font-bold mb-8 text-[10px] uppercase tracking-[0.3em] text-[#1A73E8]">Plateforme</h5>
              <ul className="space-y-4 text-slate-400 font-medium text-sm">
                <li><a className="hover:text-white transition-colors" href="#">Devenir Expert</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Nos Services</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Marketplace</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-8 text-[10px] uppercase tracking-[0.3em] text-[#1A73E8]">Légal</h5>
              <ul className="space-y-4 text-slate-400 font-medium text-sm">
                <li><a className="hover:text-white transition-colors" href="#">Confidentialité</a></li>
                <li><a className="hover:text-white transition-colors" href="#">Conditions</a></li>
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <h5 className="font-bold mb-8 text-[10px] uppercase tracking-[0.3em] text-[#1A73E8]">Paiement Sécurisé</h5>
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">M-PESA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 flex justify-between items-center text-slate-500 text-xs">
          <p>© 2024 Kaskade.com. Excellence & Trust.</p>
        </div>
      </div>
    </footer>
  );
}
