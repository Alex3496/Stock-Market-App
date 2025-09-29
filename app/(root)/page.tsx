import React from 'react'

import { Button } from '@/components/ui/button'
import TradingViewGraph from '@/components/TradingView/TradingViewGraph'
import { MARKET_OVERVIEW_WIDGET_CONFIG, HEATMAP_WIDGET_CONFIG, TOP_STORIES_WIDGET_CONFIG, MARKET_DATA_WIDGET_CONFIG } from '@/lib/constants'

const Home = () => {

	let scriptURL = 'https://s3.tradingview.com/external-embedding/';

  	return (
		<div className='flex min-h-screen home-wrapper'>
			<section className='grid w-full gap-8 home-section'>
				<div className="md:col-span-1 xl:col-span-1">
					<TradingViewGraph
						title='Market Overview'
						scriptURL={scriptURL + 'embed-widget-market-overview.js'}
						config={MARKET_OVERVIEW_WIDGET_CONFIG}
						className='custom-chart'
						height={600}
					/>
				</div>
				<div className="md:col-span-1 xl:col-span-2">
					<TradingViewGraph
						title='Stock Heatmap'
						scriptURL={scriptURL + 'embed-widget-stock-heatmap.js'}
						config={HEATMAP_WIDGET_CONFIG}
						height={600}
					/>
				</div>
			</section>
			<section className='grid w-full gap-8 home-section'>
				<div className="h-full md:col-span-1 xl:col-span-1">
					<TradingViewGraph
						scriptURL={scriptURL + 'embed-widget-timeline.js'}
						config={TOP_STORIES_WIDGET_CONFIG}
						className='custom-chart'
						height={600}
					/>
				</div>
				<div className="h-full md:col-span-1 xl:col-span-2">
					<TradingViewGraph
						scriptURL={scriptURL + 'embed-widget-market-quotes.js'}
						config={MARKET_DATA_WIDGET_CONFIG}
						height={600}
					/>
				</div>
			</section>
		</div>
  	)
}

export default Home
