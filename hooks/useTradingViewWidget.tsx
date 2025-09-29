'use client';

import React, { useEffect, useRef } from 'react'

/**
 * Hook personalizado para integrar widgets de TradingView en componentes React
 *
 * Este hook maneja toda la lógica de integración con TradingView, incluyendo:
 * - Creación dinámica de scripts
 * - Prevención de cargas duplicadas
 * - Manipulación segura del DOM
 * - Cleanup automático para evitar memory leaks
 *
 * @param scriptURL - URL del script de TradingView a cargar (ej: 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js')
 * @param config - Configuración del widget en formato objeto que será serializada a JSON
 * @param height - Altura del widget en píxeles (por defecto: 600)
 *
 * @returns RefObject<HTMLDivElement> - Referencia al contenedor donde se montará el widget
 *
 */
const useTradingViewWidget = (scriptURL: string, config: Record<string, unknown>, height: number = 600) => {
	/**
	 * Referencia al elemento DOM que contendrá el widget de TradingView
	 */
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {

		// Verificar que el contenedor existe antes de proceder
		if(!containerRef.current) return;

		// Prevenir cargas duplicadas - si ya está marcado como cargado, salir
		if(containerRef.current.dataset.loaded) return;

		// Crear el HTML interno del contenedor del widget
		containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="height:${height}px; width: 100%;"></div>`

		// Crear el elemento script dinámicamente
		const script = document.createElement("script");
		script.src = scriptURL;
		script.async = true; // Carga asíncrona para no bloquear la UI
		script.innerHTML = JSON.stringify(config); // Configuración del widget

		// Añadir el script al contenedor
		containerRef.current.appendChild(script);

		// Marcar como cargado para prevenir cargas duplicadas
		containerRef.current.dataset.loaded = "true";

		// Función de cleanup que se ejecuta cuando el componente se desmonta
		// o cuando las dependencias del useEffect cambian
		return () => {
			if (containerRef.current) {
				// Limpiar el contenido HTML
				containerRef.current.innerHTML = "";
				// Remover la marca de cargado
				delete containerRef.current.dataset.loaded;
			}
		};

    }, [scriptURL, config, height]); // Dependencias: re-ejecutar si cambian estos valores

	return containerRef;
}

export default useTradingViewWidget
