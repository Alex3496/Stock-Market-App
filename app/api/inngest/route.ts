import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { sendDailyNewsSummary, sendSignUpEmail } from "@/lib/inngest/functions";

// Se definen las funciones de Inngest aquí
export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		sendSignUpEmail,
		sendDailyNewsSummary
	]
});
