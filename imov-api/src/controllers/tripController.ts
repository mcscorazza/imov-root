import type { Request, Response } from "express";
import tripService from "../services/tripService.js";

class TripController {
  async getTrips(req: Request, res: Response): Promise<void> {
    try {
      const trips = await tripService.listTrips();
      res.json(trips);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMap(req: Request, res: Response): Promise<void | Response> {
    try {
      const batch_id = req.params.batch_id as string;
      const data = await tripService.getMapData(batch_id);
      res.json(data);
    } catch (error: any) {
      if (error.message === "NOT_FOUND_COORDINATES") {
        return res
          .status(404)
          .json({ error: "Nenhuma coordenada encontrada para esta viagem." });
      }
      console.error("Erro ao buscar coordenadas:", error);
      res.status(500).json({ error: "Falha interna no servidor." });
    }
  }

  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const batch_id = req.params.batch_id as string;
      const data = await tripService.getAlerts(batch_id);
      res.json(data);
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      res.status(500).json({ error: "Falha interna no servidor." });
    }
  }

  async getFullChart(req: Request, res: Response): Promise<void | Response> {
    try {
      const batch_id = req.params.batch_id as string;
      console.log(`Buscando a viagem COMPLETA para: ${batch_id}`);

      const data = await tripService.getFullChart(batch_id);

      console.log(
        `Sucesso! ${data.points.length} pontos consolidados enviados.`,
      );
      res.json(data);
    } catch (error: any) {
      if (error.message === "NOT_FOUND_TRIP_DATA") {
        return res
          .status(404)
          .json({ error: "Nenhum dado encontrado para esta viagem." });
      }
      console.error("Erro ao processar viagem completa:", error);
      res.status(500).json({ error: "Falha interna no servidor." });
    }
  }

  async getSegmentChart(req: Request, res: Response): Promise<void | Response> {
    try {
      const batch_id = req.params.batch_id as string;
      const parquet_ref = req.params.parquet_ref as string;
      console.log(`Buscando dados para parquet_ref: ${parquet_ref}`);

      const data = await tripService.getSegmentChart(batch_id, parquet_ref);
      res.json(data);
    } catch (error: any) {
      if (error.message === "NOT_FOUND_SEGMENT") {
        return res.status(404).json({ error: "Trecho não encontrado." });
      }
      console.error("Erro ao buscar segmento:", error);
      res.status(500).json({ error: "Falha interna." });
    }
  }
}

export default new TripController();
