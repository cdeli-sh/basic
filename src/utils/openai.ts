import OpenAI from "openai";


export default class OpenAi {
  private readonly _openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? ''
  })
} 