import { Mail } from "lucide-react";

type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export default function LegalDocument({
  eyebrow,
  title,
  introduction,
  sections,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: LegalSection[];
}) {
  return (
    <main className="flex-1 bg-[#FCFBF7] pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="arcture-container max-w-4xl">
        <header className="border-b border-ocre/15 pb-10 sm:pb-14">
          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.32em] text-ocre">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-black uppercase leading-none tracking-tighter text-chocolat sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-chocolat/70 sm:text-lg">
            {introduction}
          </p>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-chocolat/45">
            Dernière mise à jour : 10 septembre 2026
          </p>
        </header>

        <div className="mt-10 space-y-10 sm:mt-14 sm:space-y-14">
          {sections.map((section, index) => (
            <section key={section.title} className="grid gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-6">
              <span className="text-2xl font-serif italic text-ocre/70">0{index + 1}</span>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-chocolat sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-chocolat/70 sm:text-base">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.items ? (
                    <ul className="space-y-2 border-l-2 border-ocre/30 pl-5">
                      {section.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  ) : null}
                </div>
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-14 flex items-start gap-4 rounded-2xl border border-ocre/15 bg-white p-6 shadow-sm sm:mt-20">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-ocre" />
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-chocolat">Nous contacter</h2>
            <p className="mt-2 text-sm leading-6 text-chocolat/70">
              Pour toute question concernant ce document ou votre compte, écrivez-nous à{" "}
              <a className="font-bold text-ocre hover:text-chocolat" href="mailto:contact@cascadheure.app">
                contact@cascadheure.app
              </a>.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
