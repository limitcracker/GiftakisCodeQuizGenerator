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
export const questionTypeEnum = z.enum([
  'code-order',
  'jigsaw',
  'fill-gaps',
  'multiple-choice',
  'single-choice',
  'find-errors',
  'image-choice',
  'video-choice'
]);

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
  type: questionTypeEnum,
  title: z.string(),
  explanation: z.string().optional(),
  order: z.number(),
  
  // Type-specific optional properties
  codeBlocks: z.array(codeOrderBlockSchema).optional(),
  options: z.array(multipleChoiceOptionSchema).optional(),
  codeExample: z.string().optional(),
  
  codeWithGaps: z.string().optional(),
  gaps: z.array(codeGapSchema).optional(),
  availableSnippets: z.array(z.string()).optional(),
  
  code: z.string().optional(),
  errorLines: z.array(codeErrorLineSchema).optional(),
  errors: z.array(z.string()).optional()
});

export const quizContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(questionSchema)
});

export type QuizContent = z.infer<typeof quizContentSchema>;
export type Question = z.infer<typeof questionSchema>;
export type CodeOrderBlock = z.infer<typeof codeOrderBlockSchema>;
export type MultipleChoiceOption = z.infer<typeof multipleChoiceOptionSchema>;
export type CodeGap = z.infer<typeof codeGapSchema>;
export type CodeErrorLine = z.infer<typeof codeErrorLineSchema>;
