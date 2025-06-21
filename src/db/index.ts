import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: postgres.Sql | undefined;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  getConnection(): postgres.Sql {
    if (!this.connection) {
      this.connection = postgres(process.env.DATABASE_URL!, {
        max: 10,
        idle_timeout: 15,
        max_lifetime: 60 * 30,
      });
    }
    return this.connection;
  }
}

const dbConnection = DatabaseConnection.getInstance();
export const db = drizzle(dbConnection.getConnection());
