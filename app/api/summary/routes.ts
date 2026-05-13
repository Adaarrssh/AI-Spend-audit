import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = `
You are an AI infrastructure cost consultant.

Analyze this AI tool spend audit and provide a short 100-word optimization summary.

Audit:
${JSON.stringify(body.results)}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      summary: response.choices[0].message.content,
    });
  } catch {
    return Response.json({
      summary:
        "Your stack has optimization opportunities. Consider reducing unnecessary team plans and consolidating overlapping AI subscriptions.",
    });
  }
}
