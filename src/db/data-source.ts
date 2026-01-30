import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Session } from "./entities/Session";
import { Explanation } from "./entities/Explanation";
import { SavedExplanation } from "./entities/SavedExplanation";
import { UserSettings } from "./entities/UserSettings";

let AppDataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "data/explainit.db",
    entities: [User, Session, Explanation, SavedExplanation, UserSettings],
    synchronize: true,
    logging: process.env.NODE_ENV === "development",
  });

  await AppDataSource.initialize();
  return AppDataSource;
}

export { AppDataSource };
