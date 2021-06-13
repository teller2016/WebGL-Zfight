# Webgl Tutorial
# Create your own primitives and Solve Z-fight

## 목표
- Canvas에 직접 클릭하여 TRIANGLE primitive를 생성할 수 있다.
- 각 vertex에 원하는 color attribute를 지정할 수 있다.
- Depth Test가 왜 필요한지 이해할 수 있다.
- Depth Test가 이루어질 때 발생하는 Z-fight 문제를 해결할 수 있다.

## 구현

## 1. Canvas를 클릭하여 TRIANGLE primitive 만들기
### Canvas를 클릭하여 Vertex 좌표 얻기
WebGL에서의 좌표계는 -1.00에서 1.00까지로 이루어진다. 그렇기 때문에 EventListener을 통해 얻은 canvas를 클릭한 위치의 x좌표와 y좌표 값을 webgl 좌표계에 알맞게 변경해줘야 한다.
- 먼저 document의 canvas element를 call하여 canvas의 width와 height를 받는다.
~~~javascript
    function clickEvent(element, event, type){
    ...
    let canvasWidth = document.getElementById('canvas').width;
    let canvasHeight = document.getElementById('canvas').height;
    ...
    var vertexData = [x, y, 0.0, r, g, b, a];
}
~~~

-	다음 그림과 같이 canvas의 width(800)와 height(600)를 통해 x, y좌표를 -1.0 ~ 1.0범위의 값으로 normalize 해준다.
![cordinate](https://user-images.githubusercontent.com/65855364/121813416-e5fafa00-cca6-11eb-9ce1-c0d3729f7f92.jpg)
### Color attribute 얻기
Color attribute값은 0~1.0 사이의 값으로 변경이 필요하다.
-	document의 각 red, blue, green, alpha값을 받아 255로 나누어 0~1.0 사이의 값으로 변경한다.
~~~javascript
    function changeRGBA(){
    let red = document.getElementById('red');
    let green = document.getElementById('green');
    let blue = document.getElementById('blue');
    let alpha = document.getElementById('alpha');

    ...

    r = red.value/255;
    g = green.value/255;
    b = blue.value/255;
    a = alpha.value;
}
~~~

### vertex data 지정 후 drawArray
- 위에서 얻은 x, y 좌표와 color attribute값을 vertex data에 넣어준다.
~~~javascript
    function clickEvent(element, event, type){
    ...
    var vertexData = [x, y, 0.0, r, g, b, a];
    gl.drawArrays(type, 0, 3);
}
~~~
- 마지막으로 drawArrays를 통해 삼각형을 그린다.
~~~javascript
    gl.drawArrays(type, 0, 3); //type = gl.TRIANGLES
~~~
### 결과
<img src = "https://user-images.githubusercontent.com/65855364/121813428-fb702400-cca6-11eb-8984-742b332afdb2.PNG" width="30%">


## 2. Depth Test

* Depth Test란?

그려진 도형이 2차원 화면에 보여질때, 멀리있는 물체는 가까운 물체에 가려져서 안보여지는게 정상이다.<br/>
이와같이 시점을 기준으로 가까운 물체는 보이고 멀리있는 물체는 안보이게 해주는 것이 Depth Test를 통해 이루어진다.<br/>
각 도형들이 가진 픽셀마다 깊이 값을 가지게 되는데 이때 depth test는 z-buffer 알고리즘을 통해 각 도형의 깊이 값을 테스트하여 화면에 보여줄 물체를 결정하게 된다.

<hr/>
<hr/>

### Depth Test On/Off
- depth를 다르게 하기위해 도형마다 Z 값 증가시키기

`.translate()`를 통해 transformation matrix를 one_Z 만큼 z값을 translate한다.
~~~javascript
    function render(element, type){
        ...
        mat4.identity(mMat);
        mat4.rotateY(mMat, mMat, yRot);
        
        mat4.translate(mMat, mMat, [0.0, 0.0, one_Z, 0.0]);
        
        ...
    }
~~~
버튼 클릭시 선택한 도형의 z를 0.05 `증가` 혹은 `감소` 시킬 수 있다.
![z축 증가](https://user-images.githubusercontent.com/65855364/121813446-0dea5d80-cca7-11eb-93fe-4ba9c2f0f282.PNG)

<hr/>
<hr/>

- depth buffer 초기화 및 depth test toggle

`gl.clearDepth()`를 통해 depth buffer을 초기화한다.<br/>
`gl.enable(gl.DEPTH_TEST)` `gl.disable(gl.DEPTH_TEST)`을 통해 depth buffer을 활성화/비활성화 한다.

~~~javascript
    function render(element, type){
        ...
        gl.clearDepth(1.0);
        ...
        if(!flag_depthTest)
            gl.enable(gl.DEPTH_TEST);	
        else
            gl.disable(gl.DEPTH_TEST);
    }
~~~

<hr/>

- Depth Test `Off`일때 결과

`gl.disable(gl.DEPTH_TEST)`인 경우 두 도형의 깊이 값이 달라도 앞, 뒤 모두 빨간 삼각형이 앞에 있는것 처럼 보인다.
![depthOff](https://user-images.githubusercontent.com/65855364/121813451-1773c580-cca7-11eb-8f3d-8d589b8aab23.PNG)


- Depth Test가 `On`일때 결과

`gl.enable(gl.DEPTH_TEST)`인 경우 두 도형의 깊이 값에 따라 가까운 도형은 뒤에 있는 도형을 가리는 모습을 보인다.
![depthOn](https://user-images.githubusercontent.com/65855364/121813456-1b9fe300-cca7-11eb-88d1-21e982657c0b.PNG)

<hr/>
<hr/>


## 3. Z-fight 발생 및 Z-fight 해결

* Z-fight란?
<img src = "https://user-images.githubusercontent.com/65855364/121813469-25294b00-cca7-11eb-910c-0b19f52bb307.PNG" width="20%">

primitive들이 비슷한 depth 값을 가지게 되면, 제한된 z-buffer값으로 인해 서로 다른 primitive들이 누가 더 앞에 있는지 구분하기 어려워진다.<br/>
그때 primitive들이 서로 겹치게 되면서 primitive들이 깨지면서 깜빡거리는 현상이 발생한다.<br/>
즉 primitive들이 z-buffer을 차지하기 위해 fight하면서 발생한 것이라 Z-fight라 한다.

<hr/>
<hr/>


### Z-fight 해결 - Polygon Offset

* Polygon Offset이란?

Z-fight가 발생했을때 offset만큼 primitive의 depth값에 변화를 주어 어느 primitive가 앞인지 뒤인지 구분할 수 있도록 해주어 Z-fight를 해결할 수 있는 기능이다.<br/>
`void polygonOffset(float factor, float units)` - offset은 factor와 units 값에 따라 결정이 되며 z-buffer에는 offset이 반영된 값이 아닌 원래의 값이 반영된다.
 <br/>+factor, units이 모두 `양수`일 경우 depth값은 `증가`하고 모두 `음수`일 경우 depth값은 `감소`하게 된다. 

### Polygon Offset 지정

`gl.enable(gl.POLYGON_OFFSET_FILL)`으로 Polygon Offset 활성화<br/>
`gl.polygonOffset()`으로 factor과 unit값 지정
~~~javascript
    function render(element, type){
        ...
    if(flag_offset) // OFFSET 상태
        gl.enable(gl.POLYGON_OFFSET_FILL);  

    if(count>=6){
        gl.polygonOffset(unit*0.1, unit*1.0); 

        mat4.identity(mMat);  
        ...
    }
    
    if(count>=9){
        gl.polygonOffset(unit*0.2, unit*2.0);

        mat4.identity(mMat);  
        ...
    }
    }
~~~

### Polygon Offset 결과

- 삼각형은 `빨간색` -> `초록색` -> `파란색` 순으로 그렸다
- factor, units이 모두 `음수`일 경우 depth값은 `감소`하여 가장 뒤에 그린 파란색부터 파->초->빨 순으로 primitive가 시점에 `가까워졌다`.
- factor, units이 모두 `양수`일 경우 depth값은 `증가`하여 가장 처음에 그린 빨간색부터 빨->초->파 순으로 primitive가 시점에서 `멀어졌다`.

<img src = "https://user-images.githubusercontent.com/65855364/121813501-3bcfa200-cca7-11eb-8a2e-2f8817290120.PNG" width="80%">



## Reference

- https://www.w3schools.com/howto/howto_css_switch.asp - Toggle Switch 스타일 사용
- http://jun.hansung.ac.kr/CWP/htmls/html%20rgb%20colors.html - RGB값 지정 참고
- https://git.ajou.ac.kr/hwan/webgl-tutorial/-/tree/master/student2020/better_project/201720761
- https://git.ajou.ac.kr/hwan/webgl-tutorial/-/tree/master/student2020/better_project/201520998
- https://github.com/hwan-ajou/webgl-1.0/blob/main/PPT/webgl_09.pptx
