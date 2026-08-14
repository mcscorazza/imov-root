// src/App.tsx
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

import Header from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { TripDrawer } from "./components/layout/TripDrawer";

import { Logo } from "./components/ui/Logo";
import { useTripStore } from './store/useTripStore';
import { useState, useEffect } from 'react';



function App() {
  const { instance, accounts } = useMsal();
  const [activeChart, setActiveChart] = useState<'deformacao' | 'fadiga' | null>(null);
  const fetchTrip = useTripStore((state) => state.fetchTrip);

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(e => {
      console.error("Erro no login:", e);
    });
  };
  const handleLogout = () => {
    instance.logoutRedirect().catch(e => {
      console.error("Erro no logout:", e);
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idDaUrl = params.get("id");

    if (idDaUrl) {
      fetchTrip(idDaUrl);
    }
  }, [fetchTrip]);

  const tripSummary = useTripStore((state) => state.summary);

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* TELA DE LOGIN (Usuário Deslogado)                                 */}
      {/* ----------------------------------------------------------------- */}
      <UnauthenticatedTemplate>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">

          <div className="bg-white p-8 md:p-10 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-md w-full text-center border border-slate-100">
            <Logo className="mx-auto mb-4" />
            <h1 className="text-2xl text-slate-800 mb-2 font-semibold">
              Bem-vindo(a)
            </h1>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed px-2">
              Faça login com a sua conta corporativa para acessar o painel de controle e telemetria.
            </p>

            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white text-slate-700 border border-slate-300 rounded-lg text-[15px] font-semibold hover:bg-slate-50 hover:shadow-sm hover:border-slate-400 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" className="w-5 h-5">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              Entrar com a conta Microsoft
            </button>

          </div>

        </div>
      </UnauthenticatedTemplate>

      {/* ----------------------------------------------------------------- */}
      {/* APLICAÇÃO PRINCIPAL (Usuário Logado)                              */}
      {/* ----------------------------------------------------------------- */}
      <AuthenticatedTemplate>
        <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden font-sans relative p-2">
          <Header
            userName={accounts[0]?.name}
            userEmail={accounts[0]?.username}
            onLogout={handleLogout}
          />
          <TripDrawer />
          <div className="flex flex-1 overflow-hidden gap-2">
            <div className="w-70 shrink-0 h-full">
              <Sidebar
                data={tripSummary}
                onOpenDeformacao={() => setActiveChart('deformacao')}
                onOpenFadiga={() => setActiveChart('fadiga')}
              />
            </div>

            {/* Coluna 2: Mapa */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
              <div className="flex-1 bg-white rounded shadow-sm border border-slate-200 flex items-center justify-center text-slate-400">
                <p>O MapArea entra aqui (100% do restante da tela)</p>
              </div>
            </main>

            <div className="w-70 shrink-0 h-full">
              <div className="bg-white border border-slate-200 rounded shadow-sm p-4 w-full h-full flex flex-col">
                <h3 className="text-sm font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">
                  Camadas do Mapa
                </h3>
              </div>
            </div>

          </div>

          {/* ÁREA INFERIOR (Gráficos) */}
          {activeChart && (
            <div className="h-[400px] w-full bg-white border-t border-slate-300 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] shrink-0 relative flex flex-col z-50 transition-all">
              <div className="flex justify-between items-center p-2 px-6 border-b border-slate-100 bg-slate-50">
                <span className="font-bold text-slate-700 text-sm uppercase tracking-wide">
                  {activeChart === 'deformacao' ? '📉 Gráfico de Deformação (µS)' : '📊 Histograma de Fadiga'}
                </span>
                <button
                  onClick={() => setActiveChart(null)}
                  className="px-3 py-1 bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-600 rounded text-xs font-bold transition-colors"
                >
                  ✖ Fechar
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50">
                Renderize o componente do ECharts correspondente aqui.
              </div>
            </div>
          )}

        </div>
      </AuthenticatedTemplate>
    </>
  );
}

export default App;