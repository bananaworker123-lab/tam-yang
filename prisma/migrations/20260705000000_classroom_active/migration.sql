-- Add active flag to classrooms so backend can resolve active class without frontend params
ALTER TABLE "assignment"."classrooms" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT false;
