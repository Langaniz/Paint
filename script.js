document.addEventListener("DOMContentLoaded", function() {
    let undoStack = [];
    let redoStack = [];
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = "#000000";
    let thickness = 2;
    let isErasing = false;
    
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);
    
    document.getElementById("colorPicker").addEventListener("change", function(e) {
        hue = e.target.value;
        isErasing = false;
    });
    
    document.getElementById("thicknessSlider").addEventListener("input", function(e) {
        thickness = e.target.value * 2;
    });    
    
    document.getElementById("clearButton").addEventListener("click", function() {
        if (confirm("Ekrandaki çizimi silmek istediğinizden emin misiniz?")) {
            clearCanvas();
        }
    });

    document.getElementById("fillButton").addEventListener("click", function() {
        if (confirm("Seçili renkle bölgeyi doldurmak istediğinizden emin misiniz?")) {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = hue;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    });

    document.getElementById("saveButton").addEventListener("click", saveCanvas);
    
    document.getElementById("eraseButton").addEventListener("click", function() {
        isErasing = true;
    });
    
    document.getElementById("pencilButton").addEventListener("click", function() {
        isErasing = false;
    });

    function applyBlur() {
        ctx.filter = "blur(5px)";
        redrawCanvas();
        ctx.filter = "none";
    }

    function redrawCanvas() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
    }
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function undo() {
        if (undoStack.length > 0) {
            const imageData = undoStack.pop();
            redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            const imageData = redoStack.pop();
            undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        if (isErasing) {
            ctx.globalCompositeOperation = "destination-out";
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.lineWidth = thickness * 2;
        } else {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = hue;
            ctx.lineWidth = thickness;
        }
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    document.getElementById("uploadButton").addEventListener("click", function() {
        document.getElementById("fileInput").click();
    });
    
    document.getElementById("fileInput").addEventListener("change", function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.getElementById("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                };
            };
            reader.readAsDataURL(file);
        }
    });
    
    
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function saveCanvas() {
        const canvas = document.getElementById("canvas");
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = "canvas_image.png";
        link.click();
    }
});
