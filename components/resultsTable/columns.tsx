import { ColumnDef } from "@tanstack/react-table";

export type Result = {
  id: string;
  submittedAt: string;
  score: number | null;
  totalQuestions: number | null;
  percentage: string;
};

export const columns: ColumnDef<Result>[] = [
  {
    accessorKey: "submittedAt",
    header: "Submission Date",
  },
  {
    accessorKey: "score",
    header: "Score",
  },
  {
    accessorKey: "totalQuestions",
    header: "Total Questions",
  },
  {
    accessorKey: "percentage",
    header: "Percentage",
  },
]; 