import tripRepository from "../repositories/tripRepository.js";

class TripService {
  async listTrips() {
    const result = await tripRepository.findAllTrips();
    return (result.Items || []).sort(
      (a: any, b: any) => (b.started_at || 0) - (a.started_at || 0),
    );
  }

  async getMapData(batch_id: string) {
    const result = await tripRepository.findCoordinates(batch_id);
    if (result.length === 0) {
      throw new Error("NOT_FOUND_COORDINATES");
    }
    return result;
  }

  async getAlerts(batch_id: string) {
    const [alertRows, globalAvg] = await Promise.all([
      tripRepository.findCriticalAlerts(batch_id),
      tripRepository.findGlobalAverage(batch_id),
    ]);

    const alertas = alertRows.map((row) => {
      let maxTension = -Infinity;

      if (row.chart_data && Array.isArray(row.chart_data)) {
        const picos = row.chart_data.map((p) =>
          p.max !== undefined ? p.max : -Infinity,
        );
        maxTension = Math.max(...picos);
      }

      return {
        start_timestamp: row.start_timestamp,
        lat:
          row.geo_points && row.geo_points.length > 0
            ? row.geo_points[0].lat
            : null,
        lng:
          row.geo_points && row.geo_points.length > 0
            ? row.geo_points[0].lng
            : null,
        max_tension: maxTension !== -Infinity ? maxTension : null,
      };
    });

    return { global_average: globalAvg, alerts: alertas };
  }

  async getFullChart(batch_id: string) {
    const [chartRows, globalAvg] = await Promise.all([
      tripRepository.findFullChart(batch_id),
      tripRepository.findGlobalAverage(batch_id),
    ]);

    if (chartRows.length === 0) {
      throw new Error("NOT_FOUND_TRIP_DATA");
    }

    const fullPointsArray = chartRows.flatMap((row: any) => row.chart_data);

    return { points: fullPointsArray, global_average: globalAvg };
  }

  async getSegmentChart(batch_id: string, parquet_ref: string) {
    const [chartRows, globalAvg] = await Promise.all([
      tripRepository.findSegmentChart(batch_id, parquet_ref),
      tripRepository.findGlobalAverage(batch_id),
    ]);

    if (chartRows.length === 0) {
      throw new Error("NOT_FOUND_SEGMENT");
    }

    const chartData = chartRows[0].chart_data;

    return { points: chartData, global_average: globalAvg };
  }
}

export default new TripService();
