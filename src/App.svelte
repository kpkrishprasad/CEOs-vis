<script>
	import LineChart from './components/LineChart.svelte';
	import Scatterplot from './components/Scatterplot.svelte';
	import Top10Bottom10 from './components/Top10Bottom10.svelte';
  </script>
  
  <main>
	<h1>CEO Data Visualizations</h1>
	<p>Lacha Barton-Gluzman, Krish Prasad, Ishaan Bal</p>

	<LineChart />
	<Scatterplot />
	<Top10Bottom10 />
  </main>
  
  <style>
	main {
	  width: 80%;
	  margin: auto;
	  text-align: center;
	}
	h1 {
		font-family: Arial, sans-serif;
		line-height: 1; /* Double spacing */
		font-style: italic;
		font-weight: 1500;
		font-size: 70px;
		/* padding-left: 400px; Adjust the padding as needed */
		
	}
  </style>
  