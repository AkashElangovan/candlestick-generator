// Global variables
let patternLines = [];
let candles = [];
let drawingMode = true;
let bgColor;

function setup() {
  createCanvas(800, 600);
  bgColor = color(240, 240, 240); // Light gray background
  background(bgColor);
  setupUI();
}

function setupUI() {
  let clearButton = createButton('Clear');
  clearButton.position(10, height + 10);
  clearButton.mousePressed(clearCanvas);
  
  let generateButton = createButton('Generate Chart');
  generateButton.position(70, height + 10);
  generateButton.mousePressed(() => {
    drawingMode = false;
    generateCandlestickChart(patternLines);
  });

  let drawButton = createButton('Draw Mode');
  drawButton.position(190, height + 10);
  drawButton.mousePressed(() => {
    drawingMode = true;
    candles = [];
  });
}

function draw() {
  background(bgColor);
  
  if (drawingMode) {
    drawPatternLines();
  } else {
    drawCandlestickChart(candles);
  }
}

function drawPatternLines() {
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let p of patternLines) {
    vertex(p.x, p.y);
  }
  endShape();
}

function mousePressed() {
  if (drawingMode) {
    patternLines = []; // Clear existing lines
    patternLines.push({ x: mouseX, y: mouseY });
  }
}

function mouseDragged() {
  if (drawingMode) {
    patternLines.push({ x: mouseX, y: mouseY });
  }
}

function generateCandlestickChart(points) {
  if (points.length < 2) return; // Ensure we have at least 2 points

  candles = [];
  let numCandles = 50; // Fixed number of candles
  let minY = min(points.map(p => p.y));
  let maxY = max(points.map(p => p.y));
  let range = maxY - minY;

  let prevClose = interpolateY(0, points); // Start with the first point's Y value

  for (let i = 0; i < numCandles; i++) {
    let t = i / (numCandles - 1);
    let x = lerp(0, width, t);
    let targetY = interpolateY(x, points);
    
    let open = prevClose;
    let trend = targetY - open;
    
    // Introduce more randomness in close price, but maintain overall trend
    let closeVariation = random(-range * 0.015, range * 0.015);
    let close = targetY + closeVariation;
    
    // Ensure some opposite color candles appear
    if (random() < 0.3) { // 30% chance to flip the candle color
      if (trend > 0) {
        close = open - abs(closeVariation); // Force a red candle in uptrend
      } else {
        close = open + abs(closeVariation); // Force a green candle in downtrend
      }
    }
    
    // Generate more balanced wick sizes
    let bodySize = abs(close - open);
    let averageWickSize = bodySize * 0.5;
    let highWick = random(averageWickSize * 0.2, averageWickSize * 1.2);
    let lowWick = random(averageWickSize * 0.2, averageWickSize * 1.2);
    
    let high = max(open, close) + highWick;
    let low = min(open, close) - lowWick;

    // Occasionally extend wicks, but less dramatically
    if (random() < 0.05) { // 5% chance of a slightly extended wick
      if (random() < 0.5) {
        high += random(bodySize * 0.5, bodySize);
      } else {
        low -= random(bodySize * 0.5, bodySize);
      }
    }

    candles.push({ open, close, high, low });
    prevClose = close; // Set the next candle's open to this candle's close
  }
}

function interpolateY(x, points) {
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i+1].x) {
      let t = (x - points[i].x) / (points[i+1].x - points[i].x);
      return lerp(points[i].y, points[i+1].y, t);
    }
  }
  return points[points.length - 1].y; // Return last point if x is out of range
}

function drawCandlestickChart(candles) {
  if (candles.length === 0) return;

  let candleWidth = width / candles.length;

  for (let i = 0; i < candles.length; i++) {
    let x = i * candleWidth;
    let { open, close, high, low } = candles[i];

    // Calculate the center of the candle
    let candleCenter = x + (candleWidth * 0.5);

    // Draw wick
    stroke(0);
    strokeWeight(1);
    line(candleCenter, high, candleCenter, low);

    // Draw body
    noStroke();
    if (close > open) {
      fill(180, 0, 0); // Red for bullish candles (changed from green)
    } else {
      fill(0, 180, 0); // Green for bearish candles (changed from red)
    }
    
    let bodyStart = min(open, close);
    let bodyHeight = abs(close - open);
    let bodyWidth = candleWidth * 0.8;
    rect(candleCenter - bodyWidth / 2, bodyStart, bodyWidth, bodyHeight);
  }
}

function clearCanvas() {
  patternLines = [];
  candles = [];
  drawingMode = true;
  background(bgColor);
}