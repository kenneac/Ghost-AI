import { z } from "zod";

export const aiStatusMessageSchema = z
  .object({
    status: z.enum(["processing", "complete", "error"]).optional(),
    taskType: z.enum(["design", "spec"]).optional(),
    text: z.string().optional(),
  })
  .refine((message) => message.status !== undefined || message.text !== undefined);

export type AiStatusMessage = z.infer<typeof aiStatusMessageSchema>;

export const aiChatMessageSchema = z.object({
  sender: z.string().trim().min(1).max(120),
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
  timestamp: z.number().int().nonnegative(),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;
