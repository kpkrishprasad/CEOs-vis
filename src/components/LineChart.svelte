<script>
  import { scaleLog, scaleBand } from "d3-scale";
  import { quantile, ascending, max, min } from "d3-array";
  import { axisLeft } from "d3";
  import { select } from "d3-selection";
  import { onMount } from "svelte";

  let svgChart, svgYAxis, divTopScroll, tooltip;

  let margin = { top: 20, right: 30, bottom: 10, left: 80 };
  let totalWidth = 4000; // Reduced scrollable area width
  let width = totalWidth - margin.left - margin.right;
  let height = 600 - margin.top - margin.bottom;

  let industryData = {};
  let industries = [];

  const xScale = scaleBand()
    .range([0, width])
    .padding(0.2); // Increased padding for more spacing between boxes

  const yScale = scaleLog()
    .domain([5000000, 290000000]) // Logarithmic scale from 1 to 200,000,000
    .range([height, 0]);

  onMount(async () => {
    const response = await fetch('/ceo_data_b.json');
    const ceoData = await response.json();
    
    // Group data by industry
    ceoData.forEach((d) => {
      if (!industryData[d.Industry]) {
        industryData[d.Industry] = [];
      }
      industryData[d.Industry].push(d);
    });

    // Calculate median CEO pay for each industry
    industries = Object.keys(industryData).map(industry => {
      let medianPay = quantile(industryData[industry].map(d => d.ceoPay).sort(ascending), 0.5);
      return { industry, medianPay };
    }).sort((a, b) => ascending(a.medianPay, b.medianPay)).map(d => d.industry);

    xScale.domain(industries);

    const yAxisSvg = select(svgYAxis);
    const chartSvg = select(svgChart);

    // Sync the scroll positions of the top scroll div with the chart
    divTopScroll.addEventListener('scroll', () => {
      chartSvg.node().parentNode.scrollLeft = divTopScroll.scrollLeft;
    });

    chartSvg.node().parentNode.addEventListener('scroll', () => {
      divTopScroll.scrollLeft = chartSvg.node().parentNode.scrollLeft;
    });

    // Draw Y-Axis
    yAxisSvg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(axisLeft(yScale).ticks(10).tickFormat(d => d.toLocaleString()));

    drawChart(chartSvg);
  });

  function drawChart(chartSvg) {
    industries.forEach(industry => {
      let industryCeoData = industryData[industry].map(d => d.ceoPay).sort(ascending);
      let q1 = quantile(industryCeoData, 0.25);
      let median = quantile(industryCeoData, 0.5);
      let q3 = quantile(industryCeoData, 0.75);
      let iqr = q3 - q1;
      let minVal = max([min(industryCeoData), q1 - 1.5 * iqr]);
      let maxVal = min([max(industryCeoData), q3 + 1.5 * iqr]);

      // Draw Box
      chartSvg
        .append("rect")
        .attr("x", xScale(industry))
        .attr("y", yScale(q3))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale(q1) - yScale(q3))
        .style("fill", "#69b3a2")
        .style("stroke", "black")
        .on("mouseover", (event) => showTooltip(event, industry))
        .on("mousemove", (event) => showTooltip(event, industry))
        .on("mouseout", hideTooltip);

      // Draw Median Line
      chartSvg
        .append("line")
        .attr("x1", xScale(industry))
        .attr("x2", xScale(industry) + xScale.bandwidth())
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .style("stroke", "red")
        .style("stroke-width", "2px");

      // Add Labels
      chartSvg
        .append("text")
        .attr("x", xScale(industry) + xScale.bandwidth() / 2)
        .attr("y", yScale(q3) - 10) // Position above the box, adjusted for more space
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(industry);

      // Handle single company case
      if (industryCeoData.length === 1) {
        chartSvg
          .append("circle")
          .attr("cx", xScale(industry) + xScale.bandwidth() / 2)
          .attr("cy", yScale(median))
          .attr("r", 5)
          .style("fill", "#69b3a2")
          .style("stroke", "black")
          .on("mouseover", (event) => showTooltip(event, industry))
          .on("mousemove", (event) => showTooltip(event, industry))
          .on("mouseout", hideTooltip);
      }
    });
  }

  function showTooltip(event, industry) {
    const data = industryData[industry];
    const totalCeoPay = data.reduce((sum, d) => sum + d.ceoPay, 0);
    const avgCeoPay = (totalCeoPay / data.length).toFixed(2);

    tooltip.innerHTML = `
      <div><strong>Industry:</strong> ${industry}</div>
      <div><strong>Total CEO Pay:</strong> $${totalCeoPay.toLocaleString()}</div>
      <div><strong>Average CEO Pay:</strong> $${avgCeoPay.toLocaleString()}</div>
      <div><strong>Number of CEOs:</strong> ${data.length}</div>
    `;
    tooltip.style.left = `${event.pageX + 15}px`;
    tooltip.style.top = `${event.pageY - 28}px`;
    tooltip.style.display = "block";
  }

  function hideTooltip() {
    tooltip.style.display = "none";
  }

  function scrollLeft() {
    divTopScroll.scrollLeft -= 100;
  }

  function scrollRight() {
    divTopScroll.scrollLeft += 100;
  }
</script>

<div style="justify-content: center; display:grid">
  <h1>Industry Comparison of CEO Salaries </h1>
  <p>
    To truly understand the economic landscape of CEO-worker relationships, it's essential to first zoom out and examine trends on an industry scale. This broader perspective sets the foundation for more granular analysis and helps contextualize the disparities we observe.
    Scroll along the scale of CEO/worker disparity and hover over each box to see summary statistics. 
    As you interact with this visualization, consider the logarithmic scale on your left, think about who the CEOs and average workers are in these industries, and why some industries have exponentially higher disparities between CEO and average worker pay.

  </p>
</div>
<br>
<br>


<div style="display: flex; justify-content: center; align-items: flex-start; width: 100%;">
  <svg bind:this={svgYAxis} width={margin.left} height={height + margin.top + margin.bottom}></svg>
  <div style="width: calc(100% - 100px); padding-left: 10px; position: relative;">
    <div style="position: relative; display: flex; align-items: center;">
      <button on:click={scrollLeft} class="arrow-button" style="left: 0;">&lt;</button>
      <div bind:this={divTopScroll} class="custom-scrollbar" style="overflow-x: auto; overflow-y: hidden; flex-grow: 1;">
        <div style="width: {totalWidth}px; height: 1px;"></div>
      </div>
      <button on:click={scrollRight} class="arrow-button" style="right: 0;">&gt;</button>
    </div>
    <div style="overflow-x: hidden; width: 100%;">
      <svg bind:this={svgChart} width={totalWidth} height={height + margin.top + margin.bottom}></svg>
    </div>
  </div>
</div>

<!-- Tooltip div -->
<div bind:this={tooltip} class="tooltip" style="display: none; position: absolute; background-color: white; border: 1px solid #ccc; padding: 10px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);"></div>
<div style="justify-content: center; display:grid"> 
  <p>
    The first thing you might notice is that the service industry has the highest CEO salaries of any industry by far. This might be worth exploring, as the service industry is notorious for low pay. This is also interesting through the lense of tipping laws that allow corporations to pay tipped service workers less than minimum wage.
    It is also interesting to note that in all of the industries with the highest earning CEO's, the lowest tier of labor (e.g. cast and crew, construction workers, service workers) is incredibly important if not 100% imperative to the businesses succeess. 
  </p>
</div>
<br>
<br>
<hr>
<br>
<br>
<style>
  svg {
    font-family: sans-serif;
  }
  rect, line {
    fill: #69b3a2;
    stroke: black;
    stroke-width: 2px;
  }
  .tooltip {
    white-space: pre-line; /* Ensures the text inside the tooltip is double-spaced */
  }
  .arrow-button {
    background-color: #888;
    border: none;
    color: white;
    padding: 0 10px;
    cursor: pointer;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    margin: 0 5px; /* Add some margin between the button and the scrollbar */
  }
  .arrow-button:hover {
    background-color: #555;
  }
  p{
    font-family: Arial, sans-serif;
    line-height: 2; 
    padding-left: 200px; 
    padding-right: 200px;
  }

  h1{
    font-family: Arial, sans-serif;
    line-height: 2; /* Double spacing */
    font-size: x-large;
    font-style: italic;
    text-decoration: underline;
    /* padding-left: 400px; Adjust the padding as needed */
    /* padding-right: 400px; Adjust the padding as needed */
  }
</style>
