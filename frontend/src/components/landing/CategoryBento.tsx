import { ArrowRight } from "lucide-react";

export default function CategoryBento() {
  return (
    <section className="py-32 px-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <span className="text-[#1A73E8] font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Découvrir</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Nos catégories premium</h2>
          </div>
          <button className="flex items-center gap-2 text-[#0F172A] font-bold group border-b-2 border-transparent hover:border-[#1A73E8] transition-all pb-1">
            Voir tous les services <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-6 h-auto md:h-[750px]">
          {/* Large Card: Repair & Tech */}
          <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[400px]">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRZet1gaIZIB_sb72MIh6t0Ul_nZY36OQu7JxYlinwurMqsAZ9LoRNC1R-YMdP6vagjOXpRglY9AqU230iQlSSN2CJgr1x08qU7vpt0lwkNekOTm4lKrO2m112vA_Ye0zN20nr2rz_5bf_kSyUfDHzwmw7pENRtF3bIqkj3W2vbXyp3V9iFl3u8NtDX6KLjrTBaxYjKXaIuT9Uv7Ok25pRXebt1kbGKCn81r2GqXcA76cJ3-iy1z6_aj9YrzvBWqjrtAXIUj_2BrI" alt="Repair" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 60%)" }}></div>
            <div className="absolute top-8 left-8">
              <span className="bg-white/70 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold text-[#0F172A] uppercase tracking-widest">Expertise Tech</span>
            </div>
            <div className="absolute bottom-0 left-0 p-10 w-full">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Réparation & Tech</h3>
              <p className="text-slate-200 text-lg">45 experts hautement qualifiés à proximité</p>
            </div>
          </div>

          {/* Medium Card: House Maintenance */}
          <div className="md:col-span-2 md:row-span-1 relative group overflow-hidden rounded-[32px] shadow-lg hover:shadow-xl transition-all duration-500 min-h-[300px]">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBk85WeV6qg_jMrN_TgxOJyvXS0IrYZT7c5nS_5oKZ8bDsUmr8CB9UXKkchJT1ivEu2NxDXpeorojrg89AOLBIzwbemgtjbZOM3ozrzttKK4LXaW38b5BaxecWU2ye3qIqyEwqlJgb743O6dn0N2vjF10_vFmVkF7LfhL9cllSrafo5lkrCOon0E88S2tMCKhlcAJU530Tx8ltb2U4Oa6WoIRLyZxN4gZ-dfX-CD3vlonY6m9lpixnjGhqoe2AAYEqVbSkdBDX6oTE" alt="House" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 60%)" }}></div>
            <div className="absolute top-6 left-6">
              <span className="bg-white/70 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold text-[#0F172A] uppercase tracking-widest">Maison & Confort</span>
            </div>
            <div className="absolute bottom-0 left-0 p-8 w-full">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Entretien Maison</h3>
              <p className="text-slate-200 text-lg">Services premium pour votre intérieur</p>
            </div>
          </div>

          <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[32px] min-h-[300px]">
            <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXBzV3AQ4bXBq5IHRw0PF59dbhcXP2dc-k0G5iBe6s-8IOvgyBJdasDQKCiFV_YBWEoDDtM92tb7Tqp66e68mP3gDSuNKsKaKq_Kxw2W4D_CjiRZOkOfy1YWRYUH0wnqawfUt6lmFtAr4oaq4nnQMvzRB8yJMV6s5_Cin_Uc6AHgLTfposNNxjQxqxLUGUJyY_faWo2RBxxuDoDtddFWRQLLszmxbqUDsULUdDjRSKvBHwhoZU2Q6PK9dY6xWCGOKZzU3CEC0RL4s" alt="Wellness" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 60%)" }}></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Bien-être</h3>
              <p className="text-slate-200 text-sm">Coaching & Soins</p>
            </div>
          </div>

          <div className="md:col-span-1 md:row-span-1 relative group overflow-hidden rounded-[32px] min-h-[300px]">
            <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVYpZQxtOpX5R2D1TJwi-wvy6FzeLHnL2b0fllWBYuoSlXow1CWM8oPaBSSS6PF7v6d-JhT1FH7Y_e9dDqoWuldr79pVNszn-Xt6o6X8fP0keXRtmo49vTXkMcDO4hJ5N7tpvoxwSVeViuOnoEvN8HPFomvKYs1VuURzhMylaj2jFx2eomE_hnA7noImZA4vY3thALQfauurahSfKcyTLHb-TtCeLVrYj8C2pVDqaBMLTQWUe4nbL0-a6ErqjN13luIoGydOo9FAo" alt="Pets" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0) 60%)" }}></div>
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Animaux</h3>
              <p className="text-slate-200 text-sm">Toilettage de luxe</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
