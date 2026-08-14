// src/components/layout/TripDrawer.tsx
import { useState, useEffect } from 'react';
import { useTripStore } from '../../store/useTripStore';

export function TripDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const tripsList = useTripStore((state) => state.tripsList);
  const isFetchingList = useTripStore((state) => state.isFetchingList);
  const fetchTripsList = useTripStore((state) => state.fetchTripsList);
  const fetchTrip = useTripStore((state) => state.fetchTrip);

  // Busca a lista apenas uma vez quando o componente é montado
  useEffect(() => {
    fetchTripsList();
  }, [fetchTripsList]);

  // Função disparada ao clicar em um card
  const handleSelectTrip = (batchId: string) => {
    window.history.pushState({}, "", `?id=${batchId}`);
    fetchTrip(batchId);
    setIsOpen(false); // Esconde a gaveta automaticamente após selecionar
  };

  return (
    <>
      {/* Overlay escuro que aparece atrás da gaveta quando aberta */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Container Principal da Gaveta */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-80 bg-slate-100 shadow-2xl border-r border-slate-200 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >

        {/* ABA FLUTUANTE (Tab) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-[32px] bottom-50 bg-slate-800 text-white py-2 px-6 rounded-r-lg text-[10px] font-bold tracking-widest flex items-center justify-center shadow-md hover:bg-slate-700 transition-colors"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          {isOpen ? '✖ FECHAR' : 'HISTÓRICO'}
        </button>

        {/* CABEÇALHO */}
        <div className="p-4 bg-white border-b border-slate-200 shrink-0">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Últimas Viagens
          </h2>
        </div>

        {/* LISTA DE VIAGENS (Com Scroll) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isFetchingList ? (
            <div className="text-center text-slate-500 text-sm mt-10 animate-pulse">
              ⏳ Carregando histórico...
            </div>
          ) : (
            tripsList.map((trip) => {
              // Cálculos de Status e Data (Baseado no seu js original)
              const statusOp = trip.status || trip.trip_status || "DESCONHECIDO";
              const isConsolidated = statusOp === "CONSOLIDATED";

              // O backend pode mandar o timestamp em milissegundos ou segundos
              const timestamp = trip.started_at > 9999999999 ? trip.started_at : trip.started_at * 1000;
              const dataFormatada = new Date(timestamp).toLocaleString("pt-BR", {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              });

              return (
                <div
                  key={trip.batch_id}
                  onClick={() => handleSelectTrip(trip.batch_id)}
                  className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[11px] font-bold text-slate-700">📅 {dataFormatada}</div>
                    <div className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full ${isConsolidated ? 'bg-green-600' : statusOp === 'PENDING' ? 'bg-amber-500' : 'bg-slate-500'
                      }`}>
                      {statusOp}
                    </div>
                  </div>

                  <div className="text-[13px] font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    📟 {trip.datalogger_id || "DL Desconhecido"}
                  </div>

                  <div className="text-[11px] text-slate-600 leading-relaxed mb-2 bg-slate-50 p-2 rounded border border-dashed border-slate-300">
                    <span className="text-blue-500 mr-1">📌</span> {trip.city_start || "Origem Indisponível"}<br />
                    {isConsolidated ? (
                      <><span className="text-green-600 mr-1">✅</span> {trip.city_end}</>
                    ) : (
                      <><span className="text-amber-500 mr-1">🔄</span> {trip.city_current || trip.city_end} <span className="text-[10px] text-slate-400">(em trânsito)</span></>
                    )}
                  </div>

                  <div className="text-[9px] text-slate-400 font-mono truncate">
                    ID: {trip.batch_id}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}