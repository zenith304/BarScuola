-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "cutoffTime" TEXT NOT NULL DEFAULT '10:00',
    "orderingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lifetimeRevenueCents" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Settings" ("cutoffTime", "id", "orderingEnabled") SELECT "cutoffTime", "id", "orderingEnabled" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
