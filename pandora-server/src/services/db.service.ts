import { DatabaseService } from "./db/index";

export const db = DatabaseService.factory();
export { DBTypes as ISql } from "./db";
