document.addEventListener('DOMContentLoaded', () => {
    // Add delay for smooth page load animation
    const initChart = () => {
        const chartElement = document.getElementById('chart');
        if (!chartElement) {
            console.error('Canvas element not found.');
            return;
        }

        const ChartJS = window.Chart;
        if (!ChartJS) {
            console.error('Chart.js failed to load.');
            return;
        }

    const forecastItems = document.querySelectorAll('.forecast-item');
    const temps = [];
    const times = [];

    if (forecastItems.length > 0) {
        forecastItems.forEach((item) => {
            const time = item.querySelector('.forecast-time')?.textContent?.trim();
            const tempText = item.querySelector('.forecast-temperatureValue')?.textContent?.trim();

            if (!time || !tempText) {
                return;
            }

            // Skip if temp is '--' or invalid
            if (tempText === '--' || tempText === '---') {
                return;
            }

            const temp = parseFloat(tempText);
            if (Number.isNaN(temp)) {
                return;
            }

            times.push(time);
            temps.push(temp);
        });
    }

    // If no valid data, create placeholder data for empty state
    const hasData = temps.length > 0 && times.length > 0;
    const finalTemps = hasData ? temps : [0, 0, 0, 0, 0];
    const finalTimes = hasData ? times : ['--', '--', '--', '--', '--'];

    const ctx = chartElement.getContext('2d');
    const container = chartElement.parentElement;
    const height = container?.offsetHeight || chartElement.offsetHeight || 200;
    // Ensure width doesn't exceed container width, especially for laptop screens
    const containerWidth = container?.offsetWidth || container?.clientWidth || 0;
    const elementWidth = chartElement.offsetWidth || chartElement.clientWidth || 0;
    const width = Math.min(elementWidth || containerWidth || 800, containerWidth || 800);

    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, '#f37322');
    lineGradient.addColorStop(1, '#f9aa31');

    const fillGradient = ctx.createLinearGradient(0, 0, 0, height);
    fillGradient.addColorStop(0, hasData ? 'rgba(243, 115, 34, 0.35)' : 'rgba(255, 255, 255, 0.05)');
    fillGradient.addColorStop(1, hasData ? 'rgba(243, 115, 34, 0)' : 'rgba(255, 255, 255, 0)');

    new ChartJS(ctx, {
        type: 'line',
        data: {
            labels: finalTimes,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: finalTemps,
                    borderColor: hasData ? lineGradient : 'rgba(255, 255, 255, 0.2)',
                    backgroundColor: fillGradient,
                    borderWidth: hasData ? 3 : 2,
                    fill: true,
                    tension: 0.45,
                    pointRadius: hasData ? 4 : 0,
                    pointHoverRadius: hasData ? 6 : 0,
                    pointBackgroundColor: '#f9aa31',
                    pointBorderColor: '#111827',
                    pointBorderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: hasData,
                    backgroundColor: '#111827',
                    titleColor: '#f9fafb',
                    bodyColor: '#f9fafb',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => {
                            if (!hasData || context.parsed.y === null) return ' No data';
                            return ` ${context.parsed.y.toFixed(1)}°C`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        drawOnChartArea: false,
                        color: 'rgba(255,255,255,0.1)',
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.7)',
                        font: {
                            size: 11,
                            weight: '500',
                        },
                        maxRotation: 0,
                        autoSkip: false,
                    },
                    border: {
                        display: false,
                    },
                },
                y: {
                    display: false,
                    grid: {
                        drawOnChartArea: false,
                    },
                    beginAtZero: false,
                },
            },
            animation: {
                duration: hasData ? 750 : 0,
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            layout: {
                padding: {
                    left: 8,
                    right: 8,
                    top: 8,
                    bottom: 8,
                },
            },
        },
    });
    };

    // Delay chart initialization to allow page load animations to complete
    setTimeout(initChart, 800);
});