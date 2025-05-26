import { getFormResponses } from "@/lib/actions/actions";
import { DataTable } from "@/components/resultsTable/data-table";
import { columns } from "@/components/resultsTable/columns";

export default async function ExamResults({ params }: { params: { formId: string } }) {
  const responses = await getFormResponses(params.formId);

  if ("error" in responses) {
    return <div>Error loading results</div>;
  }

  const formattedResponses = responses.map((response) => ({
    id: response.id,
    submittedAt: new Date(response.submittedAt).toLocaleString(),
    score: response.score,
    totalQuestions: response.totalQuestions,
    percentage: response.score && response.totalQuestions
      ? ((response.score / response.totalQuestions) * 100).toFixed(1) + "%"
      : "N/A",
  }));

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Exam Results</h1>
      <DataTable data={formattedResponses} columns={columns} />
    </div>
  );
} 