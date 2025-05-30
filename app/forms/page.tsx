import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "@/app/forms/form";
import { getFormsFromUser } from "@/lib/actions/actions";
import { DataTable } from "@/components/formsTable/data-table";
import { columns } from "@/components/formsTable/columns";
import { format } from "date-fns";
import Link from "next/link";

type Question = {
  type: "text" | "exam";
};

const generateQuestion = (): Question => {
  return {
    type: "text",
  };
};

const renderQuestion = (props: Question) => {
  if (props.type === "text") {
    return <div>text hello</div>;
  }
  return null;
};

export default async function Forms() {
  const formsFromUser = await getFormsFromUser();

  if ("error" in formsFromUser) {
    return null;
  }

  const formsFromUserFormated = formsFromUser.map((element) => {
    return {
      ...element,
      createdAt: format(element.createdAt, "dd/MM/yyyy"),
      updatedAt: format(element.updatedAt, "dd/MM/yyyy"),
      shortId: element.id.substring(0, 8),
    };
  });

  const questions = [generateQuestion()];
  return (
    <div className="my-32 mx-48">
      <div className="flex justify-between items-center mb-8">
        <div className="mt-12">{<Form></Form>}</div>
        <Link href="/forms/create-exam">
          <Button variant="outline" className="mt-12">
            Create New Exam
          </Button>
        </Link>
      </div>
      {<DataTable data={formsFromUserFormated} columns={columns}></DataTable>}
    </div>
  );
}
