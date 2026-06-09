import { useEffect, useState, useMemo } from 'react'
import './App.css'
import { fetchData } from './data';
import { ResponsiveHeatmap } from './Heatmap';
import * as d3 from 'd3';

function App() {
  const [heatmapData, setHeatmapData] = useState([]);
  
  useEffect(() => {
    fetchData().then(setHeatmapData);
  }, []);

  const colorScale = useMemo(() => {
    const max = d3.max(heatmapData, d => d.value) ?? 0;
    return d3
        .scaleSequential()
        .domain([0, max])
        .interpolator(d3.interpolateReds);
  }, [heatmapData]);

  return (
    <>
      <div id="header">
        <h1>Temperature heatmap for selected cities</h1>
        <p>Average weekly temperatures, 2025</p>
        <p style={{
          color: "#656565",
          fontSize: 11,
        }}>Hover over the heatmap for actual values <img src="/mouse.png"/></p>
      </div>
      
        <div id="graphic">
          <ResponsiveHeatmap data={heatmapData} />
        </div>
      <div id="footnote">
        <p>Cities are ordered from north to south by latitude. Values show weekly averages of daily air temperatures measured 2 meters above the ground.</p>
        <p>Data source: <a href="https://open-meteo.com/">Open-Meteo</a></p>
      </div>
    </>
  )
}

export default App