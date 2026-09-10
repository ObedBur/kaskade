import React from 'react';
import Link from 'next/link';

export default function AuthFooter() {
  return (
    <footer className="bg-off-white text-chocolat/40 font-sans text-[10px] uppercase tracking-[0.1em] py-8 px-8 md:px-20 border-t border-ocre/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>© 2024 CASCADHEURE SYSTEME ARCHICTECTURE</div>
        <div className="flex space-x-10">
          <Link className="hover:text-ocre transition-all duration-300" href="/confidentialite">Confidentialité</Link>
          <Link className="hover:text-ocre transition-all duration-300" href="/conditions">Conditions</Link>
          <a className="hover:text-ocre transition-all duration-300" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}
