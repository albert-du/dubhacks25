/**
 * The Gounds Prompt Enhancer — Cloudflare Worker
 *
 * Uses @cf/meta/llama-3.1-8b-instruct to rewrite a user prompt
 * based on tracing accuracy into a two-sentence coloring book scene
 * with enhanced description.
 */

export default {
  async fetch(request, env, ctx) {
    try {
      console.info("Prompt Enhancer: Received request");

      // --- Method check
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Use POST with JSON body" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
      }

      // --- Parse JSON safely
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { prompt: userPrompt, accuracy_scores } = body;
      if (!userPrompt || !Array.isArray(accuracy_scores)) {
        return new Response(JSON.stringify({ error: "Missing 'prompt' or 'accuracy_scores' fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // --- Compute average accuracy
      const avg =
        accuracy_scores.length > 0
          ? accuracy_scores.reduce((a, b) => a + b, 0) / accuracy_scores.length
          : 0;

      // --- Build the LLM prompt
      const systemPrompt = `
You write two-sentence prompts for a black-and-white coloring book.
Respond with a descriptive sentences suitable for a traceable line-drawing scene and a
sentence indicating the intended audience based on tracing accuracy.
No reasoning or explanations. The second sentence must begin with "Intended for"
`;

      const userMessage = `
Base idea: "${userPrompt}"
Average accuracy: ${avg.toFixed(2)}

Guidelines:
- If accuracy < 0.6 → very simple scene, large rounded shapes, minimal detail, wide spacing; mention "intended for people with limited motor function".
- If 0.6 ≤ accuracy < 0.8 → moderate detail, balanced composition.
- If ≥ 0.8 → slightly richer scene, still easy to trace.

Write exactly two sentences as the final output.

The first sentence shall be elaborating on the initial idea to be more descriptive and vivid. Be creative.
The second sentence shall be a single concise sentence indicating the intended audience.
`;

      const fullPrompt = `${systemPrompt}\n${userMessage}`;

      // --- Call Cloudflare AI model (correct schema uses 'prompt', not 'input')
      const modelId = "@cf/meta/llama-3.1-8b-instruct";
      console.info("Calling model:", modelId);

      const aiResponse = await env.LLM.run(modelId, { prompt: fullPrompt });

      // --- Extract model output text safely
      let raw =
        aiResponse?.output_text ||
        aiResponse?.response ||
        aiResponse?.result?.output_text ||
        (Array.isArray(aiResponse?.output)
          ? aiResponse.output[0]?.content?.[0]?.text
          : null) ||
        aiResponse?.result ||
        aiResponse;

      raw = typeof raw === "string" ? raw.trim() : JSON.stringify(raw);

      console.log("Raw model output:", raw);

      // --- Clean output: first non-empty line
      const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const adjustedPrompt = lines[0] || raw;

      // --- Return structured JSON
      return new Response(
        JSON.stringify({
          base_prompt: userPrompt,
          average_accuracy: avg,
          adjusted_prompt: adjustedPrompt,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      console.error("Prompt Enhancer Error:", err);
      return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
