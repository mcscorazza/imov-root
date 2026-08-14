// src/components/layout/Header.tsx
import { useState } from 'react';
import { useTripStore } from '../../store/useTripStore';
import { Logo } from '../ui/Logo';

interface HeaderProps {
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

export default function Header({ userName, userEmail, onLogout }: HeaderProps) {
  const [batchId, setBatchId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get("id") || '';
    }
    return '';
  });

  const fetchTrip = useTripStore((state) => state.fetchTrip);

  // Variável isLoading agora será usada no botão
  const isLoading = useTripStore((state) => state.isLoading);

  // Função handleSearch agora será chamada pelo onClick do botão e pelo onKeyDown do Input
  const handleSearch = () => {
    if (batchId.trim() === '') return;

    // Atualiza a URL sem recarregar a página
    window.history.pushState({}, "", `?id=${batchId.trim()}`);

    // Dispara a busca
    fetchTrip(batchId.trim());
  };

  const getShortName = (fullName?: string) => {
    if (!fullName) return "Usuário";
    const names = fullName.trim().split(" ");
    if (names.length === 1) return names[0];
    return `${names[0]} ${names[names.length - 1]}`;
  };

  return (
    <header className="flex w-full h-15 bg-slate-100 shrink-0 gap-2">

      {/* COLUNA ESQUERDA: Logo */}
      <div className="w-70 shrink-0 flex items-center justify-center">
        <Logo height={50} />
      </div>

      {/* COLUNA CENTRAL: Busca */}
      <div className="flex-1 flex items-center w-full">
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow border border-slate-200 w-full">
          <h2 className="text-[15px] font-bold text-slate-800 hidden md:block ml-2">
            Rastreamento
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Bônus: Busca ao dar Enter
              placeholder="Cole o Batch ID da viagem..."
              className="w-[300px] px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 placeholder-slate-400"
            />

            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-6 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-md hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>

          </div>
        </div>
      </div>

      {/* COLUNA DIREITA: Perfil */}
      <div className="w-70 shrink-0 flex items-center justify-end pr-6">
        <div className="text-right hidden sm:block">
          <div className="text-[15px] font-bold text-slate-800 leading-tight">{getShortName(userName)}</div>
          <div className="text-[8px] text-slate-500 font-semibold tracking-wide mt-0.5">{userEmail}</div>
        </div>
        <div className="relative w-11 h-11 rounded-full border-2 border-teal-600 p-[2px] ml-4 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
            <span className="text-slate-500 font-bold text-sm absolute z-0">{userName?.charAt(0).toUpperCase() || 'U'}</span>
            <img src="/avatar-placeholder.png" alt="Avatar" className="w-full h-full object-cover relative z-10" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
        </div>
        <button onClick={onLogout} title="Sair do Sistema" className="ml-2 p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </div>

    </header>
  );
}