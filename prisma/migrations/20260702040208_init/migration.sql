-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "assignment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "family";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "progress";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "requests_audit";

-- CreateEnum
CREATE TYPE "family"."FamilyRole" AS ENUM ('parent', 'child');

-- CreateEnum
CREATE TYPE "family"."InviteStatus" AS ENUM ('pending', 'accepted');

-- CreateEnum
CREATE TYPE "progress"."ProgressStatus" AS ENUM ('not_started', 'done', 'submitted');

-- CreateEnum
CREATE TYPE "requests_audit"."RequestStatus" AS ENUM ('pending', 'resolved', 'rejected');

-- CreateTable
CREATE TABLE "identity"."users" (
    "id" UUID NOT NULL,
    "google_sub" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture_url" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family"."families" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family"."memberships" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "family"."FamilyRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family"."invites" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "family"."FamilyRole" NOT NULL,
    "token" TEXT NOT NULL,
    "status" "family"."InviteStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment"."classrooms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" UUID,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment"."terms" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment"."master_assignments" (
    "id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher_name" TEXT NOT NULL,
    "class_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "assigned_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment"."teacher_assignments" (
    "id" UUID NOT NULL,
    "teacher_user_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress"."progress" (
    "id" UUID NOT NULL,
    "child_user_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "school_id" UUID,
    "status" "progress"."ProgressStatus" NOT NULL DEFAULT 'not_started',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests_audit"."requests" (
    "id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "assignment_id" UUID,
    "detail" TEXT NOT NULL,
    "status" "requests_audit"."RequestStatus" NOT NULL DEFAULT 'pending',
    "reply" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests_audit"."audit_entries" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "actor_user_id" UUID NOT NULL,
    "actor_role" TEXT NOT NULL,
    "child_user_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "from_status" TEXT NOT NULL,
    "to_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_sub_key" ON "identity"."users"("google_sub");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "identity"."users"("email");

-- CreateIndex
CREATE INDEX "memberships_family_id_idx" ON "family"."memberships"("family_id");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "family"."memberships"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_family_id_user_id_key" ON "family"."memberships"("family_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "family"."invites"("token");

-- CreateIndex
CREATE INDEX "invites_email_idx" ON "family"."invites"("email");

-- CreateIndex
CREATE INDEX "master_assignments_class_id_idx" ON "assignment"."master_assignments"("class_id");

-- CreateIndex
CREATE INDEX "master_assignments_term_id_idx" ON "assignment"."master_assignments"("term_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_teacher_user_id_idx" ON "assignment"."teacher_assignments"("teacher_user_id");

-- CreateIndex
CREATE INDEX "teacher_assignments_class_id_idx" ON "assignment"."teacher_assignments"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_assignments_teacher_user_id_class_id_key" ON "assignment"."teacher_assignments"("teacher_user_id", "class_id");

-- CreateIndex
CREATE INDEX "progress_family_id_idx" ON "progress"."progress"("family_id");

-- CreateIndex
CREATE INDEX "progress_child_user_id_idx" ON "progress"."progress"("child_user_id");

-- CreateIndex
CREATE INDEX "progress_assignment_id_idx" ON "progress"."progress"("assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_child_user_id_assignment_id_key" ON "progress"."progress"("child_user_id", "assignment_id");

-- CreateIndex
CREATE INDEX "requests_created_by_idx" ON "requests_audit"."requests"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "audit_entries_event_id_key" ON "requests_audit"."audit_entries"("event_id");

-- CreateIndex
CREATE INDEX "audit_entries_created_at_idx" ON "requests_audit"."audit_entries"("created_at");

-- CreateIndex
CREATE INDEX "audit_entries_actor_user_id_idx" ON "requests_audit"."audit_entries"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_entries_child_user_id_idx" ON "requests_audit"."audit_entries"("child_user_id");

-- AddForeignKey
ALTER TABLE "family"."memberships" ADD CONSTRAINT "memberships_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family"."memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family"."invites" ADD CONSTRAINT "invites_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"."families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment"."master_assignments" ADD CONSTRAINT "master_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "assignment"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment"."master_assignments" ADD CONSTRAINT "master_assignments_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "assignment"."terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_user_id_fkey" FOREIGN KEY ("teacher_user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "assignment"."classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress"."progress" ADD CONSTRAINT "progress_child_user_id_fkey" FOREIGN KEY ("child_user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress"."progress" ADD CONSTRAINT "progress_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"."master_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
