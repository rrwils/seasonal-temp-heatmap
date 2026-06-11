import * as d3 from 'd3';
import { useMemo } from 'react';
import { useRef, useState } from 'react';
import { useDimensions } from './use-dimensions';
import { Tooltip } from "./Tooltip";
import { ColorLegend } from "./ColorLegend";

export const ResponsiveHeatmap = (props) => {
    const chartRef = useRef(null);
    const chartSize = useDimensions(chartRef);

    return (
        <div ref={chartRef} style={{ width: '100%', height: 600 }}>
            <Heatmap width={chartSize.width} height={chartSize.height} {...props} />
        </div>
    );
};

export const Heatmap = ({ width, height, data }) => {

    const [interactionData, setInteractionData] = useState(null);

    const margin = { top: 20, right: 20, bottom: 20, left: 80 };
    const boundsWidth = width - margin.left - margin.right;
    const boundsHeight = height - margin.top - margin.bottom;
    
    // sort by week 1 value
    // const cities = useMemo(() => { 
    //     return data
    //         .filter(d => d.week === 0)
    //         .sort((a, b) => a.value - b.value)
    //         .map(d => d.city);
    //     },
    //     [data]
    // );

    // sort by average across all weeks
    // const cities = useMemo(() => {
    //     const averages = d3.rollups(
    //         data,
    //         v => d3.mean(v, d => d.value),
    //         d => d.city
    //     );

    //     return averages
    //         .sort((a,b) => a[1] - b[1])
    //         .map(([city]) => city);
    // }, [data]);

    //sort by lat
    const cities = useMemo(() => {
        return d3.rollups(
            data,
            v => v[0].lat,
            d => d.city
        )
        .sort((a, b) => a[1] - b[1])
        .map(([city]) => city);
    }, [data]);

    
    const yScale = useMemo(() => {
        return d3
            .scaleBand()
            .domain(cities)
            .range([0, boundsHeight])
            .padding(0.1);
    }, [cities, boundsHeight]);

    const weeks = useMemo(
        () => [...new Set(data.map(d => d.week))].sort((a, b) => a - b),
        [data]
    );

    const xScale = useMemo(() => {
        return d3
            .scaleBand()
            .domain(weeks)
            .range([0, boundsWidth])
            .padding(0.1);
    }, [weeks, boundsWidth]);

    const colorScale = useMemo(() => {
        const min = d3.min(data, d => d.value) ?? 0;
        const max = d3.max(data, d => d.value) ?? 0;
        return d3
            .scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateTurbo);
    }, [data]);

    if (!data.length) {
        return <p>Loading heatmap…</p>;
    }

    const allRects = data.map((d, i) => {
        if (d.value === null) {
            return null;
        }
        return (
            <rect
                key={i}
                x={xScale(d.week)}
                y={yScale(d.city)}
                width={xScale.bandwidth()}
                height={yScale.bandwidth()}
                fill={colorScale(d.value)}
                onMouseEnter={() => {
                    const xPos = margin.left + (xScale(d.week) ?? 0) + xScale.bandwidth() / 2;
                    const yPos = margin.top + (yScale(d.city) ?? 0) + yScale.bandwidth() / 2;
                    setInteractionData({
                        xPos,
                        yPos,
                        name: d.city,
                        value: d.value,
                        xValue: d.week + 1,
                        placement: xPos < width / 2 ? "right" : "left",
                    });
                }}
                onMouseLeave={() => setInteractionData(null)}
            />
        );
    });

    // show tick labels every 5 weeks
    const tickInterval = window.innerWidth < 320 ? 10 : 4;
    
    const xLabels = weeks.map((week, i) => {

        //show first and last tick, plus every nth tick
        const shouldShow =
            i === 0 ||
            i % tickInterval === 0;

        if (!shouldShow) return null;

        const xPos = xScale(week) ?? 0;
        return (
            <text
                key={i}
                x={xPos + xScale.bandwidth() / 2}
                y={boundsHeight + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={10}
            >
                {i + 1}
            </text>
        )
    })

    const yLabels = cities.map((city, i) => {
        const yPos = yScale(city) ?? 0;
        return (
            <text
                key={i}
                x={-5}
                y={yPos + yScale.bandwidth() / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
            >
                {city}
            </text>
        )
    })

    return (
        
            
            <div style={{position: "relative"}}>
                <svg width={width} height={height}>
                <g 
                    width={boundsWidth} 
                    height={boundsHeight} 
                    transform={`translate(${margin.left}, ${margin.top})`}
                >
                    {allRects}
                    {xLabels}
                    {yLabels}
                </g>
                    
                </svg>

                <div style={{
                    position: "absolute",
                    width,
                    height,
                    top: 0,
                    left: 0,
                    pointerEvents: "none"}}>
                        <Tooltip interactionData={interactionData} />
                </div>

                <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                    <ColorLegend width={400} height={100} colorScale={colorScale} interactionData={interactionData} />
                </div>
            </div>

            
        
        
    );
};