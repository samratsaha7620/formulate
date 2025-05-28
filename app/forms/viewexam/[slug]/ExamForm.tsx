// app/viewexam/[slug]/examForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { submitExamForm } from "@/lib/actions/actions";
import { useRouter } from "next/navigation";

interface ExamFormProps {
  questions: any[];
  examId: string;
  form: any;
}

export default function ExamForm({ questions, examId, form }: ExamFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [userInfoError, setUserInfoError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize timer if exam has time limit (you can add timeLimit to form model later)
  useEffect(() => {
    if (form?.timeLimit && examStarted && !examSubmitted) {
      setTimeRemaining(form.timeLimit * 60); // Convert minutes to seconds
    }
  }, [form?.timeLimit, examStarted, examSubmitted]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examSubmitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleStartExam = () => {
    if (!userInfo.name.trim() || !userInfo.email.trim()) {
      setUserInfoError("Please enter your name and email.");
      return;
    }
    setUserInfoError(null);
    setExamStarted(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Create answer data in the format expected by submitForm
      const answerData = questions.map(question => ({
        questionId: question.id,
        answerText: answers[question.id] || "",
        selectedOptions: answers[question.id] ? [answers[question.id]] : []
      }));

      const result = await submitExamForm(examId, answerData,userInfo);
      if (result && !("error" in result)) {
        setExamSubmitted(true);
        // You can redirect to results page or show success message
        // router.push(`/exam-results/${examId}`);
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: any, index: number) => {
    const questionId = question.id;
    const selectedAnswer = answers[questionId] || "";

    // For exam questions - checkbox type with single selection (4 options)
    return (
      <div key={questionId} className="space-y-3">
        <Label className="text-base font-medium">
          {index + 1}. {question.text}
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <div className="space-y-3">
          {question.options?.map((option: any, optionIndex: number) => (
            <div 
              key={option.id} 
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => !examSubmitted && handleAnswerChange(questionId, option.id)}
            >
              <Checkbox
                id={`${questionId}-${option.id}`}
                checked={selectedAnswer === option.id}
                onCheckedChange={(checked) => {
                  if (!examSubmitted && checked) {
                    handleAnswerChange(questionId, option.id);
                  }
                }}
                disabled={examSubmitted}
              />
              <Label 
                htmlFor={`${questionId}-${option.id}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {String.fromCharCode(65 + optionIndex)}. {option.optionText}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (examSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Exam Submitted Successfully!</h2>
            <p className="text-gray-600">
              Your answers have been recorded. You will be notified of your results soon.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!examStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Enter Your Details to Start Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Your Full Name"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="email"
              placeholder="Your Email Address"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {userInfoError && <p className="text-red-500 text-sm">{userInfoError}</p>}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Once you start the exam, you cannot pause or restart it. Use a valid email; you can only submit once.
            </AlertDescription>
          </Alert>

          <Button onClick={handleStartExam} className="w-full" size="lg">
            Start Exam
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer Display */}
      {timeRemaining !== null && (
        <Card className="sticky top-4 z-10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-mono font-bold">
                Time Remaining: {formatTime(timeRemaining)}
              </span>
            </div>
            {timeRemaining < 300 && ( // Less than 5 minutes
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Less than 5 minutes remaining!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Question Progress</span>
            <span>
              {Object.keys(answers).length} of {questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.keys(answers).length / questions.length) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              {renderQuestion(question, index)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} of {questions.length} questions answered
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Exam"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}