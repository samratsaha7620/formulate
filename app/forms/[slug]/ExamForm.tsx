"use client";

import { useDebouncedCallback } from "use-debounce";
import { MoveLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  updateFormFromUser,
  updateOptionText,
  updateQuestionFromUser,
} from "@/lib/actions/actions";

import { type Form, type Question, Prisma, type Option } from "@prisma/client";
import EditableFormTitle from "@/components/ui/editable-form-title";
import EditableQuestionText from "@/components/ui/editable-question-text";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { FormContainer } from "@/components/form-container";
import { Badge } from "@/components/ui/badge";

type QuestionWithOptions = Prisma.QuestionGetPayload<{
  include: {
    options: true;
  };
}>;

export default function ExamForm({
  questions,
  form,
  host,
  formId,
  title,
  togglePublishFormFromUser,
  deleteQuestion,
  updateExamCorrectOption,
}: {
  formId: string;
  questions: QuestionWithOptions[];
  title: string;
  form: Form;
  host: string;
  togglePublishFormFromUser: any;
  deleteQuestion: any;
  updateExamCorrectOption?: (questionId: string, correctOptionId: string) => Promise<void>;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const debounced = useDebouncedCallback((questionId, placeholder, text) => {
    updateQuestionFromUser(formId, questionId, placeholder, text);
  }, 300);

  const formTitleDebounced = useDebouncedCallback(
    (formId: string, title: string) => {
      updateFormFromUser(formId, title);
    },
    300
  );

  // Sort questions by order
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  return (
    <div className="">
      <div className="my-10">
        {form.published ? null : (
          <Link href={`/forms`}>
            <div className="flex items-center">
              <MoveLeft
                className="mr-2"
                color="#000000"
                strokeWidth={1.75}
                absoluteStrokeWidth
                size={18}
              />
              {"Back to my forms"}
            </div>
          </Link>
        )}
      </div>

      <FormContainer>
        <div className="flex items-center justify-between mb-4">
          <EditableFormTitle
            value={title}
            formTitleDebounced={formTitleDebounced}
            formId={formId}
          />
          <Badge variant="secondary" className="ml-4">
            EXAM
          </Badge>
        </div>

        <div className="mt-4">
          <Link href={`/forms/viewform/${formId}`} target="_blank">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Preview
            </Button>
          </Link>

          <Button
            type="button"
            size="sm"
            className="mt-2 ml-2"
            onClick={async () => {
              await togglePublishFormFromUser(formId);
            }}
          >
            {form.published ? "Unpublish" : "Publish"}
          </Button>

          {form.published ? (
            <div>
              <Button
                type="button"
                size="sm"
                className="mt-8"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${host}/exam/${formId}`
                  );
                  toast({
                    title: "Exam link successfully copied",
                  });
                }}
              >
                Copy Exam Link
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-8 ml-2"
                onClick={() => {
                  router.push(`/exam/${formId}`);
                }}
              >
                Take Exam
              </Button>
            </div>
          ) : null}
        </div>

        <div className="mt-12">
          {sortedQuestions.map((question: QuestionWithOptions, index: number) => (
            <div key={question.id} className="mb-8 group relative border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {index + 1}
                </span>
                <Badge variant="outline" className="text-xs">
                  {question.options.find(opt => opt.id === question.correctOptionId)
                    ? `Correct: Option ${question.options
                        .sort((a, b) => a.order - b.order)
                        .findIndex(opt => opt.id === question.correctOptionId) + 1}`
                    : "No correct answer set"}
                </Badge>
              </div>

              <EditableQuestionText
                value={question.text}
                questionTextandPlaceholderDebounced={debounced}
                questionId={question.id}
              />

              <ExamQuestionOptions
                options={question.options}
                formId={formId}
                questionId={question.id}
                correctOptionId={question.correctOptionId}
                updateExamCorrectOption={updateExamCorrectOption}
              />

              <div className="absolute top-2 right-2 hidden group-hover:inline-flex">
                <div
                  className="px-2 hover:cursor-pointer"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this question?")) {
                      await deleteQuestion(formId, question.id);
                    }
                  }}
                >
                  <Trash2 className="text-gray-700" size={16} />
                </div>
              </div>
            </div>
          ))}

          {sortedQuestions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No exam questions found.</p>
              <p className="text-sm mt-2">
                Create exam questions using the "Create New Exam" page.
              </p>
            </div>
          )}
        </div>
      </FormContainer>
    </div>
  );
}

const ExamQuestionOptions = ({
  options,
  formId,
  questionId,
  correctOptionId,
  updateExamCorrectOption,
}: {
  options: Option[];
  formId: string;
  questionId: string;
  correctOptionId?: string;
  updateExamCorrectOption?: (questionId: string, correctOptionId: string) => Promise<void>;
}) => {
  const debounced = useDebouncedCallback((optionText, optionId) => {
    updateOptionText(optionText, optionId, questionId, formId);
  }, 500);

  const handleCorrectOptionChange = async (optionId: string) => {
    if (updateExamCorrectOption) {
      try {
        await updateExamCorrectOption(questionId, optionId);
        toast({
          title: "Correct answer updated",
        });
      } catch (error) {
        toast({
          title: "Error updating correct answer",
          variant: "destructive",
        });
      }
    }
  };

  if (!options || options.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>No options available for this question.</p>
      </div>
    );
  }

  // Sort options by order and ensure exactly 4 options
  const sortedOptions = [...options].sort((a, b) => a.order - b.order);

  return (
    <div className="mt-4">
      <p className="text-sm text-gray-600 mb-3">
        Click the radio button to mark the correct answer:
      </p>
      <RadioGroup
        value={correctOptionId || ""}
        onValueChange={handleCorrectOptionChange}
      >
        {sortedOptions.map((option: Option, index: number) => {
          const isCorrect = option.id === correctOptionId;
          return (
            <div
              key={option.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                isCorrect 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } relative group`}
            >
              <RadioGroupItem 
                value={option.id} 
                id={option.id}
                className={isCorrect ? 'border-green-500 text-green-500' : ''}
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    defaultValue={option.optionText}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="border-0 shadow-none focus-visible:ring-0 pl-0 bg-transparent"
                    onChange={(e) => debounced(e.target.value, option.id)}
                  />
                </div>
              </div>
              {isCorrect && (
                <Badge variant="default" className="text-xs">
                  Correct Answer
                </Badge>
              )}
            </div>
          );
        })}
      </RadioGroup>
      
      {sortedOptions.length !== 4 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ This exam question should have exactly 4 options, but currently has {sortedOptions.length}.
          </p>
        </div>
      )}
    </div>
  );
};