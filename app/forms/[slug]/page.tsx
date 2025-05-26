import {
  deleteQuestion,
  getFormFromUser,
  getQuestionsFromUser,
  togglePublishFormFromUser,
  updateOptionText,
  updateExamCorrectOption
} from "@/lib/actions/actions";

import {
  createShortResponseQuestion,
  createOptionQuestion,
  createMultipleOptionQuestion,
} from "@/lib/actions/questions/create";

import { headers } from "next/headers";

import QuestionForm from "./form";
import { notFound } from "next/navigation";
import { createOption } from "@/lib/actions/options/create";
import { deleteOption } from "@/lib/actions/options/delete";
import ExamForm from "./ExamForm";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug; 

  if (!slug) {
    notFound();
  }
  const questions = await getQuestionsFromUser(slug);

  const headersList = await headers();

  const host = headersList.get("host") || "";

  if ("error" in questions) {
    notFound();
  }

  const form = await getFormFromUser(slug);

  if (form === null || "error" in form) {
    notFound();
  }

  const isExamForm = questions.length > 0 && questions.every(q => q.isExamQuestion === true);

  if (isExamForm) {
    return (
      <ExamForm
        questions={questions}
        form={form}
        host={host}
        formId={form.id}
        title={form.title}
        togglePublishFormFromUser={togglePublishFormFromUser}
        deleteQuestion={deleteQuestion}
        updateExamCorrectOption={updateExamCorrectOption}
      />
    );
  }
  return (
    <>
      {
        <QuestionForm
          questions={questions}
          createShortResponseQuestion={createShortResponseQuestion}
          deleteQuestion={deleteQuestion}
          togglePublishFormFromUser={togglePublishFormFromUser}
          form={form}
          createOptionQuestion={createOptionQuestion}
          updateOptionText={updateOptionText}
          createOption={createOption}
          deleteOption={deleteOption}
          host={host}
          createMultipleOptionQuestion={createMultipleOptionQuestion} formId={form.id} 
          title={form.title}        />
      }
    </>
  );
}