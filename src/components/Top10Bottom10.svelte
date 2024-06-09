<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    let data = [];
    let top10 = [];
    let bottom10 = [];
    let selectedCompany = null;

    onMount(async () => {
        try {
            const response = await fetch('/CEOs-HATE-This-Simple-Trick/ceo_data_b.json');
            data = await response.json();

            data.sort((a, b) => b.payRatio - a.payRatio);

            top10 = data.slice(0, 10);
            bottom10 = data.filter(d => d.payRatio !== null).slice(-10);
            drawCharts();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    });

    function drawCharts() {
        const margin = { top: 40, right: 30, bottom: 100, left: 60 },
            width = 600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        drawChart(top10, "#chart-top10", "Top 10 Companies by Pay Ratio", margin, width, height);
        drawChart(bottom10, "#chart-bottom10", "Bottom 10 Companies by Pay Ratio", margin, width, height);
    }

    function drawChart(data, selector, title, margin, width, height) {
        const svg = d3.select(selector)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.2)
            .domain(data.map(d => d.company));

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.payRatio)]);

        svg.append("g")
            .selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", d => `translate(${x(d.company)}, 0)`)
            .each(function(d, i) {
                const g = d3.select(this);

                // Draw the main bar (building)
                g.append("rect")
                    .attr("x", 0)
                    .attr("y", y(d.payRatio))
                    .attr("width", x.bandwidth())
                    .attr("height", height - y(d.payRatio))
                    .attr("fill", "darkgray")
                    .on("mouseover", () => {
                        selectedCompany = d;
                    });

                // Draw the triangle roof
                g.append("polygon")
                    .attr("points", `
                        ${x.bandwidth() / 2},${y(d.payRatio) - 10}
                        0,${y(d.payRatio)}
                        ${x.bandwidth()},${y(d.payRatio)}
                    `)
                    .attr("fill", "gray");

                // Add windows
                const windowHeight = 15;
                const windowWidth = x.bandwidth() / 3;
                const windowSpacing = 5;
                const numWindows = Math.floor((height - y(d.payRatio) - 30) / (windowHeight + windowSpacing));
                for (let j = 0; j < numWindows; j++) {
                    g.append("rect")
                        .attr("x", (x.bandwidth() - windowWidth) / 2)
                        .attr("y", y(d.payRatio) + j * (windowHeight + windowSpacing) + windowSpacing)
                        .attr("width", windowWidth)
                        .attr("height", windowHeight)
                        .attr("fill", "lightgray");
                }

                // Add a door at the bottom
                const doorWidth = x.bandwidth() / 3;
                const doorHeight = 20;
                const doorX = (x.bandwidth() - doorWidth) / 2;
                g.append("rect")
                    .attr("x", doorX)
                    .attr("y", height - doorHeight)
                    .attr("width", doorWidth)
                    .attr("height", doorHeight)
                    .attr("fill", "saddlebrown");

                // Add a vertical line in the middle of the door
                g.append("line")
                    .attr("x1", doorX + doorWidth / 2)
                    .attr("y1", height - doorHeight)
                    .attr("x2", doorX + doorWidth / 2)
                    .attr("y2", height)
                    .attr("stroke", "black")
                    .attr("stroke-width", "1");
            });

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(title);

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", -40)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "12px")
            .text("Pay Ratio");
    }
</script>

<style>
    .details-container {
        display: flex;
        align-items: flex-start;
        margin-top: 20px;
        font-family: sans-serif;
    }

    .company-details {
        margin-right: 20px;
    }

    .implications {
        max-width: 500px;
    }

    .chart-container {
        display: flex;
        justify-content: space-around;
    }

    .blurb {
        font-family: sans-serif;
        margin-bottom: 20px;
    }

    .bar rect {
        stroke: black;
        stroke-width: 1px;
        shape-rendering: crispEdges;
    }
</style>


<div class="blurb">
    <br><br><hr><br><br>
    
    <!-- <line></line> -->
    
    <p style="padding-left: 200px; padding-right: 200px">
        In today's corporate world, the disparity between the pay of top executives and that of average workers has become a topic of intense debate. The pay ratio, calculated by dividing the CEO's total compensation by the median employee's total compensation, serves as a stark indicator of this inequality. Our visualizations aim to shed light on these disparities, highlighting the significant gaps that exist within different companies.

        The first chart showcases the top 10 companies with the highest pay ratios, primarily from industries such as food, beverage, retail, and consumer goods. The second chart presents the bottom 10 companies with the lowest pay ratios, mostly from the technology, pharmaceutical, and financial sectors. This comparison highlights the stark differences in pay disparities across various industries.
    </p>
</div>

<div class="chart-container">
    <div id="chart-top10"></div>
    <div id="chart-bottom10"></div>
</div>

<div class="details-container">
    {#if selectedCompany}
        <div class="company-details">
            <p><strong>Company:</strong> {selectedCompany.company}</p>
            <p><strong>CEO:</strong> {selectedCompany.ceo}</p>
            <p><strong>CEO Pay:</strong> ${selectedCompany.ceoPay}</p>
            <p><strong>Average Worker Pay:</strong> ${selectedCompany.employeePay}</p>
            <p><strong>Pay Ratio:</strong> {selectedCompany.payRatio}</p>
            <p><strong>Industry:</strong> {selectedCompany.Industry}</p>
        </div>
    {/if}
    <div class="implications">
        <p>
            By hovering over the bars in these charts, you can see detailed information about each company's CEO pay, average worker pay, and pay ratio.
        </p>
        <p>
            Are high pay ratios a necessary evil in driving corporate success, or do they signify a deeper need for structural reform in executive compensation? As you explore the visualizations, consider the potential consequences of these pay ratios on employee morale, company culture, and societal perceptions of fairness and equality. Our goal is not just to present the data, but to inspire conversations about how we can create a more balanced and equitable corporate landscape.
        </p>
    </div>
</div>

<div class="credit">
    Data source: <a href="https://www.kaggle.com/datasets/alanjo/highest-paid-ceos-total-compensation" target="_blank">Kaggle - Highest Paid CEOs Total Compensation</a>
</div>