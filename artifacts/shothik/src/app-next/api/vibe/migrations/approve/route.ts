import { NextRequest } from "next/server";
import {
  approveAndApplyMigration,
  getMigrationById,
  getPendingMigrations,
} from "@/lib/insforge/migration-safety";

export async function GET() {
  const migrations = getPendingMigrations();
  return Response.json({ data: migrations, success: true });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { migrationId, approvedBy } = body;

    if (!migrationId) {
      return Response.json(
        { error: "migrationId field is required" },
        { status: 400 }
      );
    }

    const existing = getMigrationById(migrationId);
    if (!existing) {
      return Response.json(
        { error: `Migration ${migrationId} not found` },
        { status: 404 }
      );
    }

    const result = await approveAndApplyMigration(
      migrationId,
      approvedBy || "human_operator"
    );

    return Response.json({ data: result.migration, success: true });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to approve database migration" },
      { status: 500 }
    );
  }
}
