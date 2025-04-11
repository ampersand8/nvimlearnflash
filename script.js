// Sample keymaps for initial load
const sampleKeymaps = [
    {
        "lhs": "<Esc><Esc>",
        "mode_name": "Terminal",
        "expr": 0,
        "desc": "Exit terminal mode",
        "noremap": 1,
        "script": 0,
        "mode": "t",
        "nowait": 0,
        "silent": 0,
        "rhs": "<C-\\><C-N>",
        "buffer": 0
    },
    {
        "lhs": "<leader>sh",
        "mode_name": "Normal",
        "expr": 0,
        "desc": "[S]earch [H]elp",
        "noremap": 1,
        "script": 0,
        "mode": "n",
        "nowait": 0,
        "silent": 0,
        "rhs": ":lua require('telescope.builtin').help_tags()<CR>",
        "buffer": 0
    },
    {
        "lhs": "<leader>sf",
        "mode_name": "Normal", 
        "expr": 0,
        "desc": "[S]earch [F]iles",
        "noremap": 1,
        "script": 0,
        "mode": "n",
        "nowait": 0,
        "silent": 0,
        "rhs": ":lua require('telescope.builtin').find_files()<CR>",
        "buffer": 0
    },
    {
        "lhs": "<C-h>",
        "mode_name": "Normal",
        "expr": 0,
        "desc": "Move focus to the left window",
        "noremap": 1,
        "script": 0,
        "mode": "n",
        "nowait": 0,
        "silent": 0,
        "rhs": "<C-w><C-h>",
        "buffer": 0
    }
];

fetch("example.json").then(response => response.json()).then(data => {
    keymaps = data;
    filterKeymaps();
    updateStats();
    pickRandomCard();
    });

// DOM elements
const fileUpload = document.getElementById('file-upload');
const modeSelect = document.getElementById('mode-select');
const flashcard = document.getElementById('flashcard');
const cardMode = document.getElementById('card-mode');
const cardDesc = document.getElementById('card-desc');
const cardAnswer = document.getElementById('card-answer');
const cardKeys = document.getElementById('card-keys');
const cardHint = document.getElementById('card-hint');
const nextBtn = document.getElementById('next-btn');
const statsAvailable = document.getElementById('stats-available');
const statsViewed = document.getElementById('stats-viewed');
const loading = document.getElementById('loading');
const errorMsg = document.getElementById('error-msg');

// App state
let keymaps = [];
let filteredKeymaps = [];
let currentCard = null;
let showAnswer = false;
let cardsViewed = 0;
let modeFilter = 'All';

// Initialize with sample data
initializeApp(sampleKeymaps);

// Event listeners
fileUpload.addEventListener('change', handleFileUpload);
modeSelect.addEventListener('change', handleModeChange);
flashcard.addEventListener('click', toggleAnswer);
nextBtn.addEventListener('click', nextCard);

function initializeApp(data) {
    keymaps = data;
    updateModeFilter();
    filterKeymaps();
    updateStats();
    pickRandomCard();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoading(true);
    showError('');
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target.result);
            if (Array.isArray(json)) {
                keymaps = json;
                updateModeFilter();
                filterKeymaps();
                updateStats();
                pickRandomCard();
                cardsViewed = 0;
                updateCardsViewed();
            } else {
                showError('Invalid JSON format. Expected an array.');
            }
        } catch (error) {
            showError('Error parsing JSON file: ' + error.message);
        } finally {
            showLoading(false);
        }
    };
    
    reader.onerror = () => {
        showError('Error reading file');
        showLoading(false);
    };
    
    reader.readAsText(file);
}

function handleModeChange(event) {
    modeFilter = event.target.value;
    filterKeymaps();
    updateStats();
    pickRandomCard();
}

function toggleAnswer() {
    showAnswer = !showAnswer;
    cardAnswer.classList.toggle('hidden', !showAnswer);
    cardHint.textContent = showAnswer ? 'Click to hide answer' : 'Click to reveal keybinding';
}

function nextCard() {
    pickRandomCard();
    cardsViewed++;
    updateCardsViewed();
}

function updateModeFilter() {
    // Clear existing options except All
    while (modeSelect.options.length > 1) {
        modeSelect.remove(1);
    }
    
    // Get unique modes
    const uniqueModes = [...new Set(keymaps.map(k => k.mode_name))].filter(Boolean);
    
    // Add options
    uniqueModes.forEach(mode => {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode;
        modeSelect.appendChild(option);
    });
}

function filterKeymaps() {
    filteredKeymaps = modeFilter === 'All' 
        ? keymaps 
        : keymaps.filter(keymap => keymap.mode_name === modeFilter);
}

function pickRandomCard() {
    const validKeymaps = filteredKeymaps.filter(k => 
        k.lhs && (k.desc || k.rhs) && k.mode_name
    );
    
    if (validKeymaps.length > 0) {
        const randomIndex = Math.floor(Math.random() * validKeymaps.length);
        currentCard = validKeymaps[randomIndex];
        updateCardDisplay();
        showAnswer = false;
        cardAnswer.classList.add('hidden');
        cardHint.textContent = 'Click to reveal keybinding';
    } else {
        currentCard = null;
        cardMode.textContent = 'No Cards Available';
        cardDesc.textContent = 'No valid keymaps found with the current filter';
        cardAnswer.classList.add('hidden');
        showError('No valid keymaps found with the current filter');
    }
}

function updateCardDisplay() {
    if (currentCard) {
        cardMode.textContent = currentCard.mode_name + ' Mode';
        cardDesc.textContent = currentCard.desc || currentCard.rhs || 'No description available';
        cardKeys.textContent = formatKeymap(currentCard.lhs);
    }
}

function updateStats() {
    statsAvailable.textContent = `${filteredKeymaps.length} keymaps available${modeFilter !== 'All' ? ` (Filtered to ${modeFilter} mode)` : ''}`;
    updateCardsViewed();
}

function updateCardsViewed() {
    statsViewed.textContent = `Cards viewed: ${cardsViewed}`;
}

function formatKeymap(lhs) {
    if (!lhs) return '';
    return lhs
        .replace(/<leader>/g, '<Space>')
        .replace(/<CR>/g, '↵')
        .replace(/<Esc>/g, 'Esc')
        .replace(/<C-([a-z])>/gi, 'Ctrl+$1')
        .replace(/<S-([a-z])>/gi, 'Shift+$1');
}

function showLoading(isLoading) {
    loading.classList.toggle('hidden', !isLoading);
}

function showError(message) {
    if (message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
    } else {
        errorMsg.classList.add('hidden');
    }
}
