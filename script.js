document.addEventListener('DOMContentLoaded', () => {
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontTypeSelect = document.getElementById('fontType');
    const bgColorInput = document.getElementById('bgColor');
    const fontColorInput = document.getElementById('fontColor');
    const lineLengthInput = document.getElementById('lineLength');
    const lineHeightInput = document.getElementById('lineHeight');
    const saveButton = document.getElementById('saveButton');
    const resetButton = document.getElementById('resetButton');
    const fileInput = document.getElementById('fileInput');
    const textReader = document.getElementById('textReader');
    const tabContainer = document.getElementById('tabContainer');
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    const textContainer = document.getElementById('textContainer');

    const defaultSettings = {
        fontSize: '12',
        fontType: 'Serif',
        bgColor: '#FFFFFF',
        fontColor: '#000000',
        lineLength: '100',
        lineHeight: '1.5'
    };

    let files = [];
    let currentFileIndex = -1;

    function applySettings() {
        textReader.style.fontSize = fontSizeInput.value + 'px';
        textReader.style.fontFamily = fontTypeSelect.value;
        textReader.style.backgroundColor = bgColorInput.value;
        textReader.style.color = fontColorInput.value;
        textReader.style.lineHeight = lineHeightInput.value;
        textReader.style.width = 'auto';
        textReader.style.maxWidth = lineLengthInput.value + 'ch';
        textReader.style.whiteSpace = 'pre-wrap';
        textReader.style.overflowWrap = 'break-word';
    }

    function saveSettingsToFile() {
        if (currentFileIndex === -1) return;
        const fileContent = files[currentFileIndex].content.replace(/<txreader>.*?<\/txreader>/, '').trim();
        const settings = `<txreader>${fontSizeInput.value}:${fontTypeSelect.value}:${bgColorInput.value}:${fontColorInput.value}:${lineLengthInput.value}:${lineHeightInput.value}</txreader>`;
        const updatedContent = fileContent + '\n' + settings;
        files[currentFileIndex].content = updatedContent;
        downloadFile(files[currentFileIndex].name, updatedContent);
    }

    function downloadFile(filename, content) {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
    }

    function loadFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            let content = reader.result;

            // Detect encoding and convert to UTF-8 if necessary
            const encoding = detectEncoding(content);
            if (encoding !== 'UTF-8') {
                const uint8Array = new TextEncoder(encoding).encode(content);
                content = new TextDecoder('utf-8').decode(uint8Array);
            }

            const settingsMatch = content.match(/<txreader>(.*?)<\/txreader>/);
            if (settingsMatch) {
                const settings = settingsMatch[1].split(':');
                fontSizeInput.value = settings[0];
                fontSizeSlider.value = settings[0];
                fontTypeSelect.value = settings[1];
                bgColorInput.value = settings[2];
                fontColorInput.value = settings[3];
                lineLengthInput.value = settings[4];
                lineHeightInput.value = settings[5] === '0' ? defaultSettings.lineHeight : settings[5];
                applySettings();
                textReader.value = content.replace(/<txreader>.*?<\/txreader>/, '').trim();
            } else {
                textReader.value = content;
            }
            files.push({ name: file.name, content: reader.result });
            currentFileIndex = files.length - 1;
            updateTabs();
            saveToCookie();
        };
        reader.readAsText(file);
    }

    function detectEncoding(content) {
        const encodings = ['utf-8', 'shift-jis', 'unicode'];
        for (let encoding of encodings) {
            try {
                new TextDecoder(encoding).decode(new TextEncoder(encoding).encode(content));
                return encoding;
            } catch (e) {
                continue;
            }
        }
        return 'UTF-8'; // Default to UTF-8 if no encoding is detected
    }

    function updateTabs() {
        tabContainer.innerHTML = '';
        files.forEach((file, index) => {
            const tab = document.createElement('div');
            tab.classList.add('tab');
            if (index === currentFileIndex) tab.classList.add('active');
            tab.textContent = file.name;

            const closeButton = document.createElement('span');
            closeButton.classList.add('close-tab');
            closeButton.textContent = '×';
            closeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                closeTab(index);
            });

            tab.appendChild(closeButton);
            tab.addEventListener('click', () => {
                currentFileIndex = index;
                const settingsMatch = file.content.match(/<txreader>(.*?)<\/txreader>/);
                if (settingsMatch) {
                    const settings = settingsMatch[1].split(':');
                    fontSizeInput.value = settings[0];
                    fontSizeSlider.value = settings[0];
                    fontTypeSelect.value = settings[1];
                    bgColorInput.value = settings[2];
                    fontColorInput.value = settings[3];
                    lineLengthInput.value = settings[4];
                    lineHeightInput.value = settings[5] === '0' ? defaultSettings.lineHeight : settings[5];
                    applySettings();
                    textReader.value = file.content.replace(/<txreader>.*?<\/txreader>/, '').trim();
                } else {
                    textReader.value = file.content;
                }
                updateTabs();
                saveToCookie();
            });
            tabContainer.appendChild(tab);
        });
    }

    function closeTab(index) {
        if (index === currentFileIndex) {
            textReader.value = '';
            currentFileIndex = -1;
        }
        files.splice(index, 1);
        if (files.length > 0) {
            currentFileIndex = Math.max(0, index - 1);
            const settingsMatch = files[currentFileIndex].content.match(/<txreader>(.*?)<\/txreader>/);
            if (settingsMatch) {
                const settings = settingsMatch[1].split(':');
                fontSizeInput.value = settings[0];
                fontSizeSlider.value = settings[0];
                fontTypeSelect.value = settings[1];
                bgColorInput.value = settings[2];
                fontColorInput.value = settings[3];
                lineLengthInput.value = settings[4];
                lineHeightInput.value = settings[5] === '0' ? defaultSettings.lineHeight : settings[5];
                applySettings();
                textReader.value = files[currentFileIndex].content.replace(/<txreader>.*?<\/txreader>/, '').trim();
            } else {
                textReader.value = files[currentFileIndex].content;
            }
        }
        updateTabs();
        saveToCookie();
    }

    function resetSettings() {
        fontSizeInput.value = defaultSettings.fontSize;
        fontSizeSlider.value = defaultSettings.fontSize;
        fontTypeSelect.value = defaultSettings.fontType;
        bgColorInput.value = defaultSettings.bgColor;
        fontColorInput.value = defaultSettings.fontColor;
        lineLengthInput.value = defaultSettings.lineLength;
        lineHeightInput.value = defaultSettings.lineHeight;
        applySettings();
    }

    function saveToCookie() {
        const cookieData = {
            files: files,
            currentFileIndex: currentFileIndex,
            settings: {
                fontSize: fontSizeInput.value,
                fontType: fontTypeSelect.value,
                bgColor: bgColorInput.value,
                fontColor: fontColorInput.value,
                lineLength: lineLengthInput.value,
                lineHeight: lineHeightInput.value
            }
        };
        document.cookie = "textReader=" + JSON.stringify(cookieData) + "; path=/";
    }

    function loadFromCookie() {
        const cookieData = document.cookie.split('; ').find(row => row.startsWith('textReader='));
        if (cookieData) {
            const data = JSON.parse(cookieData.split('=')[1]);
            files = data.files;
            currentFileIndex = data.currentFileIndex;
            const settings = data.settings;
            fontSizeInput.value = settings.fontSize;
            fontSizeSlider.value = settings.fontSize;
            fontTypeSelect.value = settings.fontType;
            bgColorInput.value = settings.bgColor;
            fontColorInput.value = settings.fontColor;
            lineLengthInput.value = settings.lineLength;
            lineHeightInput.value = settings.lineHeight;
            applySettings();
            updateTabs();
            if (currentFileIndex !== -1) {
                const file = files[currentFileIndex];
                const settingsMatch = file.content.match(/<txreader>(.*?)<\/txreader>/);
                if (settingsMatch) {
                    const settings = settingsMatch[1].split(':');
                    fontSizeInput.value = settings[0];
                    fontSizeSlider.value = settings[0];
                    fontTypeSelect.value = settings[1];
                    bgColorInput.value = settings[2];
                    fontColorInput.value = settings[3];
                    lineLengthInput.value = settings[4];
                    lineHeightInput.value = settings[5] === '0' ? defaultSettings.lineHeight : settings[5];
                    applySettings();
                    textReader.value = file.content.replace(/<txreader>.*?<\/txreader>/, '').trim();
                } else {
                    textReader.value = file.content;
                }
            }
        }
    }

    function toggleFullscreen() {
        textContainer.classList.toggle('fullscreen');
    }

    fontSizeInput.addEventListener('input', () => {
        fontSizeSlider.value = fontSizeInput.value;
        applySettings();
    });

    fontSizeSlider.addEventListener('input', () => {
        fontSizeInput.value = fontSizeSlider.value;
        applySettings();
    });

    fontTypeSelect.addEventListener('change', applySettings);
    bgColorInput.addEventListener('input', applySettings);
    fontColorInput.addEventListener('input', applySettings);
    lineLengthInput.addEventListener('input', applySettings);
    lineHeightInput.addEventListener('input', applySettings);

    saveButton.addEventListener('click', saveSettingsToFile);
    resetButton.addEventListener('click', resetSettings);
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            loadFile(files[0]);
        }
    });

    fullscreenToggle.addEventListener('click', toggleFullscreen);

    loadFromCookie();
});
