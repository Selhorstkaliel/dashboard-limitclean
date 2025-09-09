// Charts functionality using Chart.js
let clientsStatusChart = null;
let contractsChart = null;
let ticketsChart = null;

// Chart.js default configuration for dark theme
Chart.defaults.backgroundColor = 'rgba(0, 212, 255, 0.1)';
Chart.defaults.borderColor = 'rgba(0, 212, 255, 0.5)';
Chart.defaults.color = '#ffffff';

function initializeCharts(chartsData) {
    // Initialize all charts
    initClientsStatusChart(chartsData.clientsStatusChart);
    initContractsChart(chartsData.contractsChart);
    initTicketsChart(chartsData.ticketsChart);
}

function initClientsStatusChart(data) {
    const canvas = document.getElementById('clientsStatusChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (clientsStatusChart) {
        clientsStatusChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    clientsStatusChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || ['Restrição', 'Finalizado', 'Reprotocolo'],
            datasets: [{
                label: 'Clientes',
                data: data.data || [0, 0, 0],
                backgroundColor: [
                    'rgba(255, 170, 0, 0.7)',
                    'rgba(0, 255, 136, 0.7)',
                    'rgba(255, 51, 102, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 170, 0, 1)',
                    'rgba(0, 255, 136, 1)',
                    'rgba(255, 51, 102, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b8b8cc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b8b8cc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function initContractsChart(data) {
    const canvas = document.getElementById('contractsChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (contractsChart) {
        contractsChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    contractsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Contratos',
                data: data.data || [0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                borderColor: 'rgba(0, 212, 255, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b8b8cc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#b8b8cc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

function initTicketsChart(data) {
    const canvas = document.getElementById('ticketsChart');
    if (!canvas) return;
    
    // Destroy existing chart
    if (ticketsChart) {
        ticketsChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    ticketsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels || ['Aberto', 'Em Andamento', 'Resolvido'],
            datasets: [{
                data: data.data || [0, 0, 0],
                backgroundColor: [
                    'rgba(255, 51, 102, 0.7)',
                    'rgba(255, 170, 0, 0.7)',
                    'rgba(0, 255, 136, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 51, 102, 1)',
                    'rgba(255, 170, 0, 1)',
                    'rgba(0, 255, 136, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        padding: 20
                    }
                }
            }
        }
    });
}

// Update charts with new data
function updateCharts(chartsData) {
    if (clientsStatusChart && chartsData.clientsStatusChart) {
        clientsStatusChart.data.datasets[0].data = chartsData.clientsStatusChart.data;
        clientsStatusChart.update();
    }
    
    if (contractsChart && chartsData.contractsChart) {
        contractsChart.data.datasets[0].data = chartsData.contractsChart.data;
        contractsChart.update();
    }
    
    if (ticketsChart && chartsData.ticketsChart) {
        ticketsChart.data.datasets[0].data = chartsData.ticketsChart.data;
        ticketsChart.update();
    }
}

// Make functions available globally
window.initializeCharts = initializeCharts;
window.updateCharts = updateCharts;