"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type AnswersWithQuestionOptionAndResponse = Prisma.AnswerGetPayload<{
  include: { question: true; options: true; response: true };
}>;

export const createForm = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.create({
    data: {
      userId: session.user.id,
      title: "",
    },
  });

  return response;
};

export const updateFormFromUser = async (formId: string, title: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.update({
    where: {
      id: formId,
      userId: session.user.id,
    },
    data: {
      title,
    },
  });
  revalidatePath(`forms/${formId}`);
  return response;
};

export const updateQuestionFromUser = async (
  formId: string,
  questionId: string,
  placeholder: string | null,
  text: string | null
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  if (text !== null && placeholder !== null) {
    const response = await prisma.question.update({
      where: {
        formId,
        id: questionId,
        userId: session.user.id,
      },
      data: {
        text,
        placeholder,
      },
    });
    revalidatePath(`forms/${formId}`);
    return response;
  } else if (text !== null) {
    const response = await prisma.question.update({
      where: {
        formId,
        id: questionId,
        userId: session.user.id,
      },
      data: {
        text,
      },
    });
    revalidatePath(`forms/${formId}`);
    return response;
  } else if (placeholder !== null) {
    const response = await prisma.question.update({
      where: {
        formId,
        id: questionId,
        userId: session.user.id,
      },
      data: {
        placeholder,
      },
    });
    revalidatePath(`forms/${formId}`);
    return response;
  }
};

export const getFormsFromUser = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return response;
};

export const getFormFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const response = await prisma.form.findFirst({
    where: {
      userId: session.user.id,
      id: formId,
    },
  });

  return response;
};

export const getQuestionsFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const formFromUser = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!formFromUser) {
    return {
      error: "Form does not exist",
    };
  }

  if (formFromUser.userId !== session.user.id) {
    return {
      error: "Form is not from user",
    };
  }

  const response = await prisma.question.findMany({
    where: {
      formId: formFromUser.id,
      userId: session.user.id,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return response;
};

export const updateOptionText = async (
  optionText: string,
  optionId: string,
  questionId: string,
  formId: string
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  await prisma.question.findFirstOrThrow({
    where: {
      userId: session.user.id,
      id: questionId,
      formId,
    },
  });

  await prisma.option.update({
    where: {
      id: optionId,
    },
    data: {
      optionText,
    },
  });

  revalidatePath(`forms/${formId}`);
  return;
};

export const deleteQuestion = async (formId: string, questionId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const formFromUser = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!formFromUser) {
    return {
      error: "Form does not exist",
    };
  }

  const questionToDelete = await prisma.question.findFirst({
    where: {
      id: questionId,
    },
  });

  if (!questionToDelete) {
    return {
      error: "Question does not exist",
    };
  }

  if (questionToDelete.formId != formId) {
    return {
      error: "Given questionId is not from the given form Id",
    };
  }

  await prisma.option.deleteMany({
    where: {
      questionId: questionId,
    },
  });

  const questions = await prisma.question.findMany({
    where: {
      formId,
      order: {
        gte: questionToDelete.order,
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  const updateOperations = questions.map((question) => {
    const newOrder = question.order - 1;
    return prisma.question.update({
      where: { id: question.id, formId },
      data: { order: newOrder },
    });
  });


  const deleteFunction = prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  updateOperations.push(deleteFunction);

  await prisma.$transaction(updateOperations);

  revalidatePath(`forms/${formId}`);

  return;
};

export const togglePublishFormFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const form = await prisma.form.findFirstOrThrow({
    where: {
      id: formId,
      userId: session.user.id,
    },
  });

  const response = await prisma.form.update({
    where: {
      id: formId,
      userId: session.user.id,
    },
    data: {
      published: !form.published,
    },
  });

  revalidatePath(`/forms/${formId}`);
  return response;
};

export const getFormIfPublishedOrIsAuthor = async (formId: string) => {
  const session = await getSession();

  let isTheAuthor = false;

  const form = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!form) {
    redirect("/forms/e");
  }

  if (form.userId === session?.user.id) {
    isTheAuthor = true;
  }

  if (!isTheAuthor && !form.published) {
    redirect("/forms/e");
  }

  return form;
};

interface InputValueType {
  type: "SHORT_RESPONSE" | "SELECT_ONE_OPTION" | "SELECT_MULTIPLE_OPTIONS";
  text: string | null;
  optionId: string | null;
  optionIds: string[] | null;
}

interface OutputType {
  answerText: string | null;
  questionId: string;
  type: "SHORT_RESPONSE" | "SELECT_ONE_OPTION" | "SELECT_MULTIPLE_OPTIONS";
  optionId: string | null;
  optionIds: string[] | null;
}

function transform(obj: Record<string, InputValueType>): OutputType[] {
  const result: OutputType[] = [];
  for (let key in obj) {
    if (obj[key].type === "SHORT_RESPONSE") {
      result.push({
        answerText: obj[key].text,
        questionId: key,
        type: "SHORT_RESPONSE",
        optionId: null,
        optionIds: null,
      });
    } else if (obj[key].type === "SELECT_ONE_OPTION") {
      result.push({
        answerText: null,
        questionId: key,
        optionId: obj[key].optionId,
        type: "SELECT_ONE_OPTION",
        optionIds: null,
      });
    } else if (obj[key].type === "SELECT_MULTIPLE_OPTIONS") {
      result.push({
        answerText: null,
        questionId: key,
        optionIds: obj[key].optionIds,
        type: "SELECT_MULTIPLE_OPTIONS",
        optionId: null,
      });
    }
  }

  return result;
}

export const submitForm = async (answersHash: any, formId: string) => {
  const answers = transform(answersHash);

  const form = await prisma.form.findFirstOrThrow({
    where: {
      id: formId,
    },
  });

  answers.map(async (answer) => {
    const question = await prisma.question.findFirstOrThrow({
      where: {
        id: answer.questionId,
      },
    });

    if (question.formId !== form.id) {
      throw new Error();
    }
    return answer;
  });

  const response = await prisma.response.create({
    data: {
      submittedAt: new Date().toISOString(),
    },
  });

  const createAnswerOperations = answers.map((answer) => {
    if (answer.type === "SHORT_RESPONSE") {
      return prisma.answer.create({
        data: {
          answerText: answer.answerText!,
          questionId: answer.questionId,
          formId: form.id,
          responseId: response.id,
        },
      });
    } else if (answer.type === "SELECT_ONE_OPTION") {
      return prisma.answer.create({
        data: {
          answerText: "",
          questionId: answer.questionId,
          formId: form.id,
          responseId: response.id,
          options: {
            connect: {
              id: answer.optionId!,
            },
          },
        },
      });
    } else if (answer.type === "SELECT_MULTIPLE_OPTIONS") {
      const connectAnswers = answer.optionIds!.map((option: string) => {
        return { id: option };
      });
      return prisma.answer.create({
        data: {
          answerText: "",
          questionId: answer.questionId,
          formId: form.id,
          responseId: response.id,
          options: {
            connect: [...connectAnswers],
          },
        },
      });
    } else {
      throw new Error("Not valid type");
    }
  });

  await prisma.$transaction(createAnswerOperations);

  return;
};

export const getResponsesSummaryFromUser = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const questions = await prisma.question.findMany({
    where: {
      formId: formId,
      userId: session.user.id,
    },
    include: {
      options: true,
      answers: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          options: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return questions;
};

export const checkIfUserIsLoggedIn = async () => {
  const session = await getSession();
  if (!session?.user.id) {
    return false;
  }
  return true;
};

export const getQuestionsFromPublishedFormOrFromAuthor = async (
  formId: string
) => {
  const session = await getSession();

  let isTheAuthor = false;
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
    },
  });

  if (!form) {
    return {
      error: "Form does not exist",
    };
  }

  if (form.userId === session?.user.id) {
    isTheAuthor = true;
  }

  if (!isTheAuthor && !form.published) {
    return {
      error: "Form is not published",
    };
  }

  const response = await prisma.question.findMany({
    where: {
      formId: form.id,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      options: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return response;
};

export const getResponsesFromForm = async (formId: string) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }

  const answers = await prisma.answer.findMany({
    where: {
      formId: formId,
      question: {
        userId: session.user.id,
      },
    },
    include: {
      question: true,
      options: true,
      response: true,
    },
  });

  const questions = await prisma.question.findMany({
    where: {
      formId: formId,
    },
    orderBy: {
      order: "asc",
    },
  });

  const questionNames = questions.map((question) => {
    return question.text;
  });

  const totalQuestions = questions.length;

  type GroupedResponses = {
    [key: string]: AnswersWithQuestionOptionAndResponse[];
  };

  const groupedByResponses: GroupedResponses = answers.reduce(
    (acc: GroupedResponses, answer: AnswersWithQuestionOptionAndResponse) => {
      const responseId = answer.responseId;
      if (!acc[responseId]) {
        acc[responseId] = [];
      }
      acc[responseId].push(answer);
      return acc;
    },
    {}
  );

  const formattedResponses: string[][] = Object.values(groupedByResponses).map(
    (answersForResponse: AnswersWithQuestionOptionAndResponse[]) => {
      const sortedAnswers = answersForResponse.sort(
        (a, b) => a.question.order - b.question.order
      );

      const answersArray: string[] = new Array(totalQuestions).fill("");

      sortedAnswers.forEach((answer) => {
        const index = answer.question.order - 1;
        answersArray[index] =
          answer.question.type === "SELECT_ONE_OPTION"
            ? answer.options && answer.options.length === 1
              ? answer.options[0].optionText
              : ""
            : answer.answerText;
      });

      return answersArray;
    }
  );

  return [questionNames].concat(formattedResponses);
};

// export async function createExam(examData: {
//   title: string;
//   questions: {
//     text: string;
//     options: string[];
//     correctOption: number;
//     type: string;
//   }[];
// }) {
//   console.log("Received exam data:", examData); // Debug log

//   if (!examData) {
//     throw new Error("No exam data provided");
//   }

//   if (typeof examData !== 'object') {
//     throw new Error("Invalid exam data format");
//   }

//   if (!examData.title || typeof examData.title !== 'string') {
//     throw new Error("Invalid or missing exam title");
//   }

//   if (!Array.isArray(examData.questions)) {
//     throw new Error("Questions must be an array");
//   }

//   if (examData.questions.length === 0) {
//     throw new Error("At least one question is required");
//   }

//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       throw new Error("Not authenticated");
//     }

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Validate each question
//     for (const question of examData.questions) {
//       if (!question.text || typeof question.text !== 'string') {
//         throw new Error("Invalid question text");
//       }
//       if (!Array.isArray(question.options) || question.options.length !== 4) {
//         throw new Error("Each question must have exactly 4 options");
//       }
//       if (typeof question.correctOption !== 'number' || question.correctOption < 0 || question.correctOption > 3) {
//         throw new Error("Invalid correct option index");
//       }
//       if (question.type !== 'exam') {
//         throw new Error("Invalid question type");
//       }
//     }

//     console.log("Creating exam with validated data"); // Debug log

//     const form = await prisma.form.create({
//       data: {
//         title: examData.title,
//         userId: user.id,
//         published: true,
//         questions: {
//           create: examData.questions.map((q, index) => ({
//             text: q.text,
//             type: q.type,
//             order: index,
//             userId: user.id,
//             isExamQuestion: true,
//             options: {
//               create: q.options.map((opt, optIndex) => ({
//                 optionText: opt,
//                 order: optIndex,
//                 isCorrect: optIndex === q.correctOption,
//               })),
//             },
//           })),
//         },
//       },
//       include: {
//         questions: {
//           include: {
//             options: true,
//           },
//         },
//       },
//     });

//     console.log("Exam created successfully:", form); // Debug log
//     return form;
//   } catch (error) {
//     console.error("Error in createExam:", error);
//     throw error;
//   }
// }

export async function createExam(examData: {
  title: string;
  questions: {
    text: string;
    options: string[];
    correctOption: number;
    type: string;
  }[];
}) {
  console.log("Received exam data:", examData); // Debug log

  if (!examData) {
    throw new Error("No exam data provided");
  }

  if (typeof examData !== 'object') {
    throw new Error("Invalid exam data format");
  }

  if (!examData.title || typeof examData.title !== 'string') {
    throw new Error("Invalid or missing exam title");
  }

  if (!Array.isArray(examData.questions)) {
    throw new Error("Questions must be an array");
  }

  if (examData.questions.length === 0) {
    throw new Error("At least one question is required");
  }

  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate each question
    for (const question of examData.questions) {
      if (!question.text || typeof question.text !== 'string') {
        throw new Error("Invalid question text");
      }
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        throw new Error("Each question must have exactly 4 options");
      }
      if (typeof question.correctOption !== 'number' || question.correctOption < 0 || question.correctOption > 3) {
        throw new Error("Invalid correct option index");
      }
      if (question.type !== 'exam') {
        throw new Error("Invalid question type");
      }
    }

    console.log("Creating exam with validated data"); // Debug log

    const form = await prisma.$transaction(async (tx) => {
      const createdForm = await tx.form.create({
        data: {
          title: examData.title,
          userId: user.id,
          published: true,
          questions: {
            create: examData.questions.map((q, index) => ({
              text: q.text,
              type: q.type,
              order: index,
              userId: user.id,
              isExamQuestion: true,
              // FIXED: Set correctOptionId properly
              options: {
                create: q.options.map((opt, optIndex) => ({
                  optionText: opt,
                  order: optIndex,
                })),
              },
            })),
          },
        },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });

      // FIXED: Update correctOptionId after options are created
      for (let i = 0; i < createdForm.questions.length; i++) {
        const question = createdForm.questions[i];
        const correctOption = question.options[examData.questions[i].correctOption];
        
        await tx.question.update({
          where: { id: question.id },
          data: { correctOptionId: correctOption.id },
        });
      }

      // FIXED: Return the created form from transaction
      return await tx.form.findUnique({
        where: { id: createdForm.id },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
    });

    console.log("Exam created successfully:", form?.id);
    revalidatePath('/forms');
    return { success: true, form };
    
  } catch (error) {
    console.error("Error in createExam:", error);
    return { 
      success: false, // FIXED: Added success flag for consistency
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  } 
}

export async function updateExamCorrectOption(questionId: string, correctOptionId: string) {
  try {
    // Get authenticated user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the question belongs to the user and is an exam question
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        userId: user.id,
        isExamQuestion: true,
      },
      include: {
        options: true,
      },
    });

    if (!question) {
      throw new Error("Question not found or not authorized");
    }

    // Verify the option belongs to this question
    const option = question.options.find(opt => opt.id === correctOptionId);
    if (!option) {
      throw new Error("Option not found for this question");
    }

    // Update the correct option
    await prisma.question.update({
      where: { id: questionId },
      data: { correctOptionId },
    });

    revalidatePath('/forms');
    return { success: true };
    
  } catch (error) {
    console.error("Error updating correct option:", error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}


export async function submitFormResponse(formId: string, answers: { questionId: string; answerText: string; selectedOptionIds: string[] }[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    // Calculate score for exam questions
    let score = 0;
    let totalExamQuestions = 0;

    const examQuestions = form.questions.filter(q => q.isExamQuestion);
    totalExamQuestions = examQuestions.length;

    for (const answer of answers) {
      const question = form.questions.find(q => q.id === answer.questionId);
      if (question?.isExamQuestion) {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption && answer.selectedOptionIds.includes(correctOption.id)) {
          score++;
        }
      }
    }

    const response = await prisma.response.create({
      data: {
        submittedAt: new Date(),
        score: totalExamQuestions > 0 ? score : null,
        totalQuestions: totalExamQuestions > 0 ? totalExamQuestions : null,
        answers: {
          create: answers.map((answer) => ({
            answerText: answer.answerText,
            questionId: answer.questionId,
            formId: formId,
            selectedOptionIds: answer.selectedOptionIds,
            isCorrect: form.questions.find(q => q.id === answer.questionId)?.isExamQuestion
              ? answer.selectedOptionIds.includes(
                  form.questions
                    .find(q => q.id === answer.questionId)
                    ?.options.find(opt => opt.isCorrect)?.id || ""
                )
              : null,
          })),
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Error submitting form response:", error);
    throw error;
  }
}

export async function getFormResponses(formId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    // Check if user is the form creator
    if (form.userId !== user.id) {
      throw new Error("Not authorized to view responses");
    }

    const responses = await prisma.response.findMany({
      where: {
        answers: {
          some: {
            formId: formId,
          },
        },
      },
      include: {
        answers: {
          include: {
            question: true,
            options: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return responses;
  } catch (error) {
    console.error("Error getting form responses:", error);
    return { error: "Failed to get form responses" };
  }
}