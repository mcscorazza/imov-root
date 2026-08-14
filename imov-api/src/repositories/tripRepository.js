const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const dynamo = require('../config/dynamo');
const db = require('../config/database');

class TripRepository {
  async findAllTrips() {
    return dynamo.send(new ScanCommand({ TableName: 'trip_state_tracker' }));
  }

  async findCoordinates(batch_id) {
    const query = `
      SELECT geo_points, is_critical, parquet_ref, damage, start_timestamp 
      FROM trip_geolocations 
      WHERE batch_id = $1 
      ORDER BY start_timestamp ASC
    `;
    return db.query(query, [batch_id]);
  }

  async findCriticalAlerts(batch_id) {
    const query = `
      SELECT geo_points, start_timestamp, chart_data 
      FROM trip_geolocations 
      WHERE batch_id = $1 AND is_critical = true 
      ORDER BY start_timestamp ASC
    `;
    return db.query(query, [batch_id]);
  }

  async findGlobalAverage(batch_id) {
    const query = `
      SELECT SUM(chunk_sum) / NULLIF(SUM(chunk_count), 0) AS global_avg
      FROM trip_geolocations
      WHERE batch_id = $1
    `;
    return db.query(query, [batch_id]);
  }

  async findFullChart(batch_id) {
    const query = `
      SELECT chart_data 
      FROM trip_geolocations 
      WHERE batch_id = $1 
      ORDER BY start_timestamp ASC
    `;
    return db.query(query, [batch_id]);
  }

  async findSegmentChart(batch_id, parquet_ref) {
    const query = `
      SELECT chart_data 
      FROM trip_geolocations 
      WHERE batch_id = $1 AND parquet_ref = $2
    `;
    return db.query(query, [batch_id, parquet_ref]);
  }
}

module.exports = new TripRepository();