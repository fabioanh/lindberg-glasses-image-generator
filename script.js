document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const frontSelect = document.getElementById('front-color');
    const backSelect = document.getElementById('back-color');
    const rimSelect = document.getElementById('rim-color');
    const perspectiveSelect = document.getElementById('perspective');
    const modelSelect = document.getElementById('model');

    const syncCheckbox = document.getElementById('sync-colors');

    const previewImage = document.getElementById('preview-image');
    const finalUrlInput = document.getElementById('final-url');
    const emptyState = document.getElementById('empty-state');
    const copyBtn = document.getElementById('copy-btn');

    // Shared Color Options
    const colorOptions = [
        { text: 'Navy Grey', value: 'U16' },
        { text: 'Bronze', value: 'U12' },
        { text: 'Blue', value: '107' },
        { text: 'Dark Blue', value: 'U13' },
        { text: 'Light Blue', value: '20' },
        { text: 'Sky Blue', value: '107' },
        { text: 'Wine', value: 'U14' },
        { text: 'Orange', value: 'U15' },
        { text: 'Black', value: 'U9' },
        { text: 'Light Silver', value: '05' },
        { text: 'Grey', value: '10' }
    ];

    /**
     * Populates a select element with options
     */
    function populateSelect(selectElement, options) {
        selectElement.innerHTML = '';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            selectElement.appendChild(option);
        });
    }

    // Initialize Dropdowns - Moved to function to allow dynamic updates

    // Eric Excluded Colors
    const ericExcludedColors = ['Light Silver', 'Orange', 'Wine', 'Sky Blue', 'Blue'];

    // State variable declaration
    let state;

    /**
     * Returns allowed color options for a given model
     */
    function getColorsForModel(modelId) {
        if (modelId === 'Eric') {
            return colorOptions.filter(opt => !ericExcludedColors.includes(opt.text));
        }
        return colorOptions;
    }

    /**
     * Updates the Front and Back dropdowns based on selected model
     */
    function updateColorDropdowns(modelId) {
        const allowedOptions = getColorsForModel(modelId);

        // Store current selections
        const currentFront = frontSelect.value;
        const currentBack = backSelect.value;

        // Populate Dropdowns
        populateSelect(frontSelect, allowedOptions);
        populateSelect(backSelect, allowedOptions);

        // Restore selections if valid, otherwise duplicate check logic handles default
        // Helper to set value safely
        function setSafeValue(select, value) {
            const exists = Array.from(select.options).some(opt => opt.value === value);
            if (exists) {
                select.value = value;
            } else {
                select.value = select.options[0].value;
            }
        }

        setSafeValue(frontSelect, currentFront);

        // Use DOM element directly to avoid state dependency issue during initialization
        if (syncCheckbox.checked) {
            // If linked, force back to match front (which might have just been reset)
            backSelect.value = frontSelect.value;
        } else {
            setSafeValue(backSelect, currentBack);
        }

        // Update state if initialized
        if (state) {
            state.front = frontSelect.value;
            state.back = backSelect.value;
        }

        // No need to call updateUI here as it will be called by the caller or subsequent state updates
    }

    // Initialize Dropdowns
    updateColorDropdowns(modelSelect.value);

    // State definition
    state = {
        base: "https://customiser-images.lindberg.com/model/{type_id}/{model_id}/{perspective}/{variant}/ACETATE",
        front: frontSelect.value,
        back: backSelect.value,
        rim: rimSelect.value,
        perspective: perspectiveSelect.value,
        model_id: modelSelect.value,
        conf_id: modelSelect.options[modelSelect.selectedIndex].getAttribute('data-conf'),
        get type_id() {
            return this.model_id === 'Eric' ? 'RIM' : 'TT';
        },
        get variant() {
            return this.model_id === 'Eric' ? 'RIM_BASIC' : '850';
        },
        linked: syncCheckbox.checked
    };

    /**
     * Constructs the final URL by replacing placeholders with current values
     */
    function buildUrl() {
        if (!state.base) return '';

        // Replace placeholders in base path
        let url = state.base;
        url = url.replace(/{type_id}/g, encodeURIComponent(state.type_id));
        url = url.replace(/{model_id}/g, encodeURIComponent(state.model_id));
        url = url.replace(/{perspective}/g, encodeURIComponent(state.perspective));
        url = url.replace(/{variant}/g, encodeURIComponent(state.variant));

        // Construct query parameters based on model
        let queryParams = [];
        const commonParams = `INNERRIM=${encodeURIComponent(state.rim)}&TEMPLE=${encodeURIComponent(state.back)}&CONF=${encodeURIComponent(state.conf_id)}`;

        if (state.model_id === 'Eric') {
            queryParams.push(`LOWERRIM=${encodeURIComponent(state.front)}`);
            queryParams.push(`UPPERRIM=${encodeURIComponent(state.front)}`);
        } else {
            queryParams.push(`FRONT=${encodeURIComponent(state.front)}`);
        }

        queryParams.push(commonParams);

        return `${url}?${queryParams.join('&')}`;
    }

    /**
     * Updates the UI based on the current state
     */
    function updateUI() {
        const finalUrl = buildUrl();
        finalUrlInput.value = finalUrl;

        if (!finalUrl) {
            previewImage.classList.remove('visible');
            emptyState.classList.remove('hidden');
            return;
        }

        // Show loading state could be added here if we had a proper load event handler setup
        // For now, swap source

        previewImage.onload = () => {
            previewImage.classList.add('visible');
            emptyState.classList.add('hidden');
        };

        previewImage.onerror = () => {
            previewImage.classList.remove('visible');
            emptyState.classList.remove('hidden');
            // Maybe show an error message in a real app
        };

        previewImage.src = finalUrl;
    }

    // Dynamic Rims Configuration
    const rimOptions = {
        '5808': [
            { text: 'Green', value: 'K277' },
            { text: 'Blue', value: 'K160' },
            { text: 'Beige', value: 'K223' },
            { text: 'Havana', value: 'K25' },
            { text: 'Black', value: 'K24M' }
        ],
        '5801': [
            { text: 'Green', value: 'K175' },
            { text: 'Black', value: 'K263' },
            { text: 'Havana', value: 'K25' },
            { text: 'Beige', value: 'K223' },
            { text: 'Grey', value: 'K26' },
            { text: 'Tortoise', value: 'K204' },
            { text: 'Deep red', value: 'K258' }
        ],
        '5810': [
            { text: 'Green', value: 'K175' },
            { text: 'Dark Blue', value: 'K259' },
            { text: 'Tortoise', value: 'K204' },
            { text: 'Black', value: 'K24M' }
        ],
        'Eric': [
            { text: 'Green', value: 'K175' },
            { text: 'Dark Blue', value: 'K259' },
            { text: 'Tortoise', value: 'K204' },
            { text: 'Black', value: 'K24M' }
        ]
    };

    /**
     * Updates the Rim Colour dropdown based on selected model
     */
    function updateRimOptions(modelId) {
        // Clear existing options
        rimSelect.innerHTML = '';

        // Determine which set to use, default to 5808 options if not found to be safe
        const options = rimOptions[modelId] || rimOptions['5808'];

        // Add new options
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            rimSelect.appendChild(option);
        });

        // Update state with new default selection (first one)
        state.rim = rimSelect.value;
        updateUI();
    }

    // Event Listeners
    frontSelect.addEventListener('change', (e) => {
        state.front = e.target.value;
        if (state.linked) {
            state.back = state.front;
            backSelect.value = state.front;
        }
        updateUI();
    });

    backSelect.addEventListener('change', (e) => {
        state.back = e.target.value;
        if (state.linked) {
            state.front = state.back;
            frontSelect.value = state.back;
        }
        updateUI();
    });

    syncCheckbox.addEventListener('change', (e) => {
        state.linked = e.target.checked;
        if (state.linked) {
            // Sync Back to Front
            state.back = state.front;
            backSelect.value = state.front;
            updateUI();
        }
    });

    rimSelect.addEventListener('change', (e) => {
        state.rim = e.target.value;
        updateUI();
    });

    perspectiveSelect.addEventListener('change', (e) => {
        state.perspective = e.target.value;
        updateUI();
    });

    modelSelect.addEventListener('change', (e) => {
        state.model_id = e.target.value;
        state.conf_id = e.target.options[e.target.selectedIndex].getAttribute('data-conf');

        // Update Rim options based on model
        updateRimOptions(state.model_id);

        // Update Color options based on model
        updateColorDropdowns(state.model_id);

        // Update UI
        updateUI();
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        if (!finalUrlInput.value) return;

        try {
            await navigator.clipboard.writeText(finalUrlInput.value);

            // Temporary feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            copyBtn.style.borderColor = '#3fb950';

            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.borderColor = '';
            }, 2000);

        } catch (err) {
            console.error('Failed to copy!', err);
        }
    });

    // Initial render
    updateUI();
});
