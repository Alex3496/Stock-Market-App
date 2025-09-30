import { text } from "stream/consumers";
import { inngest } from "./client";
import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";

export const sendSignUpEmail = inngest.createFunction(
	{ id: 'sign-up-email' },
	{ event: 'app/user.created' },
	async ({ event, step }) => {
		const userProfile = `
			- Country: ${event.data.country || 'N/A'}
			- Investment Goal: ${event.data.investmentGoals || 'N/A'}
			- Risk Tolerance: ${event.data.riskTolerance || 'N/A'}
			- Preferred Industry: ${event.data.preferredIndustry || 'N/A'}
		`

		const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

		const response = await step.ai.infer('generate-wolcom-intro', {
			model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }) ,
			body: {
				contents: [
					{
						role: 'user',
						parts:[
							{ text: prompt }
						]
					}
				]
			}
		});

		await step.run('send-welcome-email', async () => {
			const part = response.candidates?.[0]?.content.parts?.[0];
			const introText = (part && 'text' in part ? part.text : 'Welcome to Stock App! We are excited to have you on board.')

			// Aquí iría la lógica para enviar el email, por ejemplo usando SendGrid, Mailgun, etc.

			return {
				success: true,
				message: 'welcome email sent',
			}
		})
	}
)
