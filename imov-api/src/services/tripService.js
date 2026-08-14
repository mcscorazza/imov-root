const tripRepository = require('../repositories/tripRepository');

class TripService {
  async listTrips() {
    const result = await tripRepository.findAllTrips();
    return result.Items.sort((a, b) => (b.started_at || 0) - (a.started_at || 0));
  }

  async getMapData(batch_id) {
    const result = await tripRepository.findCoordinates(batch_id);
    if (result.rows.length === 0) {
      throw new Error("NOT_FOUND_COORDINATES");
    }
    return result.rows;
  }

  async getAlerts(batch_id) {
    const [resultAlerts, resultAvg] = await Promise.all([
      tripRepository.findCriticalAlerts(batch_id),
      tripRepository.findGlobalAverage(batch_id)
    ]);

    const globalAvg = parseFloat(resultAvg.rows[0]?.global_avg || 0);

    const alertas = resultAlerts.rows.map(row => {
      let maxTension = -Infinity;

      if (row.chart_data && Array.isArray(row.chart_data)) {
        const picos = row.chart_data.map(p => p.max !== undefined ? p.max : -Infinity);
        maxTension = Math.max(...picos);
      }

      return {
        start_timestamp: row.start_timestamp,
        lat: (row.geo_points && row.geo_points.length > 0) ? row.geo_points[0].lat : null,
        lng: (row.geo_points && row.geo_points.length > 0) ? row.geo_points[0].lng : null,
        max_tension: maxTension !== -Infinity ? maxTension : null
      };
    });

    return { global_average: globalAvg, alerts: alertas };
  }

  async getFullChart(batch_id) {
    const [resultChart, resultAvg] = await Promise.all([
      tripRepository.findFullChart(batch_id),
      tripRepository.findGlobalAverage(batch_id)
    ]);

    if (resultChart.rows.length === 0) {
      throw new Error("NOT_FOUND_TRIP_DATA");
    }

    const fullPointsArray = resultChart.rows.flatMap(row => row.chart_data);
    const globalAvg = parseFloat(resultAvg.rows[0]?.global_avg || 0);

    return { points: fullPointsArray, global_average: globalAvg };
  }

  async getSegmentChart(batch_id, parquet_ref) {
    const [resultChart, resultAvg] = await Promise.all([
      tripRepository.findSegmentChart(batch_id, parquet_ref),
      tripRepository.findGlobalAverage(batch_id)
    ]);

    if (resultChart.rows.length === 0) {
      throw new Error("NOT_FOUND_SEGMENT");
    }

    const chartData = resultChart.rows[0].chart_data;
    const globalAvg = parseFloat(resultAvg.rows[0]?.global_avg || 0);

    return { points: chartData, global_average: globalAvg };
  }
}

module.exports = new TripService();