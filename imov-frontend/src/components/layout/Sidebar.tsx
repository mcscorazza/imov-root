import type { TripData } from '../../types/trip';
import { StatusBadge } from '../ui/StatusBadge';

interface SidebarProps {
  data: TripData | null | undefined;
  onOpenDeformacao: () => void;
  onOpenFadiga: () => void;
}

export function Sidebar({ data, onOpenDeformacao, onOpenFadiga }: SidebarProps) {
  if (!data) {
    return (
      <aside className="w-full h-full bg-white border border-slate-200 rounded shadow-sm flex flex-col p-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-slate-100 rounded w-full mb-4"></div>
        <div className="h-10 bg-slate-50 rounded w-full mb-4"></div>
      </aside>
    );
  }

  return (
    <aside className="w-full h-full bg-white border border-slate-200 rounded shadow-sm flex flex-col p-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase mb-4 border-b border-slate-200 pb-2 shrink-0">
        Resumo da Viagem
      </h2>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-md border border-slate-100 mb-4">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Equipamento</div>
            <div className="text-lg font-bold text-slate-800">📟 {data.datalogger_id}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</div>
            <StatusBadge status={data.status} />
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Trajeto (Origem ➔ Destino)</div>
          <div className="text-sm font-medium text-slate-700">
            <span className="text-blue-500 mr-2">📌</span> {data.city_start}<br />
            <span className="text-blue-500 mr-2">🔄</span> {data.city_end}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Diagnóstico de Deformação</div>
          <div className="text-green-600 font-bold text-sm flex items-center gap-1">
            ✅ Operação Normal
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dano Acumulado (Fadiga)</div>
          <div className="text-xl font-bold text-purple-700">
            Σ {typeof data.dano_acumulado === 'number' ? data.dano_acumulado.toExponential(4) : '0.0000e+0'}
          </div>
        </div>

        <div className="flex justify-between border-t border-slate-100 pt-4 mb-4">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Duração</div>
            <div className="text-sm font-bold text-slate-800">{data.duracao}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Distância</div>
            <div className="text-sm font-bold text-slate-800">{data.distancia}</div>
          </div>
        </div>

        <div className="mb-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Volume de Dados Lidos</div>
          <div className="text-sm text-slate-600">{data.total_pontos} pontos de GPS/Sensores</div>
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-slate-200 shrink-0 flex flex-col gap-3">
        <button
          onClick={onOpenDeformacao}
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          📉 Gráfico Deformação (&micro;S)
        </button>

        <button
          onClick={onOpenFadiga}
          style={{ backgroundColor: '#8e44ad' }}
          className="w-full py-2.5 px-4 text-white hover:opacity-90 rounded-md text-sm font-semibold transition-opacity shadow-[0_4px_6px_rgba(142,68,173,0.3)] flex items-center justify-center gap-2"
        >
          📊 Histograma de Fadiga
        </button>
      </div>

    </aside>
  );
}