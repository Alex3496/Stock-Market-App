import React from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'

/**
 * Componente de campo de entrada para formularios con React Hook Form
 *
 * Este componente utiliza `register` de React Hook Form para elementos HTML nativos.
 * Es ideal para inputs básicos como text, email, password, etc.
 *
 * ¿Por qué usa `register` en lugar de `Controller`?
 * - El componente Input es un wrapper del elemento HTML nativo <input>
 * - React Hook Form puede acceder directamente a `event.target.value`
 * - `register` maneja automáticamente onChange, onBlur, y validaciones
 * - Más performante para elementos nativos (no re-renderiza en cada keystroke)
 *
 * @param name - Nombre único del campo (usado para registro y validación)
 * @param label - Etiqueta visible del campo
 * @param placeholder - Texto de ayuda mostrado cuando el campo está vacío
 * @param type - Tipo de input HTML ('text', 'email', 'password', 'number', etc.)
 * @param register - Función register de React Hook Form para registrar el campo
 * @param error - Objeto de error de React Hook Form con message property
 * @param validation - Reglas de validación (required, minLength, pattern, etc.)
 * @param disabled - Si el campo está deshabilitado
 * @param value - Valor controlado del campo (opcional, para casos especiales)

 */
const InputField = ({
	name,
	label,
	placeholder,
	type = "text",
	register,
	error,
	validation,
	disabled = false,
	value
}: FormInputProps) => {
  	return (
		<div className='space-y-2'>
			{/* Label asociado al input para accesibilidad */}
			<Label htmlFor={name} className='form-label'>
				{label}
			</Label>

			{/*
			Input nativo que usa `register` para integración con React Hook Form.

			¿Cómo funciona `register`?
			1. register(name, validation) retorna: { onChange, onBlur, name, ref }
			2. El spread operator (...) aplica estas props al Input
			3. React Hook Form maneja automáticamente los eventos del DOM
			4. No necesita re-renderizar el componente en cada cambio
			*/}
			<Input
				id={name}
				type={type}
				value={value}
				disabled={disabled}
				placeholder={placeholder}
				className={cn("form-input", {
					// Estilos condicionales para estados de error y disabled
					"border-red-500 focus:border-red-500 focus:ring-red-500": error,
					"opacity-50 cursor-not-allowed": disabled
				})}
				{...register(name, { ...validation })} // ✅ register para elementos HTML nativos
			/>

			{/* Mensaje de error mostrado debajo del input */}
			{error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
		</div>
  	)
}

export default InputField
