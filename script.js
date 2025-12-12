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
    const humanModeContainer = document.getElementById('human-mode-container');
    const humanModeToggle = document.getElementById('human-mode-toggle');
    const footerPanel = document.querySelector('.footer-bar'); // Use querySelector for class
    const likeBtnContainer = document.getElementById('likebtn-container');

    // Feature Flag
    const IS_HUMAN_MODE_ENABLED = true;

    const IS_LIKE_BTN_ENABLED = true;
    const LIKEBTN_SITE_ID = '693b6fa7fa8fdf484b93e432';

    // Data Configuration
    const CONFIG = {
        humanImages: {
            '5808': 'https://drive.google.com/thumbnail?id=1CqVG7dWCwhenqqafYLWyYAZnkMYdua2G&sz=w1000',
            '5801': 'https://drive.google.com/thumbnail?id=19GKx6a8UqDIK9jAQb68GeGRShzUUwoq9&sz=w1000',
            '5810': 'https://drive.google.com/thumbnail?id=1fktSFvLmbrLy32xWkzmvD-plXLlUWCmy&sz=w1000',
            'Eric': 'https://not.available.yet', // Not available
            'Ebbe': 'https://drive.google.com/thumbnail?id=1ie_OqdbTU-Ona0hcAIu0eTJpRsZaa_rz&sz=w1000',
            'Gunter': 'https://drive.google.com/thumbnail?id=1kn805FDT3cO37k5RMd5nc8q3ZYxQM9Ij&sz=w1000',
            'Lex': 'https://not.available.yet' // Not available
        },
        colors: [
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
        ],
        ericExcludedColors: ['Light Silver', 'Orange', 'Wine', 'Sky Blue', 'Blue'],
        rims: {
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
                { text: 'Black', value: 'K24M' },
                { text: 'Grey Transp.', value: 'K272' }
            ],
            'Ebbe': [
                { text: 'Green', value: 'K175' },
                { text: 'Havana', value: 'K25' },
                { text: 'Shiny Black', value: 'K199' }
            ],
            'Gunter': [
                { text: 'Green', value: 'K175' },
                { text: 'Black', value: 'K24M' },
                { text: 'Transparent Blue', value: 'K228' }
            ],
            'Lex': [
                { text: 'Brown', value: 'K162M' },
                { text: 'Havana Matte', value: 'K25M' },
                { text: 'Black Matte', value: 'K199M' },
                { text: 'Green', value: 'K175' },
                { text: 'Transparent Blue', value: 'K228' }
            ]
        }
    };

    // --- Factory Pattern Implementation ---

    /**
     * Abstract Base Class for Glasses Models
     */
    class GlassesModel {
        constructor(modelId, confId) {
            if (this.constructor === GlassesModel) {
                throw new Error("Abstract classes can't be instantiated.");
            }
            this.modelId = modelId;
            this.confId = confId;
        }

        getTypeId() {
            throw new Error("Method 'getTypeId()' must be implemented.");
        }

        getVariant() {
            throw new Error("Method 'getVariant()' must be implemented.");
        }

        getAllowedColors() {
            // Default: All colors allowed
            return CONFIG.colors;
        }

        getRimOptions() {
            return CONFIG.rims[this.modelId] || CONFIG.rims['5808'];
        }

        getUrlParams(front, back, rim, conf) {
            // Common params
            const common = `INNERRIM=${encodeURIComponent(rim)}&TEMPLE=${encodeURIComponent(back)}&CONF=${encodeURIComponent(conf)}`;
            const specific = this.getSpecificParams(front);
            return `${specific}&${common}`;
        }

        getSpecificParams(front) {
            throw new Error("Method 'getSpecificParams()' must be implemented.");
        }
    }

    /**
     * Titanium Model (e.g. 5808, 5801, 5810)
     */
    class TitaniumModel extends GlassesModel {
        getTypeId() {
            return 'TT';
        }

        getVariant() {
            return '850';
        }

        getSpecificParams(front) {
            return `FRONT=${encodeURIComponent(front)}`;
        }
    }

    /**
     * Air Titanium Model (e.g. Eric, Ebbe)
     * Formerly AcetateRim/Eric logic
     */
    class AirTitaniumModel extends GlassesModel {
        getTypeId() {
            return 'RIM';
        }

        getVariant() {
            return 'RIM_BASIC';
        }

        getAllowedColors() {
            // Filter out excluded colors
            return CONFIG.colors.filter(opt => !CONFIG.ericExcludedColors.includes(opt.text));
        }

        getSpecificParams(front) {
            return `LOWERRIM=${encodeURIComponent(front)}&UPPERRIM=${encodeURIComponent(front)}`;
        }
    }

    /**
     * Factory to create model instances
     */
    class ModelFactory {
        static create(modelId, confId) {
            switch (modelId) {
                case 'Eric':
                case 'Ebbe':
                case 'Gunter':
                case 'Lex':
                    return new AirTitaniumModel(modelId, confId);
                case '5808':
                case '5801':
                case '5810':
                default:
                    return new TitaniumModel(modelId, confId);
            }
        }
    }

    // --- Application Logic ---

    // State definition
    let state = {
        base: "https://customiser-images.lindberg.com/model/{type_id}/{model_id}/{perspective}/{variant}/ACETATE",
        front: frontSelect.value,
        back: backSelect.value,
        rim: rimSelect.value,
        perspective: perspectiveSelect.value,
        model_id: modelSelect.value,
        conf_id: modelSelect.options[modelSelect.selectedIndex].getAttribute('data-conf'),
        linked: syncCheckbox.checked,

        // Curret Model Instance
        currentModel: null,

        // UI State
        isHumanMode: false
    };

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

    /**
     * Helper to set value safely
     */
    function setSafeValue(select, value) {
        const exists = Array.from(select.options).some(opt => opt.value === value);
        if (exists) {
            select.value = value;
        } else {
            select.value = select.options[0].value;
        }
    }

    /**
     * Initializes or Updates the Model Instance
     */
    function updateModelInstance() {
        state.currentModel = ModelFactory.create(state.model_id, state.conf_id);
    }

    /**
     * Updates the Front and Back dropdowns based on selected model
     */
    function updateColorDropdowns() {
        const allowedOptions = state.currentModel.getAllowedColors();

        // Store current selections
        const currentFront = frontSelect.value;
        const currentBack = backSelect.value;

        // Populate Dropdowns
        populateSelect(frontSelect, allowedOptions);
        populateSelect(backSelect, allowedOptions);

        setSafeValue(frontSelect, currentFront);

        if (state.linked) {
            backSelect.value = frontSelect.value;
        } else {
            setSafeValue(backSelect, currentBack);
        }

        // Update state
        state.front = frontSelect.value;
        state.back = backSelect.value;
    }

    /**
     * Updates the Rim Colour dropdown based on selected model
     */
    function updateRimOptions() {
        const options = state.currentModel.getRimOptions();

        // Clear and Populate
        rimSelect.innerHTML = '';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            rimSelect.appendChild(option);
        });

        // Update state
        state.rim = rimSelect.value;
    }

    /**
     * Constructs the final URL
     */
    function buildUrl() {
        if (!state.base || !state.currentModel) return '';

        // Replace placeholders in base path
        let url = state.base;
        url = url.replace(/{type_id}/g, encodeURIComponent(state.currentModel.getTypeId()));
        url = url.replace(/{model_id}/g, encodeURIComponent(state.model_id));
        url = url.replace(/{perspective}/g, encodeURIComponent(state.perspective));
        url = url.replace(/{variant}/g, encodeURIComponent(state.currentModel.getVariant()));

        // Get Query Params from Model Strategy
        const queryParams = state.currentModel.getUrlParams(
            state.front,
            state.back,
            state.rim,
            state.conf_id
        );

        return `${url}?${queryParams}`;
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

        previewImage.onload = () => {
            previewImage.classList.add('visible');
            emptyState.classList.add('hidden');
        };

        previewImage.onerror = () => {
            previewImage.classList.remove('visible');
            emptyState.classList.remove('hidden');
        };

        previewImage.src = finalUrl;
    }

    /**
     * Updates the Human Mode UI State
     */
    function updateOneUIState() {
        const iconSpan = humanModeToggle.querySelector('.material-symbols-outlined');

        if (state.isHumanMode) {
            // Updated Icon
            iconSpan.textContent = 'face_retouching_off';

            // Hide Footer
            footerPanel.classList.add('hidden');

            // Disable Inputs (except Model)
            perspectiveSelect.disabled = true;
            frontSelect.disabled = true;
            backSelect.disabled = true;
            rimSelect.disabled = true;
            syncCheckbox.disabled = true;

            // Show Human Image
            const humanUrl = CONFIG.humanImages[state.model_id];

            if (humanUrl) {
                previewImage.src = humanUrl;
                previewImage.classList.add('visible');
                emptyState.classList.add('hidden');
            } else {
                // Determine behavior for missing image? Using empty state for now.
                previewImage.classList.remove('visible');
                emptyState.classList.remove('hidden');
            }

        } else {
            // Restore Icon
            iconSpan.textContent = 'face';

            // Show Footer
            footerPanel.classList.remove('hidden');

            // Enable Inputs
            perspectiveSelect.disabled = false;
            frontSelect.disabled = false;
            backSelect.disabled = false;
            rimSelect.disabled = false;
            syncCheckbox.disabled = false;

            // Update UI with generated Product URL
            updateUI();
        }
    }


    /**
     * Updates the LikeBtn widget for the current model
     */
    function updateLikeBtn() {
        if (!state.currentModel || !likeBtnContainer) return;

        // Clear container
        likeBtnContainer.innerHTML = '';

        if (!IS_LIKE_BTN_ENABLED) return;

        // Create new widget element
        const span = document.createElement('span');
        span.className = 'likebtn-wrapper';
        span.setAttribute('data-theme', 'roundthumb');
        span.setAttribute('data-ef_voting', 'wobble');
        span.setAttribute('data-identifier', `model_${state.model_id}`);
        span.setAttribute('data-show_like_label', 'false');
        span.setAttribute('data-site_id', LIKEBTN_SITE_ID);

        likeBtnContainer.appendChild(span);

        // Re-initialize LikeBtn if library is loaded
        if (window.LikeBtn) {
            window.LikeBtn.init();
        }
    }

    // --- Event Listeners ---

    if (IS_HUMAN_MODE_ENABLED) {
        humanModeContainer.classList.remove('hidden');

        humanModeToggle.addEventListener('click', () => {
            state.isHumanMode = !state.isHumanMode;
            updateOneUIState();
        });
    }

    frontSelect.addEventListener('change', (e) => {
        if (state.isHumanMode) return; // Should be disabled, but safety check
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

        // 1. Update Model Instance
        updateModelInstance();

        // 2. Update Options based on new model
        updateRimOptions();
        updateColorDropdowns();

        // 3. Update Like Button
        updateLikeBtn();

        // 4. Update UI
        if (state.isHumanMode) {
            updateOneUIState();
        } else {
            updateUI();
        }
    });

    copyBtn.addEventListener('click', async () => {
        if (!finalUrlInput.value) return;

        try {
            await navigator.clipboard.writeText(finalUrlInput.value);

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

    // --- Initialization ---
    // Initialize Model Instance first
    updateModelInstance();
    // Then correct the dropdowns to match the initial model
    updateColorDropdowns();
    updateRimOptions();
    // Initialize Like Button
    updateLikeBtn();
    // Finally render
    updateUI();
});
