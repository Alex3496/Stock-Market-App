'use client'
import { Button } from '@/components/ui/button';
import React from 'react'
import { useForm } from 'react-hook-form';

//components
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constants';
import FooterLinks from '@/components/forms/FooterLinks';

const page = () => {

	const {
		register, // Hook para registrar campos en el formulario
		handleSubmit, // Función para manejar el envío del formulario
		control, // Control para campos controlados
		formState: { errors, isSubmitting } // Estado del formulario, incluyendo errores y estado de envío
	} = useForm<SignUpFormData>({
		mode: 'onBlur', // Validación al perder el foco
		defaultValues: {
			fullName: '',
			email: '',
			password: '',
			country: 'US',
			investmentGoals: 'Growth',
			riskTolerance: 'Medium',
			preferredIndustry: 'Technology'
		}
	});

	const onSubmit = async (data: SignUpFormData) => {
		try {
			// Lógica para manejar el envío del formulario, como llamar a una API
			console.log('Form Data:', data);
		} catch (error) {
			console.error('Error submitting form:', error);
		}
	}

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="form-title">Sign Up & Personalize</h1>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='space-y-5'
			>
				{/* Campos del formulario aquí */}
				<InputField
					name="fullName"
					label="Full Name"
					placeholder="Enter your full name"
					register={register}
					error={errors.fullName}
					validation={{ required: 'Full name is required', minLength: 2 }}
				/>

				<InputField
					name="email"
					label="Email"
					type='email'
					placeholder="contact@example.com"
					register={register}
					error={errors.email}
					validation={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email address' } }}
				/>

				<InputField
					name="password"
					label="Password"
					placeholder="**********"
					type='password'
					register={register}
					error={errors.password}
					validation={{ required: 'Password is required', minLength: 6 }}
				/>

				<SelectField
					name="investmentGoals"
					label="Investment Goals"
					placeholder="Select your investment goals"
					options={INVESTMENT_GOALS}
					control={control}
					error={errors.investmentGoals}
					required
				/>

				<SelectField
					name="riskTolerance"
					label="Risk Tolerance"
					placeholder="Select your risk level"
					options={RISK_TOLERANCE_OPTIONS}
					control={control}
					error={errors.riskTolerance}
					required
				/>

				<SelectField
					name="preferredIndustry"
					label="Preferred Industry"
					placeholder="Select your preferred industry"
					options={PREFERRED_INDUSTRIES}
					control={control}
					error={errors.preferredIndustry}
					required
				/>

				<Button type="submit" disabled={isSubmitting} className='yellow-btn w-full mt-5'>
					{isSubmitting ? 'Submitting...' : 'Submit'}
				</Button>

				<FooterLinks
					text="Already have an account?"
					href="/sign-in"
					linkText="Sign in"
				/>

			</form>
		</div>
	)
}

export default page
