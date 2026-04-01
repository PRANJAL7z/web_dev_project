// Navigation function to show different pages
function showPage(pageId) {
    // Hide all page sections
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => page.classList.add('hidden'));
    
    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }
    
    // Update active nav button styling
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    // Try to activate the nav button corresponding to this pageId by inspecting onclick attribute
    for (const btn of navButtons) {
        const onclickAttr = btn.getAttribute('onclick') || '';
        // Matches patterns like showPage('home') or showPage("home")
        if (onclickAttr.includes("'" + pageId + "'") || onclickAttr.includes('"' + pageId + '"')) {
            btn.classList.add('active');
            break;
        }
    }
}

// Fetch FIRs from the backend API
async function fetchFIRs() {
    try {
        const response = await fetch('/api/firs');
        const firs = await response.json();
        
        const tableBody = document.getElementById('fir-table-body');
        const firCount = document.getElementById('fir-count');
        
        tableBody.innerHTML = '';
        firCount.textContent = firs.length;
        
        firs.forEach(fir => {
            const row = document.createElement('tr');
            
            // Determine status badge styling
            let statusClass = 'status-investigation';
            let statusIcon = 'fa-exclamation-circle';
            
            if (fir.status === 'Open' || fir.status === 'Under Investigation') {
                statusClass = 'status-investigation';
                statusIcon = 'fa-exclamation-circle';
            } else if (fir.status === 'Registered') {
                statusClass = 'status-registered';
                statusIcon = 'fa-clock';
            } else if (fir.status === 'Closed') {
                statusClass = 'status-closed';
                statusIcon = 'fa-check-circle';
            }
            
            // Determine importance score styling
            let scoreColor = 'color: #4ade80;'; // Green for low
            if (fir.score >= 0.7) {
                scoreColor = 'color: #f87171; font-weight: 700;'; // Red for high
            } else if (fir.score >= 0.5) {
                scoreColor = 'color: #fbbf24; font-weight: 600;'; // Yellow for medium
            }
            
            row.innerHTML = `
                <td>${fir.id}</td>
                <td>${fir.name}</td>
                <td>${fir.type}</td>
                <td>${fir.date}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i> ${fir.status}
                    </span>
                </td>
                <td style="${scoreColor}">${fir.score}</td>
                <td>
                    <button class="action-btn" onclick="viewFIR('${fir.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching FIRs:', error);
        document.getElementById('fir-table-body').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">
                    Failed to load FIR data. Please ensure the server is running.
                </td>
            </tr>
        `;
    }
}

// Fetch Criminals from the backend API
async function fetchCriminals() {
    try {
        const response = await fetch('/api/criminals');
        const criminals = await response.json();
        
        const tableBody = document.getElementById('criminal-table-body');
        const criminalCount = document.getElementById('criminal-count');
        
        if (tableBody) {
            tableBody.innerHTML = '';
            criminalCount.textContent = criminals.length;
            
            criminals.forEach(criminal => {
                const row = document.createElement('tr');
                
                // Determine risk level styling
                let riskClass = 'status-closed'; // Low risk - green
                if (criminal.riskLevel === 'High') {
                    riskClass = 'status-investigation'; // High risk - red
                } else if (criminal.riskLevel === 'Medium') {
                    riskClass = 'status-registered'; // Medium risk - yellow
                }
                
                // Determine status styling
                let statusClass = 'status-registered';
                let statusIcon = 'fa-clock';
                if (criminal.status === 'Registered') {
                    statusClass = 'status-registered';
                    statusIcon = 'fa-clock';
                } else if (criminal.status === 'Under Investigation') {
                    statusClass = 'status-investigation';
                    statusIcon = 'fa-exclamation-circle';
                } else if (criminal.status === 'Closed') {
                    statusClass = 'status-closed';
                    statusIcon = 'fa-check-circle';
                } else if (criminal.status === 'Active') {
                    statusClass = 'status-investigation';
                    statusIcon = 'fa-exclamation-circle';
                } else if (criminal.status === 'Arrested') {
                    statusClass = 'status-registered';
                    statusIcon = 'fa-clock';
                } else if (criminal.status === 'Released') {
                    statusClass = 'status-closed';
                    statusIcon = 'fa-check-circle';
                }
                
                row.innerHTML = `
                    <td>${criminal.id}</td>
                    <td>${criminal.name}</td>
                    <td>${criminal.crimeType}</td>
                    <td>${criminal.date}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${criminal.status}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${riskClass}">
                            <i class="fas fa-shield-alt"></i> ${criminal.riskLevel}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn" onclick="viewCriminal('${criminal.id}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="editCriminalStatus('${criminal.id}')" title="Edit Status" style="margin-left: 0.5rem;">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching criminals:', error);
    }
}

// Fetch Evidence from the backend API
async function fetchEvidence() {
    try {
        const response = await fetch('/api/evidence');
        const evidence = await response.json();
        
        // Update evidence stats
        const documentCount = evidence.filter(e => e.evidenceType === 'Document').length;
        const imageCount = evidence.filter(e => e.evidenceType === 'Image').length;
        const videoCount = evidence.filter(e => e.evidenceType === 'Video').length;
        const audioCount = evidence.filter(e => e.evidenceType === 'Audio').length;
        
        // Update stats display
        const statsElements = document.querySelectorAll('.evidence-stat h3');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = imageCount;
            statsElements[1].textContent = documentCount;
            statsElements[2].textContent = videoCount;
            statsElements[3].textContent = audioCount;
        }
        
        // Update evidence grid with document-based evidence
        const evidenceGrid = document.querySelector('.evidence-grid');
        if (evidenceGrid) {
            evidenceGrid.innerHTML = '';
            
            // Show first 6 evidence items
            evidence.slice(0, 6).forEach(item => {
                const evidenceItem = document.createElement('div');
                evidenceItem.className = 'evidence-item';
                
                const iconClass = item.evidenceType === 'Document' ? 'fa-file-alt' : 
                                 item.evidenceType === 'Image' ? 'fa-image' :
                                 item.evidenceType === 'Video' ? 'fa-video' : 'fa-microphone';
                
                const badgeClass = item.evidenceType === 'Document' ? 'badge-blue' : 
                                  item.evidenceType === 'Image' ? 'badge-cyan' :
                                  item.evidenceType === 'Video' ? 'badge-blue' : 'badge-orange';
                
                evidenceItem.innerHTML = `
                    <div class="evidence-preview ${item.evidenceType === 'Document' ? 'evidence-doc' : ''}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <span class="evidence-badge ${badgeClass}">
                        <i class="fas ${iconClass}"></i> ${item.evidenceType.toLowerCase()}
                    </span>
                `;
                
                evidenceGrid.appendChild(evidenceItem);
            });
        }
    } catch (error) {
        console.error('Error fetching evidence:', error);
    }
}

// Fetch Officers from the backend API
async function fetchOfficers() {
    try {
        const response = await fetch('/api/officers');
        const officers = await response.json();
        
        // Update officer stats
        const activeCount = officers.filter(o => o.status === 'Active').length;
        const onLeaveCount = officers.filter(o => o.status === 'On Leave').length;
        const suspendedCount = officers.filter(o => o.status === 'Suspended').length;
        
        // Update stats display
        const officerStatsElements = document.querySelectorAll('.evidence-stat h3');
        if (officerStatsElements.length >= 4) {
            officerStatsElements[0].textContent = activeCount;
            officerStatsElements[1].textContent = onLeaveCount;
            officerStatsElements[2].textContent = suspendedCount;
            officerStatsElements[3].textContent = Math.floor(officers.length * 2.5); // Average experience
        }
        
        // Update officers grid
        const officersGrid = document.querySelector('.officers-grid');
        if (officersGrid) {
            officersGrid.innerHTML = '';
            
            officers.forEach(officer => {
                const officerCard = document.createElement('div');
                officerCard.className = 'officer-card';
                
                const statusClass = officer.status === 'Active' ? 'status-active' : 'status-inactive';
                const badgeClass = officer.rank.includes('Inspector') ? 'badge-blue' :
                                 officer.rank.includes('Sub-Inspector') ? 'badge-orange' :
                                 officer.rank.includes('Head Constable') ? 'badge-blue' :
                                 officer.rank.includes('Assistant Sub-Inspector') ? 'badge-orange' : 'badge-blue';
                
                officerCard.innerHTML = `
                    <div class="officer-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <span class="officer-badge ${badgeClass}">${officer.rank}</span>
                    <span class="officer-status ${statusClass}">${officer.status}</span>
                    <h3>${officer.name}</h3>
                    <p><i class="fas fa-id-badge"></i> ${officer.id}</p>
                `;
                
                officersGrid.appendChild(officerCard);
            });
        }
    } catch (error) {
        console.error('Error fetching officers:', error);
    }
}

// Fetch Crime Analysis data and create bar graph
async function fetchCrimeAnalysis() {
    try {
        const response = await fetch('/api/crime-analysis');
        const data = await response.json();
        
        if (data.error) {
            console.error('Error fetching crime analysis data:', data.error);
            return;
        }
        
        // Update stats
        document.getElementById('total-cities').textContent = data.total_cities;
        document.getElementById('total-crimes').textContent = data.total_crimes;
        document.getElementById('analysis-date').textContent = data.analysis_date;
        
        // Create regression graph
        if (data.regression_data && data.regression_model) {
            createRegressionChart(data.regression_data, data.regression_model);
        }
        
        // Create bar graph
        createBarGraph(data.city_rankings);
        
        // Create trend chart
        if (data.future_trends) {
            createTrendChart(data.future_trends);
        }
        
        // Update officer distribution
        updateOfficerDistribution(data.officer_distribution);
        
        // Update city rankings with predictions
        updateCityRankings(data.city_rankings, data.future_trends);
        
    } catch (error) {
        console.error('Error fetching crime analysis data:', error);
    }
}

function createRegressionChart(regressionData, model) {
    const canvas = document.getElementById('regressionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Linear Regression: Crime Count vs Average Score', canvas.width / 2, 30);
    
    if (regressionData.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calculate dimensions
    const margin = 60;
    const chartWidth = canvas.width - 2 * margin;
    const chartHeight = canvas.height - 2 * margin;
    
    // Find min and max values
    const maxCrimeCount = Math.max(...regressionData.map(d => d.crime_count));
    const maxScore = Math.max(...regressionData.map(d => Math.max(d.actual_score, d.predicted_score)));
    const minScore = Math.min(...regressionData.map(d => Math.min(d.actual_score, d.predicted_score)));
    
    // Function to convert data to canvas coordinates
    const toX = (crimeCount) => margin + (crimeCount / maxCrimeCount) * chartWidth;
    const toY = (score) => canvas.height - margin - ((score - minScore) / (maxScore - minScore)) * chartHeight;
    
    // Draw regression line (BLACK)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const sortedData = [...regressionData].sort((a, b) => a.crime_count - b.crime_count);
    sortedData.forEach((point, index) => {
        const x = toX(point.crime_count);
        const y = toY(point.predicted_score);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw actual data points with color grading based on danger level
    regressionData.forEach(point => {
        const x = toX(point.crime_count);
        const y = toY(point.actual_score);
        
        // Calculate color based on score (0 to 1 scale)
        // Green (low danger) to Yellow to Red (high danger)
        const normalizedScore = (point.actual_score - minScore) / (maxScore - minScore);
        
        let fillColor, borderColor;
        if (normalizedScore < 0.33) {
            // Low danger - Green
            const intensity = normalizedScore / 0.33;
            const red = Math.floor(34 + (255 - 34) * intensity);
            const green = Math.floor(197 + (255 - 197) * (1 - intensity));
            fillColor = `rgb(${red}, ${green}, 94)`;
            borderColor = `rgb(${Math.floor(red * 0.8)}, ${Math.floor(green * 0.8)}, 74)`;
        } else if (normalizedScore < 0.67) {
            // Medium danger - Yellow/Orange
            const intensity = (normalizedScore - 0.33) / 0.34;
            const red = 255;
            const green = Math.floor(255 - (255 - 146) * intensity);
            fillColor = `rgb(${red}, ${green}, 60)`;
            borderColor = `rgb(${Math.floor(red * 0.8)}, ${Math.floor(green * 0.8)}, 40)`;
        } else {
            // High danger - Red
            const intensity = (normalizedScore - 0.67) / 0.33;
            const red = 255;
            const green = Math.floor(146 * (1 - intensity));
            fillColor = `rgb(${red}, ${green}, 60)`;
            borderColor = `rgb(${Math.floor(red * 0.8)}, ${Math.floor(green * 0.8)}, 40)`;
        }
        
        // Draw point with danger-based color
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw city label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(point.city, x, y - 12);
        
        // Draw score value below city name
        ctx.font = '9px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(point.actual_score.toFixed(2), x, y - 2);
    });
    
    // Draw axes
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.stroke();
    
    // X-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
        const value = Math.round((maxCrimeCount * i) / 5);
        const x = margin + (chartWidth * i) / 5;
        ctx.fillText(value, x, canvas.height - margin + 20);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (minScore + ((maxScore - minScore) * i) / 5).toFixed(2);
        const y = canvas.height - margin - (chartHeight * i) / 5;
        ctx.fillText(value, margin - 10, y + 4);
    }
    
    // Axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Number of Crimes', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Average Crime Score', 0, 0);
    ctx.restore();
    
    // Add legend
    const legendX = canvas.width - 180;
    const legendY = 60;
    
    // Regression line legend (BLACK)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Regression Line', legendX + 35, legendY + 4);
    
    // Color gradient legend
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Danger Level:', legendX, legendY + 25);
    
    // Low danger - Green
    ctx.fillStyle = 'rgb(34, 197, 94)';
    ctx.beginPath();
    ctx.arc(legendX + 15, legendY + 45, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgb(27, 157, 74)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '11px Arial';
    ctx.fillText('Low', legendX + 25, legendY + 49);
    
    // Medium danger - Yellow/Orange
    ctx.fillStyle = 'rgb(251, 191, 36)';
    ctx.beginPath();
    ctx.arc(legendX + 70, legendY + 45, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgb(200, 150, 28)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Medium', legendX + 80, legendY + 49);
    
    // High danger - Red
    ctx.fillStyle = 'rgb(239, 68, 68)';
    ctx.beginPath();
    ctx.arc(legendX + 140, legendY + 45, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgb(190, 54, 54)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('High', legendX + 150, legendY + 49);
    
    // Update regression equation and R² score
    const equation = `y = ${model.coefficient.toFixed(4)}x + ${model.intercept.toFixed(4)}`;
    document.getElementById('regression-equation').textContent = equation;
    document.getElementById('r-squared').textContent = model.r_squared.toFixed(4);
}

function createBarGraph(cityRankings) {
    const canvas = document.getElementById('crimeBarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('City Crime Rankings', canvas.width / 2, 30);
    
    if (cityRankings.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calculate dimensions
    const margin = 60;
    const chartWidth = canvas.width - 2 * margin;
    const chartHeight = canvas.height - 2 * margin;
    const barWidth = chartWidth / cityRankings.length;
    const maxScore = Math.max(...cityRankings.map(city => city.avg_score));
    
    // Draw bars
    cityRankings.forEach((city, index) => {
        const barHeight = (city.avg_score / maxScore) * chartHeight;
        const x = margin + index * barWidth;
        const y = canvas.height - margin - barHeight;
        
        // Bar color based on score
        const intensity = city.avg_score / maxScore;
        const red = Math.floor(255 * intensity);
        const blue = Math.floor(255 * (1 - intensity));
        ctx.fillStyle = `rgb(${red}, 100, ${blue})`;
        
        // Draw bar
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        // Draw city name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth / 2, canvas.height - margin + 20);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(city.city, 0, 0);
        ctx.restore();
        
        // Draw score
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(city.avg_score.toFixed(2), x + barWidth / 2, y - 5);
    });
    
    // Draw axes
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (maxScore * i) / 5;
        const y = canvas.height - margin - (chartHeight * i) / 5;
        ctx.fillText(value.toFixed(2), margin - 10, y + 4);
    }
    
    // Axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cities', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Crime Score', 0, 0);
    ctx.restore();
}

function updateOfficerDistribution(officerDistribution) {
    const container = document.getElementById('officer-distribution');
    if (!container) return;
    
    container.innerHTML = '';
    
    officerDistribution.forEach(dist => {
        const distItem = document.createElement('div');
        distItem.className = 'officer-dist-item';
        
        distItem.innerHTML = `
            <div class="officer-dist-city">${dist.city}</div>
            <div class="officer-count">${dist.officers_assigned}</div>
            <div class="officer-details">
                Score: ${dist.crime_score} | Crimes: ${dist.crime_count}
            </div>
        `;
        
        container.appendChild(distItem);
    });
}

function createTrendChart(futureTrends) {
    const canvas = document.getElementById('crimeTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Predicted Crime Trends (Linear Regression)', canvas.width / 2, 30);
    
    if (futureTrends.length === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calculate dimensions
    const margin = 60;
    const chartWidth = canvas.width - 2 * margin;
    const chartHeight = canvas.height - 2 * margin;
    
    // Get top 5 cities for clarity
    const topCities = futureTrends.slice(0, 5);
    
    // Find max value for scaling
    const maxValue = Math.max(...topCities.map(city => 
        Math.max(city.current_score, city.predicted_month_1, city.predicted_month_2, city.predicted_month_3)
    ));
    
    const xStep = chartWidth / 3;
    const yStep = chartHeight / topCities.length;
    
    // Draw lines for each city
    topCities.forEach((city, index) => {
        const y = margin + index * yStep + yStep / 2;
        const values = [city.current_score, city.predicted_month_1, city.predicted_month_2, city.predicted_month_3];
        
        // Color based on trend
        const colors = ['#22d3ee', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 3;
        
        // Draw line
        ctx.beginPath();
        values.forEach((value, i) => {
            const x = margin + i * xStep;
            const scaledValue = (value / maxValue) * (chartHeight * 0.3);
            const plotY = y - scaledValue / 2;
            
            if (i === 0) {
                ctx.moveTo(x, plotY);
            } else {
                ctx.lineTo(x, plotY);
            }
            
            // Draw point
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.arc(x, plotY, 5, 0, 2 * Math.PI);
            ctx.fill();
        });
        ctx.stroke();
        
        // Draw city name
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(city.city, margin - 50, y + 4);
    });
    
    // Draw x-axis labels
    const labels = ['Current', 'Month +1', 'Month +2', 'Month +3'];
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
        const x = margin + i * xStep;
        ctx.fillText(label, x, canvas.height - margin + 20);
    });
    
    // Draw axes
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin, canvas.height - margin);
    ctx.lineTo(canvas.width - margin, canvas.height - margin);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, canvas.height - margin);
    ctx.stroke();
}

function updateCityRankings(cityRankings, futureTrends) {
    const container = document.getElementById('city-rankings');
    if (!container) return;
    
    container.innerHTML = '';
    
    cityRankings.forEach((city, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = 'city-rank-item';
        
        const rankColor = index < 3 ? '#ef4444' : index < 6 ? '#f97316' : '#22c55e';
        
        // Find prediction for this city
        const prediction = futureTrends ? futureTrends.find(t => t.city === city.city) : null;
        const predictedScore = prediction ? prediction.predicted_month_3 : city.avg_score;
        const trend = prediction ? prediction.trend : 'Stable';
        
        rankItem.innerHTML = `
            <div class="city-rank-info">
                <div class="city-rank-name">#${index + 1} ${city.city}</div>
                <div class="city-rank-details">
                    ${city.crime_count} crimes | Current: ${city.avg_score} | 
                    Predicted (3mo): ${predictedScore.toFixed(3)} 
                    <span style="color: ${trend === 'Increasing' ? '#ef4444' : '#22c55e'}">
                        ${trend === 'Increasing' ? '↑' : '→'}
                    </span>
                </div>
            </div>
            <div class="city-rank-score" style="background: ${rankColor}20; color: ${rankColor}">
                ${city.avg_score}
            </div>
        `;
        
        container.appendChild(rankItem);
    });
}

// Fetch Reports from the backend API
async function fetchReports() {
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();
        
        const tableBody = document.querySelector('#reports tbody');
        const reportsCount = document.getElementById('reports-count');
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            reports.forEach(report => {
                const row = document.createElement('tr');
                
                // Determine status badge styling
                let statusClass = 'status-review';
                let statusIcon = 'fa-exclamation-triangle';
                
                if (report.status === 'Pending') {
                    statusClass = 'status-investigation';
                    statusIcon = 'fa-clock';
                } else if (report.status === 'Under Review') {
                    statusClass = 'status-review';
                    statusIcon = 'fa-exclamation-triangle';
                } else if (report.status === 'Resolved') {
                    statusClass = 'status-closed';
                    statusIcon = 'fa-check-circle';
                }
                
                row.innerHTML = `
                    <td>${report.id}</td>
                    <td>${report.officerName}</td>
                    <td>${report.incidentType}</td>
                    <td>${report.date}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${report.status}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn" onclick="viewReport('${report.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
        
        if (reportsCount) {
            reportsCount.textContent = `Reports & Complaints (${reports.length})`;
        }
        
        // Update stats - find the correct stats section for reports page
        const pendingCount = reports.filter(r => r.status === 'Pending').length;
        const reviewCount = reports.filter(r => r.status === 'Under Review').length;
        const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
        
        // Update stats display - target the specific reports stats section
        const statsSection = document.getElementById('reports-stats');
        if (statsSection) {
            const statsElements = statsSection.querySelectorAll('h3');
            if (statsElements.length >= 3) {
                statsElements[0].textContent = pendingCount;
                statsElements[1].textContent = reviewCount;
                statsElements[2].textContent = resolvedCount;
            }
        }
        
    } catch (error) {
        console.error('Error fetching reports:', error);
    }
}

function viewReport(reportId) {
    alert(`Viewing details for Report: ${reportId}`);
}

// View functions
function viewFIR(firId) {
    alert(`Viewing details for FIR: ${firId}`);
    // In a real app, this would open a detailed view
}

function viewCriminal(criminalId) {
    alert(`Viewing details for Criminal: ${criminalId}`);
}

// Open report modal
function openReportModal() {
    const modal = document.getElementById('reportModal');
    modal.classList.add('active');
}

// Close report modal
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    modal.classList.remove('active');
}

// Open FIR modal
function openFIRModal() {
    const modal = document.getElementById('firModal');
    modal.classList.add('active');
}

// Close FIR modal
function closeFIRModal() {
    const modal = document.getElementById('firModal');
    modal.classList.remove('active');
}

// Submit FIR form
async function submitFIR(event) {
    event.preventDefault();
    
    const complainant = document.getElementById('fir-complainant').value;
    const type = document.getElementById('fir-type').value;
    const description = document.getElementById('fir-description').value;
    
    try {
        const response = await fetch('/api/firs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: complainant,
                type: type,
                description: description
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`FIR ${result.id} registered successfully!`);
            closeFIRModal();
            
            // Clear form
            document.getElementById('fir-complainant').value = '';
            document.getElementById('fir-type').value = '';
            document.getElementById('fir-description').value = '';
            
            // Refresh FIR list immediately
            await fetchFIRs();
        } else {
            alert('Failed to register FIR. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting FIR:', error);
        alert('Error submitting FIR. Please try again.');
    }
}

// Submit Criminal form
async function submitCriminal(event) {
    event.preventDefault();
    
    const name = document.getElementById('criminal-name').value;
    const crimeType = document.getElementById('criminal-type').value;
    const riskLevel = document.getElementById('criminal-risk').value;
    const details = document.getElementById('criminal-details').value;
    
    try {
        const response = await fetch('/api/criminals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                crimeType: crimeType,
                status: 'Active',
                riskLevel: riskLevel,
                details: details
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Criminal record ${result.id} added successfully!`);
            closeCriminalModal();
            
            // Clear form
            document.getElementById('criminal-name').value = '';
            document.getElementById('criminal-type').value = '';
            document.getElementById('criminal-risk').value = 'Low';
            document.getElementById('criminal-details').value = '';
            
            // Refresh criminal list
            await fetchCriminals();
        } else {
            alert('Failed to add criminal record. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting criminal record:', error);
        alert('Error submitting criminal record. Please try again.');
    }
}

// Open criminal modal
function openCriminalModal() {
    const modal = document.getElementById('criminalModal');
    modal.classList.add('active');
}

// Close criminal modal
function closeCriminalModal() {
    const modal = document.getElementById('criminalModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const reportModal = document.getElementById('reportModal');
    const firModal = document.getElementById('firModal');
    const criminalModal = document.getElementById('criminalModal');
    
    if (event.target === reportModal) {
        closeReportModal();
    }
    if (event.target === firModal) {
        closeFIRModal();
    }
    if (event.target === criminalModal) {
        closeCriminalModal();
    }
}

// Search and filter functionality for Criminals
document.addEventListener('DOMContentLoaded', () => {
    const criminalSearchInput = document.getElementById('criminal-search');
    const criminalFilters = document.querySelectorAll('#criminal-records .filter-select');
    
    if (criminalSearchInput) {
        criminalSearchInput.addEventListener('input', filterCriminals);
    }
    
    criminalFilters.forEach(filter => {
        filter.addEventListener('change', filterCriminals);
    });
});

function filterCriminals() {
    const searchTerm = document.getElementById('criminal-search')?.value.toLowerCase() || '';
    const statusFilter = document.querySelector('#criminal-records .filter-select:first-of-type')?.value || 'All Status';
    const crimeTypeFilter = document.querySelector('#criminal-records .filter-select:last-of-type')?.value || 'All Crime Types';
    const rows = document.querySelectorAll('#criminal-table-body tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
        const statusCell = row.querySelector('td:nth-child(5)')?.textContent || '';
        const crimeTypeCell = row.querySelector('td:nth-child(3)')?.textContent || '';
        
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = statusFilter === 'All Status' || statusCell.includes(statusFilter);
        const matchesCrimeType = crimeTypeFilter === 'All Crime Types' || crimeTypeCell.includes(crimeTypeFilter);
        
        if (matchesSearch && matchesStatus && matchesCrimeType) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
}

// Search and filter functionality for FIRs
document.addEventListener('DOMContentLoaded', () => {
    const firSearchInput = document.getElementById('fir-search');
    const firFilters = document.querySelectorAll('#firs .filter-select');
    
    if (firSearchInput) {
        firSearchInput.addEventListener('input', filterFIRs);
    }
    
    firFilters.forEach(filter => {
        filter.addEventListener('change', filterFIRs);
    });
});

function filterFIRs() {
    const searchTerm = document.getElementById('fir-search')?.value.toLowerCase() || '';
    const statusFilter = document.querySelector('#firs .filter-select:first-of-type')?.value || 'All Status';
    const crimeTypeFilter = document.querySelector('#firs .filter-select:last-of-type')?.value || 'All Crime Types';
    const rows = document.querySelectorAll('#fir-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const statusCell = row.querySelector('td:nth-child(5)')?.textContent || '';
        const crimeTypeCell = row.querySelector('td:nth-child(3)')?.textContent || '';
        
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = statusFilter === 'All Status' || statusCell.includes(statusFilter);
        const matchesCrimeType = crimeTypeFilter === 'All Crime Types' || crimeTypeCell.includes(crimeTypeFilter);
        
        if (matchesSearch && matchesStatus && matchesCrimeType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Fetch Documents from the backend API
async function fetchDocuments() {
    try {
        const response = await fetch('/api/documents');
        const documents = await response.json();
        
        const tableBody = document.getElementById('document-table-body');
        const documentCount = document.getElementById('document-count');
        
        if (tableBody) {
            tableBody.innerHTML = '';
            documentCount.textContent = documents.length;
            
            documents.forEach(doc => {
                const row = document.createElement('tr');
                
                // Determine status badge styling
                let statusClass = 'status-closed';
                let statusIcon = 'fa-check-circle';
                
                if (doc.status === 'Active') {
                    statusClass = 'status-investigation';
                    statusIcon = 'fa-file-alt';
                } else if (doc.status === 'Under Review') {
                    statusClass = 'status-registered';
                    statusIcon = 'fa-clock';
                } else if (doc.status === 'Archived') {
                    statusClass = 'status-closed';
                    statusIcon = 'fa-archive';
                }
                
                row.innerHTML = `
                    <td>${doc.id}</td>
                    <td>${doc.documentName}</td>
                    <td>${doc.documentType}</td>
                    <td>${doc.linkedPerson}</td>
                    <td>${doc.firId || 'N/A'}</td>
                    <td>${doc.dateAdded}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            <i class="fas ${statusIcon}"></i> ${doc.status}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn" onclick="viewDocument('${doc.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
}

function viewDocument(docId) {
    alert(`Viewing details for Document: ${docId}`);
}

// Search and filter functionality for Documents
document.addEventListener('DOMContentLoaded', () => {
    const documentSearchInput = document.getElementById('document-search');
    const documentTypeFilter = document.getElementById('document-type-filter');
    const documentStatusFilter = document.getElementById('document-status-filter');
    
    if (documentSearchInput) {
        documentSearchInput.addEventListener('input', filterDocuments);
    }
    
    if (documentTypeFilter) {
        documentTypeFilter.addEventListener('change', filterDocuments);
    }
    
    if (documentStatusFilter) {
        documentStatusFilter.addEventListener('change', filterDocuments);
    }
});

function filterDocuments() {
    const searchTerm = document.getElementById('document-search')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('document-type-filter')?.value || 'All Types';
    const statusFilter = document.getElementById('document-status-filter')?.value || 'All Status';
    const rows = document.querySelectorAll('#document-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const typeCell = row.querySelector('td:nth-child(3)')?.textContent || '';
        const statusCell = row.querySelector('td:nth-child(7)')?.textContent || '';
        
        const matchesSearch = text.includes(searchTerm);
        const matchesType = typeFilter === 'All Types' || typeCell.includes(typeFilter);
        const matchesStatus = statusFilter === 'All Status' || statusCell.includes(statusFilter);
        
        if (matchesSearch && matchesType && matchesStatus) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Submit FIR form
async function submitFIR(event) {
    event.preventDefault();
    
    const complainant = document.getElementById('fir-complainant').value;
    const type = document.getElementById('fir-type').value;
    const description = document.getElementById('fir-description').value;
    
    try {
        const response = await fetch('/api/firs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: complainant,
                type: type,
                description: description
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`FIR ${result.id} registered successfully!`);
            closeFIRModal();
            
            // Clear form
            document.getElementById('fir-complainant').value = '';
            document.getElementById('fir-type').value = '';
            document.getElementById('fir-description').value = '';
            
            // Refresh FIR list immediately
            await fetchFIRs();
        } else {
            alert('Failed to register FIR. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting FIR:', error);
        alert('Error submitting FIR. Please try again.');
    }
}

// Submit Criminal form
async function submitCriminal(event) {
    event.preventDefault();
    
    const name = document.getElementById('criminal-name').value;
    const crimeType = document.getElementById('criminal-type').value;
    const riskLevel = document.getElementById('criminal-risk').value;
    const details = document.getElementById('criminal-details').value;
    
    try {
        const response = await fetch('/api/criminals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                crimeType: crimeType,
                status: 'Registered',
                riskLevel: riskLevel,
                details: details
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Criminal record ${result.id} added successfully!`);
            closeCriminalModal();
            
            // Clear form
            document.getElementById('criminal-name').value = '';
            document.getElementById('criminal-type').value = '';
            document.getElementById('criminal-risk').value = 'Low';
            document.getElementById('criminal-details').value = '';
            
            // Refresh criminal list
            await fetchCriminals();
        } else {
            alert('Failed to add criminal record. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting criminal record:', error);
        alert('Error submitting criminal record. Please try again.');
    }
}

// Edit Criminal Status
async function editCriminalStatus(criminalId) {
    const newStatus = prompt('Enter new status (Registered/Under Investigation/Closed):', 'Under Investigation');
    
    if (!newStatus) return;
    
    const validStatuses = ['Registered', 'Under Investigation', 'Closed'];
    if (!validStatuses.includes(newStatus)) {
        alert('Invalid status! Please use: Registered, Under Investigation, or Closed');
        return;
    }
    
    try {
        const response = await fetch(`/api/criminals/${criminalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Criminal status updated to: ${newStatus}`);
            await fetchCriminals();
        } else {
            alert('Failed to update status. Please try again.');
        }
    } catch (error) {
        console.error('Error updating criminal status:', error);
        alert('Error updating status. Please try again.');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load all data
    fetchFIRs();
    fetchCriminals();
    fetchEvidence();
    fetchOfficers();
    fetchReports();
    fetchDocuments();
    
    // Initialize crime analysis
    fetchCrimeAnalysis();
    
    // Show home page by default
    const homeNav = document.querySelector('.nav-btn');
    if (homeNav) {
        homeNav.classList.add('active');
    }
});