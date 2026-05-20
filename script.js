let equations = [];
const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
let colorIndex = 0;

function getNextColor() {
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    return color;
}

function addEquation() {
    const input = document.getElementById('equation');
    const equationStr = input.value.trim();
    
    if (!equationStr) {
        alert('Por favor ingresa una ecuación');
        return;
    }

    try {
        // Validar la ecuación
        math.evaluate(equationStr, { x: 1 });
        
        const equation = {
            id: Date.now(),
            expression: equationStr,
            color: getNextColor(),
            visible: true
        };
        
        equations.push(equation);
        input.value = '';
        updateEquationsList();
        updateGraph();
    } catch (error) {
        alert('Ecuación inválida: ' + error.message);
    }
}

function removeEquation(id) {
    equations = equations.filter(eq => eq.id !== id);
    updateEquationsList();
    updateGraph();
}

function toggleEquation(id) {
    const eq = equations.find(e => e.id === id);
    if (eq) {
        eq.visible = !eq.visible;
        updateEquationsList();
        updateGraph();
    }
}

function updateEquationsList() {
    const list = document.getElementById('equationsList');
    
    if (equations.length === 0) {
        list.innerHTML = '<p class="text-slate-400 text-sm">No hay ecuaciones agregadas</p>';
        return;
    }

    list.innerHTML = equations.map(eq => `
        <div class="flex items-center gap-3 bg-slate-700/50 rounded-lg px-3 py-2">
            <input 
                type="checkbox" 
                ${eq.visible ? 'checked' : ''} 
                onchange="toggleEquation(${eq.id})"
                class="w-4 h-4 accent-blue-500"
            >
            <div class="w-4 h-4 rounded-full" style="background-color: ${eq.color}"></div>
            <span class="flex-1 font-mono text-sm">y = ${eq.expression}</span>
            <button 
                onclick="removeEquation(${eq.id})"
                class="text-red-400 hover:text-red-300 transition-colors"
            >
                ✕
            </button>
        </div>
    `).join('');
}

function evaluateEquation(expression, x) {
    try {
        return math.evaluate(expression, { x: x });
    } catch (error) {
        return null;
    }
}

function updateGraph() {
    const xMin = parseFloat(document.getElementById('xMin').value) || -10;
    const xMax = parseFloat(document.getElementById('xMax').value) || 10;
    const yMin = parseFloat(document.getElementById('yMin').value) || -10;
    const yMax = parseFloat(document.getElementById('yMax').value) || 10;

    const step = (xMax - xMin) / 500;
    const xValues = [];
    for (let x = xMin; x <= xMax; x += step) {
        xValues.push(x);
    }

    const traces = equations
        .filter(eq => eq.visible)
        .map(eq => {
            const yValues = xValues.map(x => {
                const y = evaluateEquation(eq.expression, x);
                return (y !== null && isFinite(y) && !isNaN(y)) ? y : null;
            });

            return {
                x: xValues,
                y: yValues,
                type: 'scatter',
                mode: 'lines',
                name: `y = ${eq.expression}`,
                line: {
                    color: eq.color,
                    width: 2
                }
            };
        });

    const layout = {
        title: {
            text: 'Gráfico de Ecuaciones',
            font: { color: '#ffffff', size: 20 }
        },
        xaxis: {
            title: 'X',
            range: [xMin, xMax],
            gridcolor: '#475569',
            zerolinecolor: '#94a3b8',
            tickfont: { color: '#94a3b8' },
            titlefont: { color: '#94a3b8' }
        },
        yaxis: {
            title: 'Y',
            range: [yMin, yMax],
            gridcolor: '#475569',
            zerolinecolor: '#94a3b8',
            tickfont: { color: '#94a3b8' },
            titlefont: { color: '#94a3b8' }
        },
        plot_bgcolor: 'rgba(30, 41, 59, 0.5)',
        paper_bgcolor: 'rgba(30, 41, 59, 0.3)',
        legend: {
            font: { color: '#94a3b8' },
            bgcolor: 'rgba(30, 41, 59, 0.8)'
        },
        margin: { t: 60, r: 20, b: 60, l: 60 }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };

    Plotly.newPlot('graph', traces, layout, config);
}

function setExample(expr) {
    document.getElementById('equation').value = expr;
}

// Agregar ecuación al presionar Enter
document.getElementById('equation').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addEquation();
    }
});

// Inicializar con una ecuación de ejemplo
window.onload = function() {
    document.getElementById('equation').value = 'x^2';
    addEquation();
};
