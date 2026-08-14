// src/store/useTripStore.ts
import { create } from "zustand";
import { api } from "../services/api";
import type { TripData } from "../services/api";
import { calcularDistanciaHaversine } from "../utils/math";
// import type { TripData } from "../types/trip";

export interface SidebarData {
  datalogger_id: string;
  status: string;
  city_start: string;
  city_end: string;
  qtd_criticos: number;
  dano_acumulado: number;
  duracao: string;
  distancia: string;
  total_pontos: string;
}

interface TripStore {
  summary: SidebarData | null;
  isLoading: boolean;
  fetchTrip: (batchId: string) => Promise<void>;

  tripsList: TripData[];
  isFetchingList: boolean;
  fetchTripsList: () => Promise<void>;
}

export const useTripStore = create<TripStore>((set) => ({
  summary: null,
  isLoading: false,
  tripsList: [],
  isFetchingList: false,

  fetchTrip: async (batchId: string) => {
    set({ isLoading: true, summary: null });

    try {
      const listaViagens = await api.fetchListaDeViagens();
      const tripMeta =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        listaViagens.find((t) => t.batch_id === batchId) || ({} as any);
      const trechos = await api.fetchDadosDoMapa(batchId);
      let danoTotal = 0;
      let qtdCriticos = 0;
      const coordsGlobais: Array<{ lat: number; lng: number; t: number }> = [];

      trechos.forEach((trecho) => {
        danoTotal += parseFloat(trecho.damage as string) || 0;
        if (trecho.is_critical === true || trecho.is_critical === "true") {
          qtdCriticos++;
        }
        if (trecho.geo_points) {
          coordsGlobais.push(...trecho.geo_points);
        }
      });

      coordsGlobais.sort((a, b) => a.t - b.t);

      let distanciaKm = 0;
      for (let i = 1; i < coordsGlobais.length; i++) {
        distanciaKm += calcularDistanciaHaversine(
          coordsGlobais[i - 1].lat,
          coordsGlobais[i - 1].lng,
          coordsGlobais[i].lat,
          coordsGlobais[i].lng,
        );
      }

      let duracaoStr = "0h 0m";
      if (coordsGlobais.length > 0) {
        const tInicio = coordsGlobais[0].t;
        const tFim = coordsGlobais[coordsGlobais.length - 1].t;
        const duracaoSegundos = tFim - tInicio;

        const horas = Math.floor(duracaoSegundos / 3600);
        const minutos = Math.floor((duracaoSegundos % 3600) / 60);
        duracaoStr = `${horas}h ${minutos}m`;
      }

      const sidebarData: SidebarData = {
        datalogger_id: tripMeta.datalogger_id || "Desconhecido",
        status: tripMeta.status || tripMeta.trip_status || "PENDING",
        city_start: tripMeta.city_start || "Origem não info.",
        city_end:
          tripMeta.city_end || tripMeta.city_current || "Destino não info.",
        qtd_criticos: qtdCriticos,
        dano_acumulado: danoTotal,
        duracao: duracaoStr,
        distancia: `${distanciaKm.toFixed(1)} km`,
        total_pontos: coordsGlobais.length.toLocaleString("pt-BR"),
      };

      set({ summary: sidebarData, isLoading: false });
    } catch (error) {
      console.error("Erro ao processar viagem:", error);
      set({ isLoading: false });
    }
  },
  fetchTripsList: async () => {
    set({ isFetchingList: true });
    try {
      const list = await api.fetchListaDeViagens();
      set({ tripsList: list, isFetchingList: false });
    } catch (error) {
      console.error("Erro ao buscar lista de viagens:", error);
      set({ isFetchingList: false });
    }
  },
}));
