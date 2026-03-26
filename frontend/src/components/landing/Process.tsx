import { UserSearch, MessageCircle, Lock, CheckCircle2 } from "lucide-react";

export default function Process() {
  const steps = [
    { title: "Cherchez", desc: "Parcourez les profils vérifiés et choisissez l'expertise.", icon: UserSearch },
    { title: "Collaborez", desc: "Discutez des détails et fixez vos modalités ensemble.", icon: MessageCircle },
    { title: "Réservez", desc: "Paiement sécurisé via Mobile Money avec protection.", icon: Lock },
    { title: "Validez", desc: "Appréciez le résultat et libérez le paiement final.", icon: CheckCircle2 },
  ];

  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-5xl font-extrabold mb-6 tracking-tight">L'expérience Kaskade</h2>
        <p className="text-[#475569] text-xl max-w-2xl mx-auto">Un processus simple, transparent et sécurisé pour votre sérénité.</p>
      </div>
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12">
        {steps.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center text-center group">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 z-10 transition-all duration-300 ${i === 3 ? 'bg-[#1A73E8] text-white shadow-xl shadow-[#1A73E8]/20' : 'bg-slate-50 border border-slate-100 group-hover:bg-[#1A73E8] group-hover:text-white'}`}>
              <step.icon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-xl mb-3">{step.title}</h4>
            <p className="text-[#475569]">{step.desc}</p>
            {i < 3 && <div className="hidden md:block absolute top-10 left-1/2 w-full h-[1px] bg-slate-200 -z-0"></div>}
          </div>
        ))}
      </div>
    </section>
  );
}
