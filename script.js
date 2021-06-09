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
			uniform mediump mat4 mMat; 
            //uniform mediump mat4 vMat;
            //uniform mediump mat4 pMat;
            varying highp vec4 col;
			void main(void)  
			{ 
				gl_Position = mMat * myVertex; 
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

var flag_rotation = 1; 
function toggleRotation()
{
    draw_flag = false;
    let button = document.getElementById("rotation_button");
    if(button.innerHTML=="OFF") button.innerHTML = "ON"
    else {
        button.innerHTML = "OFF"
        draw_flag=true;
    }

	flag_rotation ^= 1; 
	console.log("flag_rotation=", flag_rotation);
}

var flag_depthTest = 1;
function toggleDepthTest()
{
    let button = document.getElementById("depthTest_button");
    if(button.innerHTML=="OFF") button.innerHTML = "ON"
    else {
        button.innerHTML = "OFF"
        draw_flag=true;
    }

	flag_depthTest ^= 1; 
	console.log("flag_depthTest=", flag_depthTest);
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

var one_Z = 0.0;
var two_Z = 0.0;
var three_Z = 0.0;
var four_Z = 0.0;
var five_Z = 0.0;

var flag_offset=false;
var flag_offset_status=false;

var count = 0;

function increaseZ(val){
    switch(val){
        case 1:one_Z+=0.05; break;
        case 2:two_Z+=0.05; break;
        case 3:three_Z+=0.05; break;
        case 4:four_Z+=0.05; break;
        case 5:five_Z+=0.05; break;
    }
}
function decreaseZ(val){
    switch(val){
        case 1:one_Z-=0.05; break;
        case 2:two_Z-=0.05; break;
        case 3:three_Z-=0.05; break;
        case 4:four_Z-=0.05; break;
        case 5:five_Z-=0.05; break;
    }
}

function toggleOffset(){
    
    let button = document.getElementById("offset_button");
    if(button.innerHTML=="OFF") button.innerHTML = "ON"
    else{
        button.innerHTML = "OFF"
    }

    flag_offset =!flag_offset;
    console.log('Offset ->'+flag_offset);
}

function changeOffsetStatus(){
    
    let button = document.getElementById("offsetStatus_button");
    if(button.innerHTML=="Negative") button.innerHTML = "Positive"
    else button.innerHTML = "Negative"

    flag_offset_status =!flag_offset_status;
    console.log('Offset Status ->'+flag_offset_status);
}

function showButton(num){
    if(num==0 || num>=6) return;
    console.log(num);

    document.getElementById('inc_'+num).style.display='block';
    document.getElementById('dec_'+num).style.display='block';

}

function main() {

    var canvas = document.getElementById("canvas");

    // initialisze canvas
    callEvent(canvas);

    canvas.addEventListener("click", function(event){
        //callEvent(this, event, gl.TRIANGLES);
        if(draw_flag){
            count++;
            if(count==15){
                document.getElementById('warning').style.display = 'block';
            }
            showButton(parseInt(count/3));
            callEvent(this, event, gl.TRIANGLES);

        }
        else
            alert('To draw rotation needs to stop')
                
            
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
    
    if(!flag_depthTest)
        gl.enable(gl.DEPTH_TEST);	
    else
        gl.disable(gl.DEPTH_TEST);

    var mMatLocation = gl.getUniformLocation(gl.programObject, "mMat");
    //var vMatLocation = gl.getUniformLocation(gl.programObject, "vMat");
    //var pMatLocation = gl.getUniformLocation(gl.programObject, "pMat");
    var mMat = mat4.create();
    //var vMat = mat4.create();
    //var pMat = mat4.create();

    if (flag_rotation == 0){
		yRot += 0.01* 3;
	}else{
        yRot = 0.0;
    }

    //mat4.rotateY(mMat, mMat, yRot); 
    //mat4.translate(mMat, mMat,[0.0, 0.0, one_Z, 0.0]);
    //mat4.lookAt(vMat, [1.0, 1.0, 1.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    //mat4.perspective(pMat, 3.64/2.0, 800.0/600.0, 0.5, 9);


    gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat);
    //gl.uniformMatrix4fv(vMatLocation, gl.FALSE, vMat );
    //gl.uniformMatrix4fv(pMatLocation, gl.FALSE, pMat );

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

    gl.disable(gl.POLYGON_OFFSET_FILL);  

    //count = element.vertexData.length / 7; //그릴 수 있는 vertex 개수

    let unit = 1.0;
    if(!flag_offset_status) //offset negative인 경우
        unit = -1.0;

    //drawArrays...
    if(flag_rotation)
        gl.drawArrays(gl.POINTS, 0, count); // 점 찍기

    if(count>=3){
        mat4.identity(mMat);  
        mat4.rotateY(mMat, mMat, yRot); 
        mat4.translate(mMat, mMat, [0.0, 0.0, one_Z, 0.0]);
        gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
        gl.drawArrays(type, 0, 3);
        //gl.drawArrays(gl.POINTS, 0, 3);
    }
    
    if(flag_offset) // OFFSET 상태
        gl.enable(gl.POLYGON_OFFSET_FILL);  

    if(count>=6){
        gl.polygonOffset(unit*0.1, unit*1.0); 

        mat4.identity(mMat);  
        mat4.rotateY(mMat, mMat, yRot); 
        mat4.translate(mMat, mMat, [0.0, 0.0, two_Z, 0.0]);
        gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
        gl.drawArrays(type, 3, 3);
        //gl.drawArrays(gl.POINTS, 3, 3);
    }
    
    if(count>=9){
        gl.polygonOffset(unit*0.2, unit*1.0);

        mat4.identity(mMat);  
        mat4.rotateY(mMat, mMat, yRot); 
        mat4.translate(mMat, mMat, [0.0, 0.0, three_Z, 0.0]);
        gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
        gl.drawArrays(type,6,3);
        //gl.drawArrays(gl.POINTS, 6, 3);

    }

    if(count>=12){
        gl.polygonOffset(unit*0.3, unit*1.0);

        mat4.identity(mMat);  
        mat4.rotateY(mMat, mMat, yRot); 
        mat4.translate(mMat, mMat, [0.0, 0.0, four_Z, 0.0]);
        gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
        gl.drawArrays(type,9,3);
        //gl.drawArrays(gl.POINTS, 9, 3);

    }

    if(count>=15){
        gl.polygonOffset(unit*0.4, unit*1.0);

        mat4.identity(mMat);  
        mat4.rotateY(mMat, mMat, yRot); 
        mat4.translate(mMat, mMat, [0.0, 0.0, five_Z, 0.0]);
        gl.uniformMatrix4fv(mMatLocation, gl.FALSE, mMat );
        gl.drawArrays(type,12,3);
        //gl.drawArrays(gl.POINTS, 12, 3);

    }
    


    //gl.drawArrays(type, 0, element.vertexData.length / 7);

    if (!testGLError("gl.drawArrays")) {
        return false;
    }
    
    return true;
}