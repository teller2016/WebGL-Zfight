var gl;

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix; 

function testGLError(functionLastCalled) {
    
    var lastError = gl.getError();

    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }

    return true;
}

function initialiseGL(canvas) {
    try {
        // Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}

var shaderProgram;

var vertexData = [

];

function initialiseBuffer() {
    

    

    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

    return testGLError("initialiseBuffers");
}

function initialiseShaders() {
 
    var fragmentShaderSource = `
            varying highp vec4 col;
			void main(void) 
			{ 
                gl_FragColor = col;
				//gl_FragColor = vec4(1.0, 1.0, 0.66, 1.0); 
			}`;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
	
    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    // Vertex shader code
    var vertexShaderSource = `
			attribute highp vec4 myVertex; 
            attribute highp vec4 myColor;
			uniform mediump mat4 transformationMatrix; 
            varying highp vec4 col;
			void main(void)  
			{ 
				gl_Position = transformationMatrix * myVertex; 
                gl_PointSize = 20.0;
                col = myColor;
			}`;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);

    // Check if compilation succeeded
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        // It didn't. Display the info log as to why
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    // Create the shader program
    gl.programObject = gl.createProgram();
    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);
    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
    // Link the program
    gl.linkProgram(gl.programObject);
    // Check if linking succeeded in a similar way we checked for compilation errors
    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

var flag_animation = 0; 
function toggleAnimation()
{
	flag_animation ^= 1; 
	console.log("flag_animation=", flag_animation);
}

var xRot = 0.0;
var yRot = 0.0;
var zRot = 0.0;

var draw_mode = 4;

function draw_mode_line(){
	draw_mode = 3;
}
function draw_mode_triangle(){
	draw_mode = 4;
}
function draw_mode_point(){
	draw_mode = 0;
}

var rotSpeed = 0.1;

//속도 함수
function speed_plus(){
	rotSpeed += 0.1;
	console.log(`current speed: ${rotSpeed}`);
}
function speed_minus(){
	rotSpeed -= 0.1;
	if (rotSpeed < 0)
		rotSpeed = 0
	console.log(`current speed: ${rotSpeed}`);
}



function renderScene() {
    
    gl.clearColor(0.6, 0.8, 1.0, 1.0);



    gl.clear(gl.COLOR_BUFFER_BIT);

    // Get the location of the transformation matrix in the shader using its name
    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");

    // Matrix used to specify the orientation of the triangle on screen
    var transformationMatrix = [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ];

    // Pass the identity transformation matrix to the shader using its location
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    // Enable the user-defined vertex array
    gl.enableVertexAttribArray(0);

    // Set the vertex data to this attribute index, with the number of floats in each position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }


    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {

    var triangle = document.getElementById("triangle");

    // initialisze canvas
    callEvent(triangle);

    triangle.addEventListener("click", function(event){
        callEvent(this, event, gl.TRIANGLES);
    });



    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000, 60);
            };
    })();
    
    (function renderLoop() {
        if (loop(triangle,gl.TRIANGLES)) {
            requestAnimFrame(renderLoop);
        }
    })();


}

function callEvent(element, event, type){
    if (!initialiseGL(element)) {
        return;
    }
    if (!initialiseBuffer()) {
        return;
    }
    if (!initialiseShaders()) {
        return;
    }

    if(element.vertexAry == undefined)
        element.vertexAry = [0.7, 0.7, 0.0, 1.0, 0.0, 0.0, 0.4];

    if (event != null) {
        
        x = event.offsetX - (Number(getComputedStyle(element).width.split("px")[0]) / 2);
        y = -event.offsetY + (Number(getComputedStyle(element).height.split("px")[0]) / 2);
        
        x /= (Number(getComputedStyle(element).width.split("px")[0]) / 2);
        y /= (Number(getComputedStyle(element).height.split("px")[0]) / 2);

        let randomColor = Math.random();
        console.log(randomColor);

        var vertexData = [x, y, 0.0, randomColor, randomColor, randomColor, 1.0]
        
        console.log(x,y);
        Array.prototype.push.apply(element.vertexAry, vertexData);

    }


    // // Generate a buffer object
    // gl.vertexBuffer = gl.createBuffer();
    // // Bind buffer as a vertex buffer so we can fill it with data
    // gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    // // Set the buffer's size, data and usage 
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(element.vertexAry), gl.STATIC_DRAW);

    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearDepth(1.0);	
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.DEPTH_TEST);	

    // var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
    // var transformationMatrix = mat4.create();

    // mat4.rotateY(transformationMatrix, transformationMatrix, yRot); //수정 - y축으로 30도회전

    // if (flag_animation == 0){
	// 	xRot += 0.01* rotSpeed;// 수정
	// 	yRot += 0.01* 3;
	// 	zRot += 0.01* rotSpeed;
	// }

    // gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    // if (!testGLError("gl.uniformMatrix4fv")) {
    //     return false;
    // }

    // gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    // // Enable the user-defined vertex array
    // gl.enableVertexAttribArray(0);
    // // Set the vertex data to this attribute index, with the number of floats in each position
    // gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    // gl.enableVertexAttribArray(1);
    // gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    // if (!testGLError("gl.vertexAttribPointer")) {
    //     return false;
    // }

    // gl.drawArrays(type, 0, element.vertexAry.length / 7);
    // if (!testGLError("gl.drawArrays")) {
    //     return false;
    // }
    
    // return true;
}

function loop(element, type){


    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    // Bind buffer as a vertex buffer so we can fill it with data
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    // Set the buffer's size, data and usage 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(element.vertexAry), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);	

    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
    var transformationMatrix = mat4.create();

    mat4.rotateY(transformationMatrix, transformationMatrix, yRot); //수정 - y축으로 30도회전

    if (flag_animation == 0){
		xRot += 0.01* rotSpeed;// 수정
		yRot += 0.01* 3;
		zRot += 0.01* rotSpeed;
	}

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, transformationMatrix);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    // Enable the user-defined vertex array
    gl.enableVertexAttribArray(0);
    // Set the vertex data to this attribute index, with the number of floats in each position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 28, 12);

    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

    gl.drawArrays(type, 0, element.vertexAry.length / 7);
    if (!testGLError("gl.drawArrays")) {
        return false;
    }
    
    return true;
}