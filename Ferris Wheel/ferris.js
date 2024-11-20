"use strict";

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];

var baseId = 0;
var shaftId = 1;
var plateId = 2;
var plate2Id = 3;
var cabinId = 4;
var cabin2Id = 5;
var cabin3Id = 6;
var cabin4Id = 7;
var cabin5Id = 8;
var cabin6Id = 9;
var cabin7Id = 10;
var cabin8Id = 11;

var rotatePlate = false;
var rotateCabin = false;
var rotateFerris = false;

var torsoHeight = 5.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var upperLegWidth  = 0.5;
var lowerLegWidth  = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 15;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 0 , 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];

init();

//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

   
    case baseId:

    m = translate(0.0, 0.0, 0.0);
    m = mult(m, rotate(theta[baseId], vec3(0, 1, 0)));
    figure[baseId] = createNode( m, base, null, shaftId );
    break;
    
    case shaftId:

    m = translate(0.0, 3, 0.0);
    m = mult(m, rotate(theta[shaftId], vec3(1, 0, 0)));
    figure[shaftId] = createNode( m, shaft, null, plateId );
    break;

    case plateId:
    m = translate(0.0, 2.5, -1.0);
    m = mult(m, rotate(theta[plateId], vec3(0, 0, 1)));
    figure[plateId] = createNode( m, plate, plate2Id, cabinId);
    break;

    case plate2Id:
    m = translate(0.0, 2.5, -3.0);
    m = mult(m, rotate(theta[plateId], vec3(0, 0, 1)));
    figure[plate2Id] = createNode( m, plate, null, null );
    break;

    case cabinId:
    m = translate(0.0, 2.5, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabinId] = createNode( m, cabin, cabin2Id, null );
    break;

    case cabin2Id:
    m = translate(2.5, 2.5, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin2Id] = createNode( m, cabin, cabin3Id, null );
    break;

    case cabin3Id:
    m = translate(2.5, 0, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin3Id] = createNode( m, cabin, cabin4Id, null );
    break;

    case cabin4Id:
    m = translate(2.5, -2.5, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin4Id] = createNode( m, cabin, cabin5Id, null );
    break;

    case cabin5Id:
    m = translate(0, -2.5, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin5Id] = createNode( m, cabin, cabin6Id, null );
    break;

    case cabin6Id:
    m = translate(-2.5, -2.5, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin6Id] = createNode( m, cabin, cabin7Id, null );
    break;

    case cabin7Id:
    m = translate(-2.5, 0, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin7Id] = createNode( m, cabin, cabin8Id, null );
    break;

    case cabin8Id:
    m = translate(-2.5, 2.5, 1.0);
    m = mult(m, rotate(theta[cabinId], vec3(0, 0, 1)));
    figure[cabin8Id] = createNode( m, cabin, null, null );
    break;

    }



}

function traverse(Id) {

   if(Id == null) return;
   
   stack.push(modelViewMatrix);

  //  if (Id >= cabinId){
  //   let matrix = mat4();
  //   // matrix[0][0] = modelViewMatrix[0][0];
  //   matrix[0][3] = modelViewMatrix[0][0];
  //   matrix[1][3] = modelViewMatrix[1][0];
  //   matrix[2][3] = modelViewMatrix[2][0];
  //   // matrix[2][3] = modelViewMatrix[2][3];

  //   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  //   modelViewMatrix = mult(matrix, figure[Id].transform);
  //  }
  // else{
  //  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  // }

  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);

   figure[Id].render();
   
   initNodes(Id);

   if(figure[Id].child != null) traverse(figure[Id].child);
   
   modelViewMatrix = stack.pop();
   
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function base() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale(6, 1, 6) )
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
  for(var i =0; i<6; i++) gl.drawArrays(gl.LINE_LOOP, 4*i, 4);
}

function shaft() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale(1, 5, 1) )
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
  for(var i =0; i<6; i++) gl.drawArrays(gl.LINE_LOOP, 4*i, 4);
}

function plate() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 2.0) );
  instanceMatrix = mult(instanceMatrix, scale(5, 5, 0) )
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
  for(var i =0; i<6; i++) gl.drawArrays(gl.LINE_LOOP, 4*i, 4);
}

function cabin() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.0, 0.0) );
  instanceMatrix = mult(instanceMatrix, scale(1.5, 1.5, 1.5) )
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
  for(var i =0; i<6; i++) gl.drawArrays(gl.LINE_LOOP, 4*i, 4);
}

function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     pointsArray.push(vertices[b]);
     pointsArray.push(vertices[c]);
     pointsArray.push(vertices[d]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0,10.0,-10.0, 10.0,-10.0,10.0);
    modelViewMatrix = mat4();


    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();

    vBuffer = gl.createBuffer();

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );


  //   document.getElementById('baseRotation').addEventListener('input', (e) => {
  //     rotations.base = parseFloat(e.target.value);
  //     updateModelHierarchy();
  // });
    document.getElementById("slider0").addEventListener('input', (e) => {
      theta[baseId ] = parseFloat(e.target.value);
      initNodes(baseId);
    });

    document.getElementById("rotatePlate").addEventListener('click', (e) => {
      rotatePlate = !rotatePlate;
    });

    document.getElementById("rotateCabin").addEventListener('click', (e) => {
      rotateCabin = !rotateCabin;
    });

    document.getElementById("rotateFerris").addEventListener('click', (e) => {
      rotateFerris = !rotateFerris;
    });
        

    for(i=0; i<numNodes; i++) initNodes(i);

    render();
}


function render() {

        gl.clear( gl.COLOR_BUFFER_BIT );
        
        initNodes(baseId);
        

        traverse(baseId);

        if (rotateFerris){
          theta[plateId] += 0.1;
          theta[cabinId] -= 0.1;
        }

        if (rotatePlate){
          theta[plateId] += 0.1;
        }

        if (rotateCabin){
          theta[cabinId] -= 0.1;
        }

        requestAnimationFrame(render);
}
