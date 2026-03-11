import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

const useGateway = !!process.env.AI_GATEWAY_API_KEY;

const gatewayConfig = useGateway
  ? { baseURL: "https://ai-gateway.vercel.sh", apiKey: process.env.AI_GATEWAY_API_KEY }
  : {};

export const anthropic = createAnthropic({ ...gatewayConfig });

export const openai = createOpenAI({ ...gatewayConfig });
