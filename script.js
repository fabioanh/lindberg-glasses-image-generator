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

    // Initialize Dropdowns
    populateSelect(frontSelect, colorOptions);
    populateSelect(backSelect, colorOptions);

    // State
    const state = {
        base: "https://customiser-images.lindberg.com/model/TT/{model_id}/{perspective}/850/ACETATE?FRONT={front}&INNERRIM={rim}&TEMPLE={back}&CONF={conf_id}",
        front: frontSelect.value,
        back: backSelect.value,
        rim: rimSelect.value,
        perspective: perspectiveSelect.value,
        model_id: modelSelect.value,
        conf_id: modelSelect.options[modelSelect.selectedIndex].getAttribute('data-conf'),
        linked: syncCheckbox.checked
    };

    /**
     * Constructs the final URL by replacing placeholders with current values
     */
    function buildUrl() {
        if (!state.base) return '';

        // Replace placeholders safely
        let url = state.base;

        // Only replace if the placeholders exist
        // Note: We use global replace in case they appear multiple times
        url = url.replace(/{front}/g, encodeURIComponent(state.front));
        url = url.replace(/{back}/g, encodeURIComponent(state.back));
        url = url.replace(/{rim}/g, encodeURIComponent(state.rim));
        url = url.replace(/{perspective}/g, encodeURIComponent(state.perspective));
        url = url.replace(/{model_id}/g, encodeURIComponent(state.model_id));
        url = url.replace(/{conf_id}/g, encodeURIComponent(state.conf_id));

        return url;
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
            { text: 'Black', value: 'K259' },
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
