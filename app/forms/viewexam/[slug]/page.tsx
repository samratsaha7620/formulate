// app/viewexam/[slug]/page.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFormFromUser,
  getFormIfPublishedOrIsAuthor,
  getQuestionsFromPublishedFormOrFromAuthor,
  getQuestionsFromUser,
  submitForm,
} from "@/lib/actions/actions";
import Link from "next/link";
import ExamForm from "./ExamForm";
import { notFound } from "next/navigation";
import { FormTitle } from "@/components/formTitle";
import { FormContainer } from "@/components/form-container";

export default async function Page({ params }: { params: { slug: string } }) {
  const examId = params.slug;
  
  // Get questions for exam (using existing functions)
  const questions = await getQuestionsFromPublishedFormOrFromAuthor(examId);

  if (!questions || "error" in questions) {
    notFound();
  }

  // Filter only exam questions
  const examQuestions = questions.filter((q: any) => q.isExamQuestion === true);
  
  if (examQuestions.length === 0) {
    notFound();
  }

  const form = await getFormIfPublishedOrIsAuthor(examId);
  const title = form?.title;

  return (
    <FormContainer>
      <FormTitle title={title} />
      <ExamForm 
        questions={examQuestions} 
        examId={examId}
        form={form}
      />
    </FormContainer>
  );
}