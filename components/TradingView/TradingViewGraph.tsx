'use client';
import useTradingViewWidget from '@/hooks/useTradingViewWidget';
import { cn } from '@/lib/utils';
import React, { useRef, memo } from 'react';

/**
 * Props para el componente TradingViewWidget
 */
interface TradingViewWidgetProps {
	/** Título opcional que se muestra arriba del widget */
	title?: string;
	/** URL del script de TradingView a cargar */
	scriptURL: string;
	/** Configuración del widget que se pasará a TradingView */
	config: Record<string, unknown>;
	/** Altura del widget en píxeles (por defecto: 600) */
	height?: number;
	/** Clases CSS adicionales para el contenedor */
	className?: string;
}

/**
 * Componente wrapper para widgets de TradingView
 *
 * Este componente proporciona una interfaz limpia para mostrar widgets de TradingView
 * con título opcional y estilos personalizables. Utiliza el hook useTradingViewWidget
 * para manejar toda la lógica de integración.
 *
 * @param title - Título opcional que se muestra arriba del widget
 * @param scriptURL - URL del script específico de TradingView a cargar
 * @param config - Objeto de configuración que define el comportamiento y apariencia del widget
 * @param height - Altura del widget en píxeles (por defecto: 600)
 * @param className - Clases CSS adicionales para personalizar el estilo del contenedor
 *
 * @returns Componente React que renderiza un widget de TradingView

 */
const TradingViewWidget = ({title, scriptURL, config, height = 600, className}: TradingViewWidgetProps) => {

	/**
	 * Utiliza el hook personalizado para obtener la referencia al contenedor
	 * donde se montará el widget de TradingView
	 */
	const container = useTradingViewWidget(scriptURL, config, height)


	return (
		<div className="w-full">
			{/* Renderizar título opcional */}
			{ title && <h2 className="text-2xl font-semibold text-gray-100 mb-5">{title}</h2> }

			{/* Contenedor principal del widget con clases CSS combinadas */}
			<div className={cn("tradingview-widget-container", className)} ref={container} >
				{/* Contenedor interno donde TradingView montará el widget */}
				<div className="tradingview-widget-container__widget" style={{ height, width: "100%" }}></div>
			</div>
		</div>
	);
}

/**
 * Exportación memoizada del componente para optimizar el rendimiento.
 *
 * React.memo previene re-renderizados innecesarios cuando las props no han cambiado,
 * lo cual es especialmente importante para widgets pesados como los de TradingView.
 *
 * El componente solo se re-renderizará cuando cambien:
 * - title
 * - scriptURL
 * - config (comparación superficial)
 * - height
 * - className
 */
export default memo(TradingViewWidget);
