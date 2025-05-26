"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { createExam } from "@/lib/actions/actions";
import { useRouter } from "next/navigation";

export default function CreateExam() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctOption: 0,
      },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    if (field === "text") {
      newQuestions[index].text = value;
    } else if (field.startsWith("option")) {
      const optionIndex = parseInt(field.split("-")[1]);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === "correctOption") {
      newQuestions[index].correctOption = parseInt(value);
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      // Validate form data
      if (!title.trim()) {
        throw new Error("Please enter an exam title");
      }

      if (questions.some(q => !q.text.trim())) {
        throw new Error("Please fill in all questions");
      }

      if (questions.some(q => q.options.some(opt => !opt.trim()))) {
        throw new Error("Please fill in all options");
      }

      const examData = {
        title: title.trim(),
        questions: questions.map((q) => ({
          text: q.text.trim(),
          options: q.options.map(opt => opt.trim()),
          correctOption: q.correctOption,
          type: "exam",
        })),
      };

      console.log("Submitting exam data:", examData); // Debug log
      
      const result = await createExam(examData);
      console.log("Exam creation result:", result); // Debug log

      if (result.success) {
        router.push("/forms");
        router.refresh(); // Force refresh to show the new exam
      } else if (result.error) {
        throw new Error(result.error);
      } else {
        throw new Error("Failed to create exam");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create exam. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Create New Exam</h1>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <Label htmlFor="title">Exam Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter exam title"
            required
            disabled={isSubmitting}
          />
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border p-6 rounded-lg space-y-4">
            <div>
              <Label>Question {qIndex + 1}</Label>
              <Input
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                placeholder="Enter question"
                required
                disabled={isSubmitting}
              />
            </div>

            <RadioGroup
              value={question.correctOption.toString()}
              onValueChange={(value) =>
                updateQuestion(qIndex, "correctOption", value)
              }
              disabled={isSubmitting}
            >
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                  <Label htmlFor={`q${qIndex}-o${oIndex}`}>
                    <Input
                      value={option}
                      onChange={(e) =>
                        updateQuestion(qIndex, `option-${oIndex}`, e.target.value)
                      }
                      placeholder={`Option ${oIndex + 1}`}
                      required
                      disabled={isSubmitting}
                    />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <div className="flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={addQuestion}
            disabled={isSubmitting}
          >
            Add Question
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Exam..." : "Create Exam"}
          </Button>
        </div>
      </form>
    </div>
  );
} 