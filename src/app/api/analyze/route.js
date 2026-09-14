import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question } =
      await request.json();

    if (
      !question ||
      !question.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Question is required",
        },
        {
          status: 400,
        }
      );
    }

    const prompt = `
You are an AI research assistant for trading research.

Your job is to translate a natural-language trading
research question into a clearly structured research
proposal.

IMPORTANT:

- Do NOT provide financial advice.
- Do NOT recommend buying or selling.
- Do NOT claim that a strategy works.
- Do NOT invent numerical parameters.
- Do NOT silently choose values for missing parameters.
- Preserve ambiguity when the user has not defined it.
- Separate missing information from assumptions.
- The experiment must ultimately be reproducible.

USER QUESTION:
"${question}"

Return ONLY valid JSON.

Use exactly this structure:

{
  "researchQuestion": "",
  "market": "",
  "hypothesis": "",
  "condition": "",
  "entryRule": "",
  "exitRule": "",
  "holdingPeriod": "",
  "testPeriod": "",
  "costAssumptions": "",
  "missingInformation": [],
  "assumptions": [],
  "riskWarnings": [],
  "whyItMatters": ""
}

Rules:

researchQuestion:
Rewrite the question clearly without changing its meaning.

market:
Only identify a market/instrument explicitly mentioned
by the user. If absent, leave it empty.

hypothesis:
State the proposition being investigated.
Do not state it as proven.

condition:
Extract the trigger condition.
If the user says something vague such as "sharp fall",
preserve that wording and explain the ambiguity.

entryRule:
Only specify an entry rule if the user explicitly gave one.
Otherwise leave it empty.

exitRule:
Only specify an exit rule if explicitly given.
Otherwise leave it empty.

holdingPeriod:
Only specify if explicitly given.

testPeriod:
Only specify if explicitly given.

costAssumptions:
Only specify costs if explicitly given.
Otherwise use an empty string.

missingInformation:
List the information required to make the experiment
reproducible but not supplied by the user.

For a question such as:
"Does buying NIFTY after a sharp fall work?"

likely missing information includes:
- measurable definition of "sharp fall"
- entry timing
- holding period
- historical test period
- transaction cost assumptions

assumptions:
List reasonable interpretations that may need confirmation.
Do not turn assumptions into facts.

riskWarnings:
Mention relevant research limitations such as:
- small sample sizes
- transaction costs
- slippage
- overfitting
- look-ahead bias
- survivorship bias
- changing market regimes
when relevant.

whyItMatters:
Briefly explain why the unresolved ambiguity affects
the reproducibility or interpretation of the experiment.

Keep the output concise.
`;

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },

          body: JSON.stringify({
            model:
              "openai/gpt-4o-mini",

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.2,
          }),
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "OpenRouter error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "OpenRouter request failed",
          details:
            errorText,
        },
        {
          status: 500,
        }
      );
    }

    const data =
      await response.json();

    const content =
      data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(
        "No response received from OpenRouter"
      );
    }

    const cleaned =
      content
        .replace(
          /```json/g,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    const result =
      JSON.parse(cleaned);

    return NextResponse.json(
      result
    );

  } catch (error) {
    console.error(
      "Analyze API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to analyze question",

        details:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}