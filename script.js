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
                gl_PointSize = 3.0;
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

var flag_animation = 1; 
function toggleAnimation()
{
    draw_flag = false;
    console.log(draw_flag);
    let button = document.getElementById("toggle_button");
    if(button.value=="Toggle Rotate [ON]") button.value = "Toggle Rotate [OFF]"
    else button.value = "Toggle Rotate [ON]"

	flag_animation ^= 1; 
	console.log("flag_animation=", flag_animation);
}

var yRot = 0.0;


var triangle_color = 'red'; //RED, YELLOW, BLUE, GREEN
var draw_flag = true;

var r = 1.0;
var g = 0.0;
var b = 0.0;
var a = 1.0;

function changeRGBA(){
    let red = document.getElementById('red');
    let green = document.getElementById('green');
    let blue = document.getElementById('blue');
    let alpha = document.getElementById('alpha');


    let redValue = document.getElementById('redValue');
    let greenValue = document.getElementById('greenValue');
    let blueValue = document.getElementById('blueValue');
    let alphaValue = document.getElementById('alphaValue');


    redValue.innerHTML=red.value;
    greenValue.innerHTML=green.value;
    blueValue.innerHTML=blue.value;
    alphaValue.innerHTML=alpha.value;

    let colorBox = document.getElementById('colorBox');
    colorBox.style.backgroundColor="rgba("+red.value+","+green.value+","+blue.value+","+alpha.value+")";

    r = red.value/255;
    g = green.value/255;
    b = blue.value/255;
    a = alpha.value;

}


function main() {

    var canvas = document.getElementById("canvas");

    // initialisze canvas
    callEvent(canvas);

    canvas.addEventListener("click", function(event){
        if(draw_flag)
            callEvent(this, event, gl.TRIANGLES);
    });


    requestAnimFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000, 60);
            };
    })();
    
    (function renderLoop() {
        if (loop(canvas,gl.TRIANGLES)) {
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

    if(element.vertexData == undefined)
        element.vertexData = [];

    if (event != null) {

        let canvasWidth = document.getElementById('canvas').width;
        let canvasHeight = document.getElementById('canvas').height;
        
        x = event.offsetX - canvasWidth / 2;
        y = -event.offsetY + canvasHeight / 2;

        x /= canvasWidth / 2;
        y /=  canvasHeight / 2;

        var vertexData = [x, y, 0.0, r, g, b, a];
        
        //console.log(x,y);
        Array.prototype.push.apply(element.vertexData, vertexData);

    }

}

function loop(element, type){


    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    // Bind buffer as a vertex buffer so we can fill it with data
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    // Set the buffer's size, data and usage 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(element.vertexData), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);	
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);	

    var matrixLocation = gl.getUniformLocation(gl.programObject, "transformationMatrix");
    var transformationMatrix = mat4.create();

    mat4.rotateY(transformationMatrix, transformationMatrix, yRot); //수정 - y축으로 30도회전

    if (flag_animation == 0){
		yRot += 0.01* 3;
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

    gl.drawArrays(gl.POINTS, 0, element.vertexData.length / 7);
    gl.drawArrays(type, 0, element.vertexData.length / 7);
    if (!testGLError("gl.drawArrays")) {
        return false;
    }
    
    return true;
}