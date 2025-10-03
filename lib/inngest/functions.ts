import { text } from "stream/consumers";
import { inngest } from "./client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNews } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
import { formatDateToday } from "../utils";

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


			const {data: {email, name}} = event;

			// Aquí iría la lógica para enviar el email, por ejemplo usando SendGrid, Mailgun, etc.
			return await sendWelcomeEmail({
				email,
				name,
				intro: introText
			})
		})


		return {
			success: true,
			message: 'welcome email sent',
		}
	}
)

export const sendDailyNewsSummary = inngest.createFunction(
	{ id: 'daily-news-summary' },
	[ { event: 'app/send.daily.news' }, { cron: '0 12 * * *' } ],
	async ({ step }) => {

		// Step 1: Get all users for news summary
		const users = await step.run('get-all-users', async () => {
			return await getAllUsersForNews();
		});

		if (!users || users.length === 0) {
			return { success: false, message: 'No users found' };
		}

		// Step 2: For each user, get their watchlist symbols and fetch news
		const userNewsData = await step.run('fetch-user-news', async () => {
			// Guardar la promesa de noticias generales para reutilizarla
			let generalNewsPromise: Promise<MarketNewsArticle[]> | null = null;

			const newsPromises = users.map(async (user) => {
				try {
					// Obtiener los símbolos de la watchlist del usuario
					const watchlistSymbols = await getWatchlistSymbolsByEmail(user.email);

					let news: MarketNewsArticle[];

					if (watchlistSymbols.length > 0) {
						//noticias personalizadas
						news = await getNews(watchlistSymbols);
					} else {
						//usuario sin watchlist, usar noticias generales
						if (!generalNewsPromise) {
							generalNewsPromise = getNews(undefined);
						}
						news = await generalNewsPromise;
					}

					return {
						user,
						watchlistSymbols,
						news: news.slice(0, 6), // Max 6 articles per user
					};
				} catch (error) {
					console.error(`Error fetching news for user ${user.email}:`, error);
					return {
						user,
						watchlistSymbols: [],
						news: [],
					};
				}
			});

			return await Promise.all(newsPromises);
		});

		// Step 3: (Placeholder) Summarize news via AI
		const userNewsSummaries: { user: User, newsContent: string | null }[] = [];

		for(const {user, news} of userNewsData){
			try {
				const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(news, null, 2));

				const response = await step.ai.infer(`summarize-news-${user.email}`,{
					model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }) ,
					body:{
						contents:[
							{
								role: 'user',
								parts:[
									{ text: prompt }
								]
							}
						]
					}
				})

				const part = response.candidates?.[0]?.content.parts?.[0];
				const newsContent = (part && 'text' in part ? part.text : null) || "No summary available.";

				userNewsSummaries.push({ user, newsContent });

			} catch (error) {
				console.log('error',error);
				userNewsSummaries.push({ user, newsContent: null });
			}
		}


		// Step 4: (Placeholder) Send the emails
		await step.run('send-news-emails', async () => {
			await Promise.all(userNewsSummaries.map(async ({ user, newsContent }) => {
				if (!newsContent) {
					return;
				}
				try {
					await sendNewsSummaryEmail({
						email: user.email,
						date: formatDateToday,
						newsContent
					});
				} catch (error) {
					console.error(`Error sending news summary email to ${user.email}:`, error);
				}

			}));
		});

		return {
			success: true,
			message: `Processed news for ${users.length} users`,
		};
	}
)
