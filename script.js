document.addEventListener('DOMContentLoaded', () => {
    const datePickerBtn = document.getElementById('datePickerBtn');
    const datePickerDropdown = document.getElementById('datePickerDropdown');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const selectedDateSpan = document.getElementById('selectedDate');
    const cancelBtn = datePickerDropdown.querySelector('.cancel-btn');
    const applyBtn = datePickerDropdown.querySelector('.apply-btn');
    const presetBtns = datePickerDropdown.querySelectorAll('.preset-btn');

    let isOpen = false;

    // Set default dates (last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    startDateInput.value = formatDate(sevenDaysAgo);
    endDateInput.value = formatDate(today);
    updateSelectedDateText(sevenDaysAgo, today);

    // Toggle dropdown
    datePickerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isOpen = !isOpen;
        datePickerDropdown.classList.toggle('active', isOpen);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!datePickerDropdown.contains(e.target) && !datePickerBtn.contains(e.target)) {
            isOpen = false;
            datePickerDropdown.classList.remove('active');
        }
    });

    // Handle preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const days = parseInt(btn.dataset.days);
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - days);

            startDateInput.value = formatDate(start);
            endDateInput.value = formatDate(end);
        });
    });

    // Handle apply button
    applyBtn.addEventListener('click', () => {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        
        if (startDate > endDate) {
            alert('Start date cannot be after end date');
            return;
        }

        updateSelectedDateText(startDate, endDate);
        isOpen = false;
        datePickerDropdown.classList.remove('active');
    });

    // Handle cancel button
    cancelBtn.addEventListener('click', () => {
        isOpen = false;
        datePickerDropdown.classList.remove('active');
    });

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function updateSelectedDateText(start, end) {
        const options = { month: 'short', day: 'numeric' };
        const startStr = start.toLocaleDateString('en-US', options);
        const endStr = end.toLocaleDateString('en-US', options);
        selectedDateSpan.textContent = `${startStr} - ${endStr}`;
    }

    // World Map Implementation
    const width = document.getElementById('world-map').clientWidth;
    const height = 400;
    const mapColor = '#6366f1';
    const mapHoverColor = '#818cf8';

    const svg = d3.select('#world-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto;');

    const projection = d3.geoMercator()
        .scale(width / 6.3)
        .center([0, 20])
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const countryData = {
        'USA': { amount: 519.75 },
        'China': { amount: 248.07 },
        'Germany': { amount: 190.57 },
        'Russia': { amount: 173.25 },
        'India': { amount: 63.00 }
    };

    // Load world map data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
        .then(data => {
            const countries = topojson.feature(data, data.objects.countries);

            // Draw map
            svg.selectAll('path')
                .data(countries.features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', d => {
                    const countryName = d.properties.name;
                    return countryData[countryName] ? mapColor : '#e5e7eb';
                })
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5)
                .on('mouseover', function(event, d) {
                    const countryName = d.properties.name;
                    if (countryData[countryName]) {
                        d3.select(this)
                            .attr('fill', mapHoverColor);
                        
                        // Highlight corresponding country in list
                        document.querySelector(`[data-country="${countryName}"]`)
                            ?.classList.add('highlighted');
                    }
                })
                .on('mouseout', function(event, d) {
                    const countryName = d.properties.name;
                    if (countryData[countryName]) {
                        d3.select(this)
                            .attr('fill', mapColor);
                        
                        // Remove highlight from country list
                        document.querySelector(`[data-country="${countryName}"]`)
                            ?.classList.remove('highlighted');
                    }
                });
        });

    // Handle country list item hover
    document.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('mouseover', () => {
            const country = item.dataset.country;
            svg.selectAll('path')
                .filter(d => d.properties.name === country)
                .attr('fill', mapHoverColor);
            item.classList.add('highlighted');
        });

        item.addEventListener('mouseout', () => {
            const country = item.dataset.country;
            svg.selectAll('path')
                .filter(d => d.properties.name === country)
                .attr('fill', mapColor);
            item.classList.remove('highlighted');
        });
    });
});

