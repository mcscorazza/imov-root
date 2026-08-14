const tripService = require('../services/tripService');

class TripController {
  async getTrips(req, res) {
    try {
      const trips = await tripService.listTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMap(req, res) {
    try {
      const data = await tripService.getMapData(req.params.batch_id);
      res.json(data);
    } catch (error) {
      if (error.message === "NOT_FOUND_COORDINATES") {
        return res.status(404).json({ error: "Nenhuma coordenada encontrada para esta viagem." });
      }
      console.error("Erro ao buscar coordenadas:", error);
      res.status(500).json({ error: "Falha interna no servidor." });
    }
  }

  async getAlerts(req, res) {
    try {
      const data = await tripService.getAlerts(req.params.batch_id);
      res.json(data);
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      res.status(500).json({ error: "Falha interna no servidor." });
    }
  }

  async getFullChart(req, res) {
    try {
      const { batch_id } = req.params;
      console.log(`Buscando a viagem COMPLETA para: ${batch_id}`);
      
      const data = await tripService.getFullChart(batch_id);
      
      console.log(`Sucesso! ${data.points.length} pontos consolidados enviados.`);
      res.json(data);
    } catch (error) {
      if (error.message === "NOT_FOUND_TRIP_DATA") {
        return res.status(404).json({ error: "Nenhum dado encontrado para esta viagem." });
      }
      console.error("Erro ao processar viagem completa:", error);
      res.status(500).json({ error: "Falha interna no servidor." });
    }
  }

  async getSegmentChart(req, res) {
    try {
      const { batch_id, parquet_ref } = req.params;
      console.log(`Buscando dados para parquet_ref: ${parquet_ref}`);
      
      const data = await tripService.getSegmentChart(batch_id, parquet_ref);
      res.json(data);
    } catch (error) {
      if (error.message === "NOT_FOUND_SEGMENT") {
        return res.status(404).json({ error: "Trecho não encontrado." });
      }
      console.error("Erro ao buscar segmento:", error);
      res.status(500).json({ error: "Falha interna." });
    }
  }
}

module.exports = new TripController();