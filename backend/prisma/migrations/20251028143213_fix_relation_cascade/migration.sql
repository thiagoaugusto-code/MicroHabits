-- AlterTable
ALTER TABLE "Habit" ADD COLUMN "category" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HabitCompletion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "habitId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HabitCompletion_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_HabitCompletion" ("completedAt", "habitId", "id", "userId") SELECT "completedAt", "habitId", "id", "userId" FROM "HabitCompletion";
DROP TABLE "HabitCompletion";
ALTER TABLE "new_HabitCompletion" RENAME TO "HabitCompletion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
