import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { levelHistory, rubricCriteria, studentProfiles, studentRubric } from "@/db/schema";

/** sección 4.5: RN-40 a RN-42 — rúbrica de niveles. */

export async function getRubricProgress(studentId: string, level: "basic" | "intermediate") {
  const criteria = await db
    .select()
    .from(rubricCriteria)
    .where(and(eq(rubricCriteria.levelFrom, level), eq(rubricCriteria.isActive, true)));

  const achieved = await db
    .select()
    .from(studentRubric)
    .where(eq(studentRubric.studentId, studentId));

  const achievedIds = new Set(achieved.filter((a) => a.achievedAt).map((a) => a.criterionId));

  return criteria
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ ...c, achieved: achievedIds.has(c.id) }));
}

/** RN-40: Nico marca un criterio como cumplido; el alumno no lo cambia. */
export async function markCriterion(params: {
  studentId: string;
  criterionId: string;
  markedBy: string;
  achieved: boolean;
}) {
  await db
    .insert(studentRubric)
    .values({
      studentId: params.studentId,
      criterionId: params.criterionId,
      achievedAt: params.achieved ? new Date() : null,
      markedBy: params.markedBy,
    })
    .onConflictDoUpdate({
      target: [studentRubric.studentId, studentRubric.criterionId],
      set: { achievedAt: params.achieved ? new Date() : null, markedBy: params.markedBy },
    });
}

/** RN-42: al completar todos los criterios, dispara el cambio de nivel y queda en el historial. */
export async function maybePromoteLevel(studentId: string) {
  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, studentId));
  if (!profile || profile.level === "advanced") return null;

  const progress = await getRubricProgress(studentId, profile.level as "basic" | "intermediate");
  if (progress.length === 0 || !progress.every((c) => c.achieved)) return null;

  const nextLevel = profile.level === "basic" ? "intermediate" : "advanced";

  await db.transaction(async (tx) => {
    await tx
      .update(studentProfiles)
      .set({ level: nextLevel })
      .where(eq(studentProfiles.userId, studentId));

    await tx.insert(levelHistory).values({
      studentId,
      fromLevel: profile.level,
      toLevel: nextLevel,
      changedBy: null,
    });
  });

  return nextLevel;
}
