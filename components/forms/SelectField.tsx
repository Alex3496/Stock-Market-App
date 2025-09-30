import React from 'react'
import { Label } from '../ui/label'
import { Controller } from 'react-hook-form'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * Componente de campo select para formularios con React Hook Form
 *
 * Este componente utiliza `Controller` de React Hook Form para componentes personalizados.
 * Es necesario para integrar componentes de terceros que no siguen las convenciones HTML estándar.
 *
 * ¿Por qué usa `Controller` en lugar de `register`?
 * - El componente Select de Shadcn/UI NO es un <select> HTML nativo
 * - Usa eventos personalizados como `onValueChange` (no `onChange`)
 * - Tiene lógica interna compleja (dropdown, keyboard navigation, etc.)
 * - React Hook Form no puede "registrarlo" automáticamente
 * - Controller actúa como "puente/traductor" entre RHF y el componente personalizado
 *
 * Flujo de Controller:
 * 1. Controller recibe `control` de React Hook Form
 * 2. Proporciona `field` object con { value, onChange, onBlur, name }
 * 3. Conectamos field.value al Select y field.onChange al onValueChange
 * 4. Controller traduce los eventos del Select al formato que RHF entiende
 *
 * @param name - Nombre único del campo (usado para registro y validación)
 * @param label - Etiqueta visible del campo
 * @param placeholder - Texto mostrado cuando no hay selección
 * @param options - Array de opciones con estructura { value: string, label: string }
 * @param control - Objeto control de React Hook Form
 * @param error - Objeto de error de React Hook Form con message property
 * @param required - Si el campo es obligatorio (genera validación automática)
 *
 * @example
 * ```tsx
 * // Uso básico con React Hook Form
 * const { control, formState: { errors } } = useForm();
 *
 * const investmentOptions = [
 *   { value: 'growth', label: 'Growth' },
 *   { value: 'income', label: 'Income' },
 *   { value: 'balanced', label: 'Balanced' }
 * ];
 *
 * <SelectField
 *   name="investmentGoal"
 *   label="Investment Goal"
 *   placeholder="Select your goal"
 *   options={investmentOptions}
 *   control={control}
 *   error={errors.investmentGoal}
 *   required={true}
 * />
 * ```
 */
const SelectField = ({
	name,
	label,
	placeholder,
	options,
	control,
	error,
	required = false
}: SelectFieldProps) => {

  	return (
		<div className='space-y-2'>
			{/* Label con indicador visual de campo requerido */}
			<Label htmlFor={name} className='form-label'>
				{label}
			</Label>

			{/*
			Controller es necesario porque Select NO es un elemento HTML nativo.

			¿Cómo funciona Controller?
			1. Controller maneja el estado y validaciones internamente
			2. Proporciona `field` object: { value, onChange, onBlur, name }
			3. `render` prop recibe field y debe retornar el componente personalizado
			4. Conectamos field.value y field.onChange al componente Select
			5. Controller "traduce" entre React Hook Form y el componente personalizado

			Diferencia clave vs register:
			- register: Para elementos HTML nativos (automático)
			- Controller: Para componentes personalizados (manual, pero flexible)
			*/}
			<Controller
				name={name}
				control={control} // ✅ control de React Hook Form
				rules={{ required: required ? `Please select ${label.toLocaleLowerCase()}` : false }} // Validaciones
				render={({ field }) => ( // ✅ field contiene value, onChange, etc.
					<Select
						value={field.value}           // ✅ Conecta el valor actual
						onValueChange={field.onChange} // ✅ Conecta el handler de cambio (NO es onChange!)
					>
						<SelectTrigger className="select-trigger">
							<SelectValue placeholder={placeholder} />
						</SelectTrigger>
						<SelectContent className='bg-gray-800 border-gray-600 text-white'>
							{/* Renderizar opciones dinámicamente */}
							{options.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
						{/* Mensaje de error mostrado dentro del Select */}
						{error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
					</Select>
				)}
			/>
		</div>
  	)
}

/**
 * Exportación del componente SelectField
 *
 * RESUMEN: ¿Cuándo usar Controller vs register?
 *
 * 📋 USA `register` (como InputField) cuando:
 * ✅ Elementos HTML nativos (<input>, <textarea>, <select> nativo)
 * ✅ El componente acepta onChange y value estándar
 * ✅ No hay lógica interna compleja
 * ✅ Mejor performance (no re-renderiza en cada keystroke)
 *
 * 🎛️ USA `Controller` (como SelectField) cuando:
 * ✅ Componentes de terceros (Shadcn, Material-UI, Ant Design)
 * ✅ Componentes con APIs personalizadas (onValueChange, onSelectionChange)
 * ✅ Elementos con lógica interna compleja (dropdowns, date pickers)
 * ✅ Necesitas control granular del re-rendering
 *
 * 💡 Controller actúa como un "traductor" entre React Hook Form y componentes personalizados.
 */
export default SelectField
