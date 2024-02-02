let colorDisplay = document.createElement('div');
document.body.appendChild(colorDisplay);
colorDisplay.style.position = 'fixed';
colorDisplay.style.zIndex = '1000000000000';
colorDisplay.style.padding = '5px';
colorDisplay.style.border = '1px solid #000';
colorDisplay.style.borderRadius = '5px';
colorDisplay.style.backgroundColor = '#fff';
colorDisplay.style.color = '#000';
colorDisplay.style.fontSize = '12px';
colorDisplay.style.display = 'none';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    cleanupEnvironment();
    if (request.action === "displayImage") {
        if (request.message) {
            let img = new Image();
            img.onload = function () {
                let canvas = document.createElement('canvas');
                canvas.id = 'colorPickerCanvas';
                let ctx = canvas.getContext('2d');
                document.body.appendChild(canvas);
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                let width = window.innerWidth;
                let height = window.innerHeight
                if (window.devicePixelRatio > 1) {
                    const ratio = window.devicePixelRatio
                    canvas.width = width * ratio
                    canvas.height = height * ratio

                    canvas.style.width = width + 'px'
                    canvas.style.height = height + 'px'

                    ctx.scale(ratio / 2, ratio / 2)
                } else {
                    canvas.width = width
                    canvas.height = height
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.addEventListener('mousemove', handleMouseMove);
            };
            img.src = request.message;
        }
        sendResponse({ status: "Image displayed" });
    }
});

// Функция для обработки движения мыши и получения цвета
function handleMouseMove(e) {
    let canvas = document.getElementById('colorPickerCanvas');
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    let pixel
    if (window.devicePixelRatio > 1) {
        pixel = ctx.getImageData(e.clientX * 2, e.clientY * 2, 1, 1).data;
    } else {
        pixel = ctx.getImageData(e.clientX, e.clientY, 1, 1).data;
    }

    let rgbaColor = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
    let hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);

    canvas.addEventListener('click', function () {
        navigator.clipboard.writeText(hexColor).then(() => {
            console.log(`HEX code ${hexColor} copied to clipboard.`);
            canvas.remove();
            colorDisplay.style.display = 'none';
        }).catch(err => {
            console.error('Ошибка копи текст', err);
        });
    });

    colorDisplay.textContent = `HEX: ${hexColor} | RGBA: ${rgbaColor}`;
    colorDisplay.style.display = 'block';
    colorDisplay.style.left = `${e.clientX + 15}px`;
    colorDisplay.style.top = `${e.clientY + 15}px`;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function cleanupEnvironment() {
    const existingCanvas = document.getElementById('colorPickerCanvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }
    if (colorDisplay && colorDisplay.style.display !== 'none') {
        colorDisplay.style.display = 'none';
    }
}

