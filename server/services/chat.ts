
import { Configuration, OpenAIApi } from "openai";
import { storage } from "../storage";

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

export async function handleCustomerQuery(query: string, userId?: number): Promise<string> {
  try {
    // Get context about user if available
    let userContext = '';
    if (userId) {
      const user = await storage.getUser(userId);
      userContext = `User: ${user.firstName} ${user.lastName}, Email: ${user.email}`;
    }

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${userContext}\nCustomer query: ${query}\nHelpful response:`,
      max_tokens: 150
    });

    return completion.data.choices[0].text || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    console.error('Chat error:', error);
    return "Sorry, I'm having trouble right now. Please try again later.";
  }
}
