import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import dynamo from "../config/dynamo.js";
import db from "../config/database.js";

export interface AlertRow {
  geo_points: any[] | null;
  start_timestamp: string;
  chart_data: any[] | null;
}

export interface GlobalAvgRow {
  global_avg: string | number;
}

class TripRepository {
  async findAllTrips() {
    return dynamo.send(new ScanCommand({ TableName: "trip_state_tracker" }));
  }

  async findCoordinates(batch_id: string) {
    const query = `
      SELECT geo_points, is_critical, parquet_ref, damage, start_timestamp 
      FROM trip_geolocations 
      WHERE batch_id = $1 
      ORDER BY start_timestamp ASC
    `;
    const result = await db.query<any>(query, [batch_id]);
    return result.rows;
  }

  async findCriticalAlerts(batch_id: string): Promise<AlertRow[]> {
    const query = `
      SELECT geo_points, start_timestamp, chart_data 
      FROM trip_geolocations 
      WHERE batch_id = $1 AND is_critical = true 
      ORDER BY start_timestamp ASC
    `;
    const result = await db.query<AlertRow>(query, [batch_id]);
    return result.rows;
  }

  async findGlobalAverage(batch_id: string): Promise<number> {
    const query = `
      SELECT SUM(chunk_sum) / NULLIF(SUM(chunk_count), 0) AS global_avg
      FROM trip_geolocations
      WHERE batch_id = $1
    `;
    const result = await db.query<GlobalAvgRow>(query, [batch_id]);
    return parseFloat(String(result.rows[0]?.global_avg || 0));
  }

  async findFullChart(batch_id: string) {
    const query = `
      SELECT chart_data 
      FROM trip_geolocations 
      WHERE batch_id = $1 
      ORDER BY start_timestamp ASC
    `;
    const result = await db.query<any>(query, [batch_id]);
    return result.rows;
  }

  async findSegmentChart(batch_id: string, parquet_ref: string) {
    const query = `
      SELECT chart_data 
      FROM trip_geolocations 
      WHERE batch_id = $1 AND parquet_ref = $2
    `;
    const result = await db.query<any>(query, [batch_id, parquet_ref]);
    return result.rows;
  }
}

export default new TripRepository();
