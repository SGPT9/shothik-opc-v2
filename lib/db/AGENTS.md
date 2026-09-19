# lib/db/AGENTS.md
# Shothik Database & Schema Standards

This document specifies the database ORM conventions and migration guidelines for `@workspace/db`.

---

## 1. Stack & Architecture
- **ORM:** Drizzle ORM with PostgreSQL driver (`pg` / `@neondatabase/serverless`)
- **Schema Location:** `src/schema/`
- **Migrations:** `drizzle.config.ts`

---

## 2. Key Conventions
- All primary keys use `serial("id")` or `text("id").primaryKey()`.
- Financial timestamps require `timestamp("created_at").defaultNow().notNull()`.
- Monetary amounts in BDT must be stored as integers (e.g. Poisha or whole BDT) or `decimal` with explicit precision `numeric(12, 2)`.
