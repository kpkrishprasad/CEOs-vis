<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let ceoData = [];

  onMount(async () => {
    const response = await fetch('/ceo_data_b.json');
    ceoData = await response.json();

    const industries = Array.from(new Set(ceoData.map(d => d.Industry)));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(industries);

    const margin = {top: 50, right: 300, bottom: 50, left: 60},
          width = 1000 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#scatterplot")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(ceoData, d => d.payRatio)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(ceoData, d => d.employeePay)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    const tooltip = d3.select("#scatterplot").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg.selectAll("circle")
      .data(ceoData)
      .enter().append("circle")
        .attr("cx", d => x(d.payRatio))
        .attr("cy", d => y(d.employeePay))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Industry))
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`Industry: ${d.Industry}<br/>Company: ${d.company}<br/>CEO: ${d.ceo}<br/>CEO Pay: ${d.ceoPay}<br/>Median Worker Pay: ${d.employeePay}`)
            .style("left", `${event.pageX + 5}px`)
            .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });

    // Two-column legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(industries.slice().sort())
      .enter().append("g")
        .attr("transform", (d, i) => `translate(${width + 24 + (i % 2) * 120}, ${Math.floor(i / 2) * 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", colorScale);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d);
  });
</script>

<style>
  .tooltip {
    position: absolute;
    text-align: center;
    width: 160px;
    height: 80px;
    padding: 2px;
    background: lightsteelblue;
    border-radius: 8px;
    pointer-events: none;
    opacity: 0;
  }

  p{
    font-family: Arial, sans-serif;
    line-height: 2; 
    padding-left: 200px; 
    padding-right: 200px;
  }
</style>

<div class="user-instructions">
  <p>
  Hover over the points to see details. Click on a point to highlight. Zoom in/out.
  </p>
</div>
<div id="scatterplot"></div>
<div class="graph explanation">
  <p>
    The CEO Pay Ratio data ranges from a minimum of 0 at PACCAR to a maximum of 4628 at Western Digital. The pay ratio measures how many times more the CEO is paid compared to the median worker within the same company. For instance, at Western Digital, the CEO, David V. Goeckeler, earns 4628 times the median employee pay. This graph provides a visual representation of the disparity in compensation between top executives and average workers across various industries, highlighting significant differences and trends. It reveals, for example, how sectors like Technology tend to have higher discrepancies, reflecting broader economic and social dynamics within these industries.
  </p>
</div>
