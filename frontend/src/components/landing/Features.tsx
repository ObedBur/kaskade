import { ShieldCheck, CreditCard, Clock } from "lucide-react";

export default function Features() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
        <div className="flex flex-col items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1A73E8]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Héros Locaux Vérifiés</h3>
            <p className="text-[#475569] leading-relaxed text-lg">Chaque professionnel sur Kaskade fait l'objet d'une vérification rigoureuse.</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1A73E8]">
            <CreditCard className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Paiements Sécurisés</h3>
            <p className="text-[#475569] leading-relaxed text-lg">Transactions protégées. Les fonds ne sont débloqués qu'après validation.</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1A73E8]">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Disponibilité Immédiate</h3>
            <p className="text-[#475569] leading-relaxed text-lg">Trouvez l'expert idéal disponible dès maintenant dans votre quartier.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
