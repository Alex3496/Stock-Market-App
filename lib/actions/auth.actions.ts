'use server'

import { auth } from "@/lib/better-auth/auth";
import { inngest } from "../inngest/client";
import { email } from "better-auth";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {

	try{


		// Sign up the user
		// 1 - Create user in Better-auth in mongoDB
		// 2 - Hash password and store it securely
		// 3 - Generate and store session token
		// 4 - Set the token for session management
		// 5 - Sign the user in
		const  response = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name: fullName,
			}
		})

		//After the user is created, we can send the event to Inngest
		// to trigger the welcome email with AI generated content
		// We can also pass more data about the user for a more personalized email
		// like country, investment goals, risk tolerance, preferred industry, etc.
		// This data can be used in the prompt to generate the email content
		if(response){
			await inngest.send({
				name: 'app/user.created', // Event name (lib/inngest/functions.ts)
				data: {
					email,
					password,
					name: fullName,
					country,
					investmentGoals,
					riskTolerance,
					preferredIndustry
				}
			})
		}

		return { success: true, data: response };

	}catch(err){
		console.log('SignUp Error:',err);
		return { success: false, message: 'Error signing up' };
	}

}
