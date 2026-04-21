document.addEventListener('DOMContentLoaded', () => {
    const preloadImages = () => {
        const images =[
            'red.png', 'yellow.png', 'green.png', 'blue.png',
            'red1.png', 'yellow1.png', 'green1.png', 'blue1.png'
        ];
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    };
    
    preloadImages();

    const UI = {
        btns: {
            toggleEyepiece: document.getElementById('toggleEyepieceBtn'),
            toggleDevice: document.getElementById('toggleDeviceBtn'),
            hint: document.getElementById('hintBtn')
        },
        panels: {
            eyepiece: document.getElementById('eyepiecePanel'),
            micrometer: document.getElementById('micrometerPanel'),
            hint: document.getElementById('hintPanel')
        },
        visuals: {
            focusOverlay: document.getElementById('focusOverlay'),
            ringsImage: document.getElementById('ringsView'),
            crosshair: document.querySelector('.crosshair')
        },
        inputs: {
            slider: document.getElementById('micrometerSlider'),
            number: document.getElementById('sliderValueInput'),
            lenses: document.querySelectorAll('input[name="lens"]'),
            filters: document.querySelectorAll('.filter-btn')
        }
    };

    const CONSTANTS = {
        WAVELENGTHS: { red: 700, yellow: 600, green: 530, blue: 450 },
        LENSES: { '1': 5000, '2': 8000 }
    };

    const state = {
        lens: '1',
        color: 'red',
        isDeviceOn: false,
        baseScale: 0.45
    };

    const updateImageSource = () => {
        if (!UI.visuals.ringsImage) return;
        const suffix = state.lens === '2' ? '1.png' : '.png';
        UI.visuals.ringsImage.src = state.color + suffix;
    };

    const updatePhysicsModel = () => {
        const img = UI.visuals.ringsImage;
        if (!img) return;

        if (!state.isDeviceOn) {
            img.style.opacity = '0';
            return;
        }

        const lambda = CONSTANTS.WAVELENGTHS[state.color];
        const R = CONSTANTS.LENSES[state.lens];

        const relativeScale = Math.sqrt(
            (lambda / CONSTANTS.WAVELENGTHS.red) * (R / CONSTANTS.LENSES['1'])
        );
        const finalScale = state.baseScale * relativeScale;

        img.style.transform = `scale(${finalScale})`;
        img.style.opacity = '1';
        img.style.transition = 'transform 0.5s ease-out, opacity 0.3s ease';
    };

    if (UI.btns.toggleDevice) {
        UI.btns.toggleDevice.addEventListener('click', function () {
            state.isDeviceOn = !state.isDeviceOn;
            this.classList.toggle('active');
            this.textContent = state.isDeviceOn ? 'Вимкнути пристрій' : 'Увімкнути пристрій';
            updatePhysicsModel();
        });
    }

    if (UI.btns.toggleEyepiece) {
        UI.btns.toggleEyepiece.addEventListener('click', function () {
            this.classList.toggle('active');
            UI.panels.eyepiece?.classList.toggle('visible');
            UI.panels.micrometer?.classList.toggle('visible');
            UI.visuals.focusOverlay?.classList.toggle('visible');

            if (this.classList.contains('active') && UI.btns.hint?.classList.contains('active')) {
                UI.btns.hint.click();
            }
        });
    }

    if (UI.btns.hint && UI.panels.hint) {
        UI.btns.hint.addEventListener('click', function (e) {
            e.preventDefault();
            this.classList.toggle('active');
            UI.panels.hint.classList.toggle('visible');

            if (this.classList.contains('active') && UI.btns.toggleEyepiece?.classList.contains('active')) {
                UI.btns.toggleEyepiece.click();
            }
        });
    }

    UI.inputs.lenses.forEach(radio => {
        radio.addEventListener('change', function () {
            state.lens = this.value;
            updateImageSource();
            updatePhysicsModel();
        });
    });

    if (UI.inputs.filters.length && UI.visuals.ringsImage) {
        UI.inputs.filters.forEach(btn => {
            btn.addEventListener('click', function () {
                UI.inputs.filters.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                state.color = Array.from(this.classList).find(c => CONSTANTS.WAVELENGTHS[c]) || 'red';
                updateImageSource();
                updatePhysicsModel();
            });
        });
    }

    const updateCrosshair = (value) => {
        const ch = UI.visuals.crosshair;
        if (!UI.inputs.slider || !ch) return;

        const val = Math.max(0, Math.min(10, parseFloat(value) || 0));
        const percentage = 10 + (val / UI.inputs.slider.max) * 80;
        ch.style.left = `${percentage}%`;
    };

    if (UI.inputs.slider && UI.inputs.number && UI.visuals.crosshair) {
        UI.inputs.slider.addEventListener('input', function () {
            UI.inputs.number.value = parseFloat(this.value).toFixed(2);
            updateCrosshair(this.value);
        });

        UI.inputs.number.addEventListener('input', function () {
            const val = parseFloat(this.value);
            if (!isNaN(val)) {
                UI.inputs.slider.value = val;
                updateCrosshair(val);
            }
        });

        UI.inputs.number.addEventListener('change', function () {
            let val = parseFloat(this.value);
            if (isNaN(val)) val = 5.00;
            val = Math.max(0, Math.min(10, val));
            this.value = val.toFixed(2);
            UI.inputs.slider.value = val;
            updateCrosshair(val);
        });
    }

    updateImageSource();
    updatePhysicsModel();
});