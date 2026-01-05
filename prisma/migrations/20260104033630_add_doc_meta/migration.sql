-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main-room',
    "title" TEXT NOT NULL DEFAULT 'Untitled Deal',
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "hash" TEXT NOT NULL DEFAULT 'genesis',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Document" ("content", "id", "updatedAt") SELECT "content", "id", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
