import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuizSchema, quizContentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all quizzes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getAllQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // GET a single quiz by ID
  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // POST a new quiz
  app.post("/api/quizzes", async (req, res) => {
    try {
      // Validate the request body
      const validatedData = insertQuizSchema.parse(req.body);
      
      // Validate the content field with the quiz content schema
      const validatedContent = quizContentSchema.parse(JSON.parse(validatedData.content as string));
      
      // Create the quiz
      const quiz = await storage.createQuiz({
        ...validatedData,
        content: JSON.stringify(validatedContent) // Store as a JSON string
      });
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // PUT (update) an existing quiz
  app.put("/api/quizzes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if the quiz exists
      const existingQuiz = await storage.getQuiz(id);
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Validate the request body
      const validatedData = insertQuizSchema.parse(req.body);
      
      // Validate the content field with the quiz content schema
      const validatedContent = quizContentSchema.parse(JSON.parse(validatedData.content as string));
      
      // Update the quiz
      const updatedQuiz = await storage.updateQuiz(id, {
        ...validatedData,
        content: JSON.stringify(validatedContent) // Store as a JSON string
      });
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // DELETE a quiz
  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if the quiz exists
      const existingQuiz = await storage.getQuiz(id);
      if (!existingQuiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      await storage.deleteQuiz(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
