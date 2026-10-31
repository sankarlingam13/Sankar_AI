
export default {
    async fetch(request, env) {

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        const json = (data, status = 200) => {
            return new Response(JSON.stringify(data), {
                status,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            });
        };

        // CORS
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 200,
                headers: corsHeaders
            });
        }

        const url = new URL(request.url);

        // Home route
        if (url.pathname === "/" && request.method === "GET") {
            return new Response(
                "Sankar AI Backend is Running!",
                { headers: corsHeaders }
            );
        }

        // API route
        if (url.pathname === "/api" && request.method === "GET") {
            return json({
                message: "Welcome to Sankar AI",
                status: "Success"
            });
        }

        // Chat route
        if (url.pathname === "/chat" && request.method === "POST") {

            try {

                const body = await request.json();
                const message = body.message;

                if (
                    typeof message !== "string" ||
                    message.trim() === ""
                ) {
                    return json({
                        error: "Message is required"
                    }, 400);
                }

                if (!env.AI) {
                    throw new Error(
                        "Cloudflare AI binding is missing"
                    );
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
                                content: message.trim()
                            }
                        ]
                    }
                );

                const reply = result?.response;

                if (!reply) {
                    console.error(
                        "Unexpected AI response:",
                        JSON.stringify(result)
                    );

                    throw new Error(
                        "AI returned an empty response"
                    );
                }

                return json({
                    reply: reply
                });

            } catch (error) {

                console.error("AI Error:", error);

                return json({
                    error: error?.message || String(error)
                }, 500);
            }
        }

        return json({
            error: "Route not found"
        }, 404);
    }
};
