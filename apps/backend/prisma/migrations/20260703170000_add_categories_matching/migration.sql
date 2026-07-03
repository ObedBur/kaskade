-- Add structured categories for service/provider matching.
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

CREATE TABLE "_CategoryToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX "_CategoryToUser_AB_unique" ON "_CategoryToUser"("A", "B");
CREATE INDEX "_CategoryToUser_B_index" ON "_CategoryToUser"("B");

ALTER TABLE "_CategoryToUser"
ADD CONSTRAINT "_CategoryToUser_A_fkey"
FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_CategoryToUser"
ADD CONSTRAINT "_CategoryToUser_B_fkey"
FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Category" ("id", "slug", "name", "sortOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'ELECTRICITE', 'Electricite', 10, NOW(), NOW()),
  (gen_random_uuid(), 'MENAGE', 'Menage', 20, NOW(), NOW()),
  (gen_random_uuid(), 'ARCHITECTURE', 'Architecture', 30, NOW(), NOW()),
  (gen_random_uuid(), 'TECH', 'Tech', 40, NOW(), NOW()),
  (gen_random_uuid(), 'BIEN_ETRE', 'Bien-etre', 50, NOW(), NOW()),
  (gen_random_uuid(), 'PLOMBERIE', 'Plomberie', 60, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Category" ("id", "slug", "name", "sortOrder", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  UPPER(regexp_replace(translate(trim("category"), 'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ -''', 'AAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiinooooouuuuyy____'), '[^A-Z0-9_]', '', 'g')),
  trim("category"),
  100,
  NOW(),
  NOW()
FROM "Service"
WHERE "category" IS NOT NULL AND trim("category") <> ''
ON CONFLICT ("slug") DO NOTHING;

ALTER TABLE "Service" ADD COLUMN "categoryId" TEXT;

UPDATE "Service" s
SET "categoryId" = c."id"
FROM "Category" c
WHERE c."slug" = UPPER(regexp_replace(translate(trim(s."category"), 'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ -''', 'AAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiinooooouuuuyy____'), '[^A-Z0-9_]', '', 'g'));

UPDATE "Service" s
SET "categoryId" = c."id"
FROM "Category" c
WHERE s."categoryId" IS NULL AND c."slug" = 'TECH';

ALTER TABLE "Service" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Service_categoryId_idx" ON "Service"("categoryId");

INSERT INTO "_CategoryToUser" ("A", "B")
SELECT DISTINCT c."id", u."id"
FROM "User" u
JOIN "Category" c
  ON UPPER(regexp_replace(translate(trim(COALESCE(u."metier", '')), 'ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüýÿ -''', 'AAAAAACEEEEIIIINOOOOOUUUUYaaaaaaceeeeiiiinooooouuuuyy____'), '[^A-Z0-9_]', '', 'g')) IN (c."slug", UPPER(c."name"))
WHERE u."role" = 'PROVIDER'
ON CONFLICT DO NOTHING;

ALTER TABLE "Service" DROP COLUMN "category";
