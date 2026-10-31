
export default {
    async fetch(request, env) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        const json = (data, status = 200) =>
            new Response(JSON.stringify(data), {
                status,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            });

        const url = new URL(request.url);

        if (url.pathname === "/" && request.method === "GET") {
            return new Response("Sankar AI Backend is Running!", {
                headers: corsHeaders
            });
        }

        if (url.pathname === "/api" && request.method === "GET") {
            return json({
                message: "Welcome to Sankar AI",
                status: "Success"
            });
        }

        if (url.pathname === "/chat" && request.method === "POST") {
            try {
                const { message } = await request.json();

                if (typeof message !== "string" || !message.trim()) {
                    return json({ error: "Message is required" }, 400);
                }

                const result = await env.AI.run(
                    "@cf/meta/llama-3.1-8b-instruct",
                    {
                        messages: [
                            {
                                role: "system",
                                content: "You are Sankar AI, created by Sankar. You are a helpful AI assistant. Reply only in clear English. Never claim to be Qwen or another AI model. If asked who created you, say Sankar created Sankar AI."
                            },
                            {
                                role: "user",
                                content: message
                            }
                        ]
                    }
                );

                return json({ reply: result.response });

            } catch (error) {
                console.error("AI Error:", error);

                return json({
                    error: "Sankar AI could not generate a reply. Please try again."
                }, 500);
            }
        }

        return json({ error: "Route not found" }, 404);
    }
};
