// DrawTriangle.js (c) 2012 matsuda
function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color, ctx) {
  // Draw the vector v using the specified color on the canvas
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(200, 200); // Start at the center of the canvas
  ctx.lineTo(
    200 + v.elements[0] * 20,
    200 - v.elements[1] * 20
  );
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Get user input for the two vectors
  let v1x = parseFloat(document.getElementById('v1x').value);
  let v1y = parseFloat(document.getElementById('v1y').value);
  let v2x = parseFloat(document.getElementById('v2x').value);
  let v2y = parseFloat(document.getElementById('v2y').value);

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);
  drawVector(v1, 'red', ctx);
  drawVector(v2, 'blue', ctx);
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById('example');
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Get user input for the two vectors
  let v1x = parseFloat(document.getElementById('v1x').value) || 0;
  let v1y = parseFloat(document.getElementById('v1y').value) || 0;
  let v2x = parseFloat(document.getElementById('v2x').value) || 0;
  let v2y = parseFloat(document.getElementById('v2y').value) || 0;

  let v1 = new Vector3([v1x, v1y, 0]);
  let v2 = new Vector3([v2x, v2y, 0]);

  let operation = document.getElementById('operation').value;
  let scalar = parseFloat(document.getElementById('scalar').value) || 1;

  drawVector(v1, 'red', ctx);
  drawVector(v2, 'blue', ctx);
  
  // Get the selected operation
  if (operation == 'add') {
    let v3 = new Vector3([v1x, v1y, 0]);
    v3.add(v2);
    drawVector(v3, 'green', ctx);
  }
  else if (operation == 'sub') {
    let v3 = new Vector3([v1x, v1y, 0]);
    v3.sub(v2);
    drawVector(v3, 'green', ctx);
  }
  else if (operation == 'mul') {
    let v3 = new Vector3([v1x, v1y, 0]);
    let v4 = new Vector3([v2x, v2y, 0]);
    v3.mul(scalar);
    v4.mul(scalar);
    drawVector(v3, 'green', ctx);
    drawVector(v4, 'yellow', ctx);
  }
  else if (operation == 'div') {
    let v3 = new Vector3([v1x, v1y, 0]);
    let v4 = new Vector3([v2x, v2y, 0]);
    v3.div(scalar);
    v4.div(scalar);
    drawVector(v3, 'green', ctx);
    drawVector(v4, 'yellow', ctx);
  }
  else if (operation == 'angle') {
    let angle = angleBetween(v1, v2);
    console.log("Angle between v1 and v2: ", angle, "degrees");
  }
  else if (operation == 'area') {
    let area = areaTriangle(v1, v2);
    console.log("Area of triangle formed by v1 and v2: ", area);
  }
}

function angleBetween(v1, v2) {
  let angle = 0;
  // Modify this line to calculate the angle between v1 and v2 in degrees.
  let dotProduct = Vector3.dot(v1, v2);
  let magnitudeV1 = v1.magnitude();
  let magnitudeV2 = v2.magnitude();
  if (magnitudeV1 == 0 || magnitudeV2 == 0) {
    console.log("Error: Cannot calculate angle with a zero vector");
    return 0;
  }
  let cosTheta = dotProduct / (magnitudeV1 * magnitudeV2);
  cosTheta = Math.max(-1, Math.min(1, cosTheta)); // Clamp to [-1, 1] to avoid numerical issues
  angle = Math.acos(cosTheta) * (180 / Math.PI); // Convert to degrees

  return angle;
}

function areaTriangle(v1, v2) {
  let area = 0; // Modify this line to calculate the area of the triangle formed by v1 and v2.
  let cross = Vector3.cross(v1, v2);
  area = cross.magnitude() / 2;

  return area;
}