import { pgTable, text, serial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: jsonb("content").notNull(), // JSON containing all quiz data including questions
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes).pick({
  title: true,
  description: true,
  content: true,
});

export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;

// Types for the content field (not directly mapped to DB columns)
const questionTypes = [
  'code-order',
  'jigsaw',
  'fill-gaps',
  'multiple-choice',
  'single-choice',
  'fill-whole',
  'text',
  'find-code-errors'
] as const;

export const questionTypeEnum = z.enum(questionTypes);
export type QuestionType = z.infer<typeof questionTypeEnum>;

export const codeOrderBlockSchema = z.object({
  id: z.string(),
  content: z.string(),
  correctPosition: z.number(),
  language: z.string()
});

export const multipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string().optional()
});

export const codeGapSchema = z.object({
  id: z.string(),
  position: z.number(),
  answer: z.string()
});

export const codeErrorLineSchema = z.object({
  lineNumber: z.number(),
  code: z.string()
});

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(questionTypeEnum),
  title: z.string(),
  explanation: z.string().optional(),
  order: z.number(),
  timeLimit: z.number().nullable().optional(), // Time limit in seconds for this specific question (null = no limit)
  hideSolution: z.boolean().optional(), // If true, students cannot view the solution
  
  // Type-specific optional properties
  codeBlocks: z.array(codeOrderBlockSchema).optional(),
  options: z.array(multipleChoiceOptionSchema).optional(),
  codeExample: z.string().optional(),
  
  // Find Code Errors specific properties
  codeWithErrors: z.string().optional(),
  correctCode: z.string().optional(),
  errorDescriptions: z.array(z.string()).optional(),
  
  codeWithGaps: z.string().optional(),
  gaps: z.array(codeGapSchema).optional(),
  availableSnippets: z.array(z.string()).optional(),
  
  code: z.string().optional(),
  errorLines: z.array(codeErrorLineSchema).optional(),
  errors: z.array(z.string()).optional(),
  
  // For fill-whole type
  codePrefix: z.string().optional(),
  codeSuffix: z.string().optional(),
  solutionCode: z.string().optional(),
  
  // For text question types
  textAnswer: z.string().optional(),      // Expected answer for text questions
  isMarkdown: z.boolean().optional(),     // Whether to enable markdown/code formatting in answers
  supportCodeBlocks: z.boolean().optional(), // Whether code blocks should be supported in the editor
  minLength: z.number().optional(),       // Minimum character length for answers
  maxLength: z.number().optional(),       // Maximum character length for answers
  
  language: z.string().optional(),
  hintComment: z.string().optional()
});

export const quizContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(questionSchema),
  timeLimit: z.number().nullable().optional() // Overall quiz time limit in seconds (null = no limit)
});

export type QuizContent = z.infer<typeof quizContentSchema>;
export type Question = z.infer<typeof questionSchema>;
export type CodeOrderBlock = z.infer<typeof codeOrderBlockSchema>;
export type MultipleChoiceOption = z.infer<typeof multipleChoiceOptionSchema>;
export type CodeGap = z.infer<typeof codeGapSchema>;
export type CodeErrorLine = z.infer<typeof codeErrorLineSchema>;
