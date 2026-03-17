import { pgTable, serial, text, integer, boolean, unique, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const historialBalotoTable = pgTable("historial_baloto", {
  id: serial("id").primaryKey(),
  fecha: text("fecha").notNull(),
  n1: integer("n1").notNull(),
  n2: integer("n2").notNull(),
  n3: integer("n3").notNull(),
  n4: integer("n4").notNull(),
  n5: integer("n5").notNull(),
  especial: integer("especial").notNull(),
}, (t) => [unique("baloto_fecha_unique").on(t.fecha)]);

export const historialRevanchaTable = pgTable("historial_revancha", {
  id: serial("id").primaryKey(),
  fecha: text("fecha").notNull(),
  n1: integer("n1").notNull(),
  n2: integer("n2").notNull(),
  n3: integer("n3").notNull(),
  n4: integer("n4").notNull(),
  n5: integer("n5").notNull(),
  especial: integer("especial").notNull(),
}, (t) => [unique("revancha_fecha_unique").on(t.fecha)]);

export const historialPowerballTable = pgTable("historial_powerball", {
  id: serial("id").primaryKey(),
  fecha: text("fecha").notNull(),
  n1: integer("n1").notNull(),
  n2: integer("n2").notNull(),
  n3: integer("n3").notNull(),
  n4: integer("n4").notNull(),
  n5: integer("n5").notNull(),
  especial: integer("especial").notNull(),
}, (t) => [unique("powerball_fecha_unique").on(t.fecha)]);

export const prediccionesGuardadasTable = pgTable("predicciones_guardadas", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  fechaGeneracion: text("fecha_generacion").notNull(),
  n1: integer("n1").notNull(),
  n2: integer("n2").notNull(),
  n3: integer("n3").notNull(),
  n4: integer("n4").notNull(),
  n5: integer("n5").notNull(),
  especial: integer("especial").notNull(),
  suma: integer("suma").notNull(),
  metodologia: text("metodologia").notNull().default("Monte Carlo v2.0"),
  fechaSorteo: text("fecha_sorteo"),
  aciertos: integer("aciertos"),
  aciertosEspecial: boolean("aciertos_especial"),
  premio: text("premio"),
});

export const jackpotsTable = pgTable("jackpots", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  fecha: text("fecha").notNull(),
  n1: integer("n1").notNull(),
  n2: integer("n2").notNull(),
  n3: integer("n3").notNull(),
  n4: integer("n4").notNull(),
  n5: integer("n5").notNull(),
  especial: integer("especial").notNull(),
  monto: bigint("monto", { mode: "number" }).notNull().default(0),
  moneda: text("moneda").notNull().default("COP"),
  numGanadores: integer("num_ganadores").notNull().default(1),
  sorteosAcumulados: integer("sorteos_acumulados").notNull().default(0),
  ciudad: text("ciudad"),
  notas: text("notas"),
}, (t) => [unique("jackpot_tipo_fecha_unique").on(t.tipo, t.fecha)]);

export type PrediccionGuardada = typeof prediccionesGuardadasTable.$inferSelect;
export type Jackpot = typeof jackpotsTable.$inferSelect;

export const insertBalotoSchema = createInsertSchema(historialBalotoTable).omit({ id: true });
export const insertRevanchaSchema = createInsertSchema(historialRevanchaTable).omit({ id: true });
export const insertPowerballSchema = createInsertSchema(historialPowerballTable).omit({ id: true });
export const insertJackpotSchema = createInsertSchema(jackpotsTable).omit({ id: true });

export type HistorialBaloto = typeof historialBalotoTable.$inferSelect;
export type HistorialRevancha = typeof historialRevanchaTable.$inferSelect;
export type HistorialPowerball = typeof historialPowerballTable.$inferSelect;
