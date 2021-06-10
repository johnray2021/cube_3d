/* 作者：johnray */
/* 创作时间：2020年5月
   20201231：添加函数 fun_resolve_from_state_string ，
             使用 kociemba.js 的算法代码，根据【魔方的状态字符串】计算得出【还原步骤】
*/

/* 定义全局变量 */
var cube_transform_text;   /* 读取页面输入的变换操作字符串 */
var obj_cube_3d;           /* 魔方div对象，作为所有魔方子块div的容器 */
var cube_matrix;           /* 魔方子块div对象矩阵 */
var cube_matrix_temp;      /* 是cube_matrix的备份，由于Array对象具有指针引用的特性，
                              因此需要创建一个新的Array实例，来处理变换前后的矩阵状态赋值操作 */
var obj_surface_div;       /* 变换面div对象，作为变换面的魔方子块div的容器，
                              在执行面变换函数的时候动态创建，并且在完成面变换操作后自动清除 */
var transform_step_number; /* 变换操作计数符，对obj_surface_div的id属性进行标识，
                              便于obj_surface_div对象管理和程序调试 */

/* sleep()函数的原理是利用ES6版本中Promise对象的异步执行机制，
实现在图形动画结束之后，再执行后续的操作，以此保证多步骤变换的先后顺序
参考：http://www.manongjc.com/detail/8-geohlblolkvupns.html
*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* JavaScript中的数组赋值是指针引用的方式，修改被赋值的数组变量会影响到赋值来源的数组变量，
因此使用fun_copy_array()函数，遍历数组中的每个元素进行拷贝赋值 */
function fun_copy_array(from_array,to_array){
	for(var x=0;x<from_array.length;x++){
		for(var y=0;y<from_array[x].length;y++){
			for(var z=0;z<from_array[x][y].length;z++){
				for(var i=0;i<from_array[x][y][z].length;i++){
					to_array[x][y][z][i]=from_array[x][y][z][i];
				}
			}
		}
	}
}

/* fun_init()函数在页面加载的时候自动执行，
用于初始化全局变量，初始化魔方图形样式，和初始化魔方子块div的对象矩阵 */
function fun_init(){
	document.getElementById("text_transform_string").value="UDFBLR";

	console.log((new Date).toLocaleString());
	
	transform_step_number=0;
	obj_cube_3d=document.getElementById("cube_3d");
	cube_matrix=new Array(3);
	for(var x=0;x<3;x++){
		cube_matrix[x]=new Array(3);
		for(var y=0;y<3;y++){
			cube_matrix[x][y]=new Array(3);
			for(var z=0;z<3;z++){
				cube_matrix[x][y][z]=new Array(7);
			}
		}
	}
	cube_matrix_temp=new Array(3);
	for(var x=0;x<3;x++){
		cube_matrix_temp[x]=new Array(3);
		for(var y=0;y<3;y++){
			cube_matrix_temp[x][y]=new Array(3);
			for(var z=0;z<3;z++){
				cube_matrix_temp[x][y][z]=new Array(7);
			}
		}
	}
	cube_matrix[1][1][1]=[document.getElementById("square_center"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][1][1][0].style.transform="translateX(0) translateY(0) translateZ(0)";
	cube_matrix[1][0][1]=[document.getElementById("square_U"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][0][1][0].style.transform="translateX(0) translateY(-100px) translateZ(0)";
	cube_matrix[1][2][1]=[document.getElementById("square_D"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][2][1][0].style.transform="translateX(0) translateY(100px) translateZ(0)";
	cube_matrix[1][1][2]=[document.getElementById("square_F"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][1][2][0].style.transform="translateX(0) translateY(0) translateZ(100px)";
	cube_matrix[1][1][0]=[document.getElementById("square_B"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][1][0][0].style.transform="translateX(0) translateY(0) translateZ(-100px)";
	cube_matrix[0][1][1]=[document.getElementById("square_L"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][1][1][0].style.transform="translateX(-100px) translateY(0) translateZ(0)";
	cube_matrix[2][1][1]=[document.getElementById("square_R"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][1][1][0].style.transform="translateX(100px) translateY(0) translateZ(0)";
	cube_matrix[1][0][2]=[document.getElementById("square_UF"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][0][2][0].style.transform="translateX(0) translateY(-100px) translateZ(100px)";
	cube_matrix[1][0][0]=[document.getElementById("square_UB"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][0][0][0].style.transform="translateX(0) translateY(-100px) translateZ(-100px)";
	cube_matrix[0][0][1]=[document.getElementById("square_UL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][0][1][0].style.transform="translateX(-100px) translateY(-100px) translateZ(0)";
	cube_matrix[2][0][1]=[document.getElementById("square_UR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][0][1][0].style.transform="translateX(100px) translateY(-100px) translateZ(0)";
	cube_matrix[0][1][2]=[document.getElementById("square_FL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][1][2][0].style.transform="translateX(-100px) translateY(0) translateZ(100px)";
	cube_matrix[2][1][2]=[document.getElementById("square_FR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][1][2][0].style.transform="translateX(100px) translateY(0) translateZ(100px)";
	cube_matrix[0][1][0]=[document.getElementById("square_BL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][1][0][0].style.transform="translateX(-100px) translateY(0) translateZ(-100px)";
	cube_matrix[2][1][0]=[document.getElementById("square_BR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][1][0][0].style.transform="translateX(100px) translateY(0) translateZ(-100px)";
	cube_matrix[1][2][2]=[document.getElementById("square_DF"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][2][2][0].style.transform="translateX(0) translateY(100px) translateZ(100px)";
	cube_matrix[1][2][0]=[document.getElementById("square_DB"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[1][2][0][0].style.transform="translateX(0) translateY(100px) translateZ(-100px)";
	cube_matrix[0][2][1]=[document.getElementById("square_DL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][2][1][0].style.transform="translateX(-100px) translateY(100px) translateZ(0)";
	cube_matrix[2][2][1]=[document.getElementById("square_DR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][2][1][0].style.transform="translateX(100px) translateY(100px) translateZ(0)";
	cube_matrix[0][0][2]=[document.getElementById("square_UFL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][0][2][0].style.transform="translateX(-100px) translateY(-100px) translateZ(100px)";
	cube_matrix[2][0][2]=[document.getElementById("square_UFR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][0][2][0].style.transform="translateX(100px) translateY(-100px) translateZ(100px)";
	cube_matrix[0][0][0]=[document.getElementById("square_UBL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][0][0][0].style.transform="translateX(-100px) translateY(-100px) translateZ(-100px)";
	cube_matrix[2][0][0]=[document.getElementById("square_UBR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][0][0][0].style.transform="translateX(100px) translateY(-100px) translateZ(-100px)";
	cube_matrix[0][2][2]=[document.getElementById("square_DFL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][2][2][0].style.transform="translateX(-100px) translateY(100px) translateZ(100px)";
	cube_matrix[2][2][2]=[document.getElementById("square_DFR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][2][2][0].style.transform="translateX(100px) translateY(100px) translateZ(100px)";
	cube_matrix[0][2][0]=[document.getElementById("square_DBL"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[0][2][0][0].style.transform="translateX(-100px) translateY(100px) translateZ(-100px)";
	cube_matrix[2][2][0]=[document.getElementById("square_DBR"),"y-","y+","z+","z-","x-","x+"];
	cube_matrix[2][2][0][0].style.transform="translateX(100px) translateY(100px) translateZ(-100px)";
	fun_copy_array(cube_matrix,cube_matrix_temp);
	
	/* 动态添加样式的测试 */
	/*
	var obj_animation_style=document.createElement('style');
	document.head.appendChild(obj_animation_style);
	obj_animation_style.sheet.insertRule("@keyframes rotate_test { "+
	" 0%{transform: translateX(200px) translateY(-200px) translateZ(200px) "+
	" rotateX(0deg) rotateY(0deg) rotateZ(0deg)} "+
	" 33%{transform: translateX(200px) translateY(-200px) translateZ(200px) "+
	" rotateX(360deg) rotateY(0deg) rotateZ(0deg)} "+
	" 66%{transform: translateX(200px) translateY(-200px) translateZ(200px) "+
	" rotateX(360deg) rotateY(-360deg) rotateZ(0deg)} "+
	" 100%{transform: translateX(200px) translateY(-200px) translateZ(200px) "+
	" rotateX(360deg) rotateY(-360deg) rotateZ(360deg)}}");
	document.getElementById("square_UFR").style.animation="rotate_test 9s infinite linear";
	*/
}

/* fun_execute_transform()函数是变换操作的入口程序，由页面按钮“执行变换操作”触发，
用于识别变换操作字符串，并根据变换操作标识符调用对应的面变换操作函数 */
async function fun_execute_transform(cube_transform_text){
	if(cube_transform_text==undefined){
		cube_transform_text=document.getElementById("text_transform_string").value;
	}
	console.log("cube_transform_text="+cube_transform_text);

	for(var i=0;i<cube_transform_text.length;i++){
		if(cube_transform_text[i]=="U"){
			fun_change_U_surface();
		}
		if(cube_transform_text[i]=="D"){
			fun_change_D_surface();
		}
		if(cube_transform_text[i]=="L"){
			fun_change_L_surface();
		}
		if(cube_transform_text[i]=="R"){
			fun_change_R_surface();
		}
		if(cube_transform_text[i]=="F"){
			fun_change_F_surface();
		}
		if(cube_transform_text[i]=="B"){
			fun_change_B_surface();
		}
		await sleep(1500); 
	}
}

/* fun_rotate_cube()函数对魔方体循环执行整体翻转动画，由页面按钮“运行魔方翻转动画”触发 */
function fun_rotate_cube(){
	obj_cube_3d.style.animation="rotate_cube 15s infinite linear";
}

/* fun_rotate_cube()函数用于停止魔方整体翻转动画，由页面按钮“停止魔方翻转动画”触发 */
function fun_stop_rotate_cube(){
	obj_cube_3d.style.animation="";
}

/* fun_get_new_rotate_str()函数用在面变换操作中，
根据变换前变换面的各子块的transform rotate样式属性和待变换面的标识符，
计算并输出变换后变换面的各子块的transform rotate样式字符串 */
function fun_get_new_rotate_str(obj_transform_square,rotate_surface){
	var transform_str=obj_transform_square[0].style.transform;
	var original_rotate_str, new_rotate_str;
	
	/*1.解析输入参数*/
	if(transform_str.search("rotate")>=0){
		original_rotate_str=transform_str.substring(transform_str.search("rotate"));
	} else{
		original_rotate_str="";
	}
	new_rotate_str=original_rotate_str;

	if(rotate_surface!="U" && rotate_surface!="D" && rotate_surface!="F" && rotate_surface!="B" && rotate_surface!="L" && rotate_surface!="R"){
		return new_rotate_str;
	}

	/*2.旋转面的朝向状态判断*/
	if(rotate_surface=="U"){
		if(obj_transform_square[1]=="x+"){
			new_rotate_str=original_rotate_str+" rotateX(90deg)";
		} else if(obj_transform_square[1]=="x-"){
			new_rotate_str=original_rotate_str+"rotateX(-90deg)";
		} else if(obj_transform_square[1]=="y+"){
			new_rotate_str=original_rotate_str+" rotateY(90deg)";
		} else if(obj_transform_square[1]=="y-"){
			new_rotate_str=original_rotate_str+" rotateY(-90deg)";
		} else if(obj_transform_square[1]=="z+"){
			new_rotate_str=original_rotate_str+" rotateZ(90deg)";
		} else if(obj_transform_square[1]=="z-"){
			new_rotate_str=original_rotate_str+" rotateZ(-90deg)";
		} 
	} else if(rotate_surface=="D"){
		if(obj_transform_square[2]=="x+"){
			new_rotate_str=original_rotate_str+" rotateX(90deg)";
		} else if(obj_transform_square[2]=="x-"){
			new_rotate_str=original_rotate_str+" rotateX(-90deg)";
		} else if(obj_transform_square[2]=="y+"){
			new_rotate_str=original_rotate_str+" rotateY(90deg)";
		} else if(obj_transform_square[2]=="y-"){
			new_rotate_str=original_rotate_str+" rotateY(-90deg)";
		} else if(obj_transform_square[2]=="z+"){
			new_rotate_str=original_rotate_str+" rotateZ(90deg)";
		} else if(obj_transform_square[2]=="z-"){
			new_rotate_str=original_rotate_str+" rotateZ(-90deg)";
		} 
	} else if(rotate_surface=="F"){
		if(obj_transform_square[3]=="x+"){
			new_rotate_str=original_rotate_str+" rotateX(90deg)";
		} else if(obj_transform_square[3]=="x-"){
			new_rotate_str=original_rotate_str+" rotateX(-90deg)";
		} else if(obj_transform_square[3]=="y+"){
			new_rotate_str=original_rotate_str+" rotateY(90deg)";
		} else if(obj_transform_square[3]=="y-"){
			new_rotate_str=original_rotate_str+" rotateY(-90deg)";
		} else if(obj_transform_square[3]=="z+"){
			new_rotate_str=original_rotate_str+" rotateZ(90deg)";
		} else if(obj_transform_square[3]=="z-"){
			new_rotate_str=original_rotate_str+" rotateZ(-90deg)";
		} 
	} else if(rotate_surface=="B"){
		if(obj_transform_square[4]=="x+"){
			new_rotate_str=original_rotate_str+" rotateX(90deg)";
		} else if(obj_transform_square[4]=="x-"){
			new_rotate_str=original_rotate_str+" rotateX(-90deg)";
		} else if(obj_transform_square[4]=="y+"){
			new_rotate_str=original_rotate_str+" rotateY(90deg)";
		} else if(obj_transform_square[4]=="y-"){
			new_rotate_str=original_rotate_str+" rotateY(-90deg)";
		} else if(obj_transform_square[4]=="z+"){
			new_rotate_str=original_rotate_str+" rotateZ(90deg)";
		} else if(obj_transform_square[4]=="z-"){
			new_rotate_str=original_rotate_str+" rotateZ(-90deg)";
		} 
	} else if(rotate_surface=="L"){
		if(obj_transform_square[5]=="x+"){
			new_rotate_str=original_rotate_str+" rotateX(90deg)";
		} else if(obj_transform_square[5]=="x-"){
			new_rotate_str=original_rotate_str+" rotateX(-90deg)";
		} else if(obj_transform_square[5]=="y+"){
			new_rotate_str=original_rotate_str+" rotateY(90deg)";
		} else if(obj_transform_square[5]=="y-"){
			new_rotate_str=original_rotate_str+" rotateY(-90deg)";
		} else if(obj_transform_square[5]=="z+"){
			new_rotate_str=original_rotate_str+" rotateZ(90deg)";
		} else if(obj_transform_square[5]=="z-"){
			new_rotate_str=original_rotate_str+" rotateZ(-90deg)";
		} 
	} else if(rotate_surface=="R"){
		if(obj_transform_square[6]=="x+"){
			new_rotate_str=original_rotate_str+" rotateX(90deg)";
		} else if(obj_transform_square[6]=="x-"){
			new_rotate_str=original_rotate_str+" rotateX(-90deg)";
		} else if(obj_transform_square[6]=="y+"){
			new_rotate_str=original_rotate_str+" rotateY(90deg)";
		} else if(obj_transform_square[6]=="y-"){
			new_rotate_str=original_rotate_str+" rotateY(-90deg)";
		} else if(obj_transform_square[6]=="z+"){
			new_rotate_str=original_rotate_str+" rotateZ(90deg)";
		} else if(obj_transform_square[6]=="z-"){
			new_rotate_str=original_rotate_str+" rotateZ(-90deg)";
		} 
	} 

	return new_rotate_str;
}

/* function fun_change_U_surface()函数对U面执行顺时针旋转90度操作，
实现面旋转动画效果，子块的位置和朝向样式属性更新，和div子块对象矩阵的状态更新 */
async function fun_change_U_surface(){
	console.log("fun_change_U_surface():");

	var y=0;

	obj_surface_div=document.createElement("div");
	transform_step_number=transform_step_number+1;
	obj_surface_div.setAttribute("id","transform_surface_"+transform_step_number);
	obj_surface_div.setAttribute("class","transform_surface");
	obj_surface_div.appendChild(cube_matrix[0][y][0][0]);
	obj_surface_div.appendChild(cube_matrix[0][y][1][0]);
	obj_surface_div.appendChild(cube_matrix[0][y][2][0]);
	obj_surface_div.appendChild(cube_matrix[1][y][0][0]);
	obj_surface_div.appendChild(cube_matrix[1][y][1][0]);
	obj_surface_div.appendChild(cube_matrix[1][y][2][0]);
	obj_surface_div.appendChild(cube_matrix[2][y][0][0]);
	obj_surface_div.appendChild(cube_matrix[2][y][1][0]);
	obj_surface_div.appendChild(cube_matrix[2][y][2][0]);
	obj_cube_3d.appendChild(obj_surface_div);
	
	obj_surface_div.style.transform=obj_surface_div.style.transform+"rotateY(-90deg)";
	obj_surface_div.style.animation="rotate_surface_U 1s 1 linear";
	await sleep(1200);

	for(var i=0;i<7;i++){
		cube_matrix[0][y][0][i]=cube_matrix_temp[0][y][2][i];
		cube_matrix[0][y][1][i]=cube_matrix_temp[1][y][2][i];
		cube_matrix[0][y][2][i]=cube_matrix_temp[2][y][2][i];
		cube_matrix[1][y][0][i]=cube_matrix_temp[0][y][1][i];
		cube_matrix[1][y][1][i]=cube_matrix_temp[1][y][1][i];
		cube_matrix[1][y][2][i]=cube_matrix_temp[2][y][1][i];
		cube_matrix[2][y][0][i]=cube_matrix_temp[0][y][0][i];
		cube_matrix[2][y][1][i]=cube_matrix_temp[1][y][0][i];
		cube_matrix[2][y][2][i]=cube_matrix_temp[2][y][0][i];
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	
	for(var x=0;x<3;x++){
		for(var z=0;z<3;z++){
			var new_rotate_str=fun_get_new_rotate_str(cube_matrix[x][y][z],"U");
			cube_matrix[x][y][z][0].style.transform="translateX("+100*(x-1)+"px) translateY("+100*(y-1)+"px) translateZ("+100*(z-1)+"px) "+new_rotate_str;
			obj_cube_3d.appendChild(cube_matrix[x][y][z][0]);
			cube_matrix[x][y][z][1]=cube_matrix_temp[x][y][z][1];
			cube_matrix[x][y][z][2]=cube_matrix_temp[x][y][z][2];
			cube_matrix[x][y][z][3]=cube_matrix_temp[x][y][z][6];
			cube_matrix[x][y][z][4]=cube_matrix_temp[x][y][z][5];
			cube_matrix[x][y][z][5]=cube_matrix_temp[x][y][z][3];
			cube_matrix[x][y][z][6]=cube_matrix_temp[x][y][z][4];
		}
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	obj_cube_3d.removeChild(obj_surface_div);
}

/* function fun_change_D_surface()函数对D面执行顺时针旋转90度操作，
实现面旋转动画效果，子块的位置和朝向样式属性更新，和div子块对象矩阵的状态更新 */
async function fun_change_D_surface(){
	console.log("fun_change_D_surface():");

	var y=2;

	obj_surface_div=document.createElement("div");
	transform_step_number=transform_step_number+1;
	obj_surface_div.setAttribute("id","transform_surface_"+transform_step_number);
	obj_surface_div.setAttribute("class","transform_surface");
	obj_surface_div.appendChild(cube_matrix[0][y][0][0]);
	obj_surface_div.appendChild(cube_matrix[0][y][1][0]);
	obj_surface_div.appendChild(cube_matrix[0][y][2][0]);
	obj_surface_div.appendChild(cube_matrix[1][y][0][0]);
	obj_surface_div.appendChild(cube_matrix[1][y][1][0]);
	obj_surface_div.appendChild(cube_matrix[1][y][2][0]);
	obj_surface_div.appendChild(cube_matrix[2][y][0][0]);
	obj_surface_div.appendChild(cube_matrix[2][y][1][0]);
	obj_surface_div.appendChild(cube_matrix[2][y][2][0]);
	obj_cube_3d.appendChild(obj_surface_div);
	
	obj_surface_div.style.transform=obj_surface_div.style.transform+"rotateY(90deg)";
	obj_surface_div.style.animation="rotate_surface_D 1s 1 linear";
	await sleep(1200); 

	for(var i=0;i<7;i++){
		cube_matrix[0][y][0][i]=cube_matrix_temp[2][y][0][i];
		cube_matrix[0][y][1][i]=cube_matrix_temp[1][y][0][i];
		cube_matrix[0][y][2][i]=cube_matrix_temp[0][y][0][i];
		cube_matrix[1][y][0][i]=cube_matrix_temp[2][y][1][i];
		cube_matrix[1][y][1][i]=cube_matrix_temp[1][y][1][i];
		cube_matrix[1][y][2][i]=cube_matrix_temp[0][y][1][i];
		cube_matrix[2][y][0][i]=cube_matrix_temp[2][y][2][i];
		cube_matrix[2][y][1][i]=cube_matrix_temp[1][y][2][i];
		cube_matrix[2][y][2][i]=cube_matrix_temp[0][y][2][i];
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	
	for(var x=0;x<3;x++){
		for(var z=0;z<3;z++){
			var new_rotate_str=fun_get_new_rotate_str(cube_matrix[x][y][z],"D");
			cube_matrix[x][y][z][0].style.transform="translateX("+100*(x-1)+"px) translateY("+100*(y-1)+"px) translateZ("+100*(z-1)+"px) "+new_rotate_str;
			obj_cube_3d.appendChild(cube_matrix[x][y][z][0]);
			cube_matrix[x][y][z][1]=cube_matrix_temp[x][y][z][1];
			cube_matrix[x][y][z][2]=cube_matrix_temp[x][y][z][2];
			cube_matrix[x][y][z][3]=cube_matrix_temp[x][y][z][5];
			cube_matrix[x][y][z][4]=cube_matrix_temp[x][y][z][6];
			cube_matrix[x][y][z][5]=cube_matrix_temp[x][y][z][4];
			cube_matrix[x][y][z][6]=cube_matrix_temp[x][y][z][3];
		}
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	obj_cube_3d.removeChild(obj_surface_div);
}

/* function fun_change_F_surface()函数对F面执行顺时针旋转90度操作，
实现面旋转动画效果，子块的位置和朝向样式属性更新，和div子块对象矩阵的状态更新 */
async function fun_change_F_surface(){
	console.log("fun_change_F_surface()");
	
	var z=2;

	obj_surface_div=document.createElement("div");
	transform_step_number=transform_step_number+1;
	obj_surface_div.setAttribute("id","transform_surface_"+transform_step_number);
	obj_surface_div.setAttribute("class","transform_surface");
	obj_surface_div.appendChild(cube_matrix[0][0][z][0]);
	obj_surface_div.appendChild(cube_matrix[0][1][z][0]);
	obj_surface_div.appendChild(cube_matrix[0][2][z][0]);
	obj_surface_div.appendChild(cube_matrix[1][0][z][0]);
	obj_surface_div.appendChild(cube_matrix[1][1][z][0]);
	obj_surface_div.appendChild(cube_matrix[1][2][z][0]);
	obj_surface_div.appendChild(cube_matrix[2][0][z][0]);
	obj_surface_div.appendChild(cube_matrix[2][1][z][0]);
	obj_surface_div.appendChild(cube_matrix[2][2][z][0]);
	obj_cube_3d.appendChild(obj_surface_div);
	
	obj_surface_div.style.transform=obj_surface_div.style.transform+"rotateZ(90deg)";
	obj_surface_div.style.animation="rotate_surface_F 1s 1 linear";
	await sleep(1200); 

	for(var i=0;i<7;i++){
		cube_matrix[0][0][z][i]=cube_matrix_temp[0][2][z][i];
		cube_matrix[0][1][z][i]=cube_matrix_temp[1][2][z][i];
		cube_matrix[0][2][z][i]=cube_matrix_temp[2][2][z][i];
		cube_matrix[1][0][z][i]=cube_matrix_temp[0][1][z][i];
		cube_matrix[1][1][z][i]=cube_matrix_temp[1][1][z][i];
		cube_matrix[1][2][z][i]=cube_matrix_temp[2][1][z][i];
		cube_matrix[2][0][z][i]=cube_matrix_temp[0][0][z][i];
		cube_matrix[2][1][z][i]=cube_matrix_temp[1][0][z][i];
		cube_matrix[2][2][z][i]=cube_matrix_temp[2][0][z][i];
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	
	for(var x=0;x<3;x++){
		for(var y=0;y<3;y++){
			var new_rotate_str=fun_get_new_rotate_str(cube_matrix[x][y][z],"F");
			cube_matrix[x][y][z][0].style.transform="translateX("+100*(x-1)+"px) translateY("+100*(y-1)+"px) translateZ("+100*(z-1)+"px) "+new_rotate_str;
			obj_cube_3d.appendChild(cube_matrix[x][y][z][0]);
			cube_matrix[x][y][z][1]=cube_matrix_temp[x][y][z][5];
			cube_matrix[x][y][z][2]=cube_matrix_temp[x][y][z][6];
			cube_matrix[x][y][z][3]=cube_matrix_temp[x][y][z][3];
			cube_matrix[x][y][z][4]=cube_matrix_temp[x][y][z][4];
			cube_matrix[x][y][z][5]=cube_matrix_temp[x][y][z][2];
			cube_matrix[x][y][z][6]=cube_matrix_temp[x][y][z][1];
		}
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	obj_cube_3d.removeChild(obj_surface_div);
}

/* function fun_change_B_surface()函数对B面执行顺时针旋转90度操作，
实现面旋转动画效果，子块的位置和朝向样式属性更新，和div子块对象矩阵的状态更新 */
async function fun_change_B_surface(){
	console.log("fun_change_B_surface()");

	var z=0;

	obj_surface_div=document.createElement("div");
	transform_step_number=transform_step_number+1;
	obj_surface_div.setAttribute("id","transform_surface_"+transform_step_number);
	obj_surface_div.setAttribute("class","transform_surface");
	obj_surface_div.appendChild(cube_matrix[0][0][z][0]);
	obj_surface_div.appendChild(cube_matrix[0][1][z][0]);
	obj_surface_div.appendChild(cube_matrix[0][2][z][0]);
	obj_surface_div.appendChild(cube_matrix[1][0][z][0]);
	obj_surface_div.appendChild(cube_matrix[1][1][z][0]);
	obj_surface_div.appendChild(cube_matrix[1][2][z][0]);
	obj_surface_div.appendChild(cube_matrix[2][0][z][0]);
	obj_surface_div.appendChild(cube_matrix[2][1][z][0]);
	obj_surface_div.appendChild(cube_matrix[2][2][z][0]);
	obj_cube_3d.appendChild(obj_surface_div);
	
	obj_surface_div.style.transform=obj_surface_div.style.transform+"rotateZ(-90deg)";
	obj_surface_div.style.animation="rotate_surface_B 1s 1 linear";
	await sleep(1200); 

	for(var i=0;i<7;i++){
		cube_matrix[0][2][z][i]=cube_matrix_temp[0][0][z][i];
		cube_matrix[1][2][z][i]=cube_matrix_temp[0][1][z][i];
		cube_matrix[2][2][z][i]=cube_matrix_temp[0][2][z][i];
		cube_matrix[0][1][z][i]=cube_matrix_temp[1][0][z][i];
		cube_matrix[1][1][z][i]=cube_matrix_temp[1][1][z][i];
		cube_matrix[2][1][z][i]=cube_matrix_temp[1][2][z][i];
		cube_matrix[0][0][z][i]=cube_matrix_temp[2][0][z][i];
		cube_matrix[1][0][z][i]=cube_matrix_temp[2][1][z][i];
		cube_matrix[2][0][z][i]=cube_matrix_temp[2][2][z][i];
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	
	for(var x=0;x<3;x++){
		for(var y=0;y<3;y++){
			var new_rotate_str=fun_get_new_rotate_str(cube_matrix[x][y][z],"B");
			cube_matrix[x][y][z][0].style.transform="translateX("+100*(x-1)+"px) translateY("+100*(y-1)+"px) translateZ("+100*(z-1)+"px) "+new_rotate_str;
			obj_cube_3d.appendChild(cube_matrix[x][y][z][0]);
			cube_matrix[x][y][z][5]=cube_matrix_temp[x][y][z][1];
			cube_matrix[x][y][z][6]=cube_matrix_temp[x][y][z][2];
			cube_matrix[x][y][z][3]=cube_matrix_temp[x][y][z][3];
			cube_matrix[x][y][z][4]=cube_matrix_temp[x][y][z][4];
			cube_matrix[x][y][z][2]=cube_matrix_temp[x][y][z][5];
			cube_matrix[x][y][z][1]=cube_matrix_temp[x][y][z][6];
		}
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	obj_cube_3d.removeChild(obj_surface_div);
}

/* function fun_change_L_surface()函数对L面执行顺时针旋转90度操作，
实现面旋转动画效果，子块的位置和朝向样式属性更新，和div子块对象矩阵的状态更新 */
async function fun_change_L_surface(){
	console.log("fun_change_L_surface():");

	var x=0;

	obj_surface_div=document.createElement("div");
	transform_step_number=transform_step_number+1;
	obj_surface_div.setAttribute("id","transform_surface_"+transform_step_number);
	obj_surface_div.setAttribute("class","transform_surface");
	obj_surface_div.appendChild(cube_matrix[x][0][0][0]);
	obj_surface_div.appendChild(cube_matrix[x][0][1][0]);
	obj_surface_div.appendChild(cube_matrix[x][0][2][0]);
	obj_surface_div.appendChild(cube_matrix[x][1][0][0]);
	obj_surface_div.appendChild(cube_matrix[x][1][1][0]);
	obj_surface_div.appendChild(cube_matrix[x][1][2][0]);
	obj_surface_div.appendChild(cube_matrix[x][2][0][0]);
	obj_surface_div.appendChild(cube_matrix[x][2][1][0]);
	obj_surface_div.appendChild(cube_matrix[x][2][2][0]);
	obj_cube_3d.appendChild(obj_surface_div);
	obj_surface_div.style.transform="rotateX(-90deg)";
	obj_surface_div.style.animation="rotate_surface_L 1s 1 linear";
	await sleep(1200); 
	
	for(var i=0;i<7;i++){
		cube_matrix[x][0][0][i]=cube_matrix_temp[x][2][0][i];
		cube_matrix[x][0][1][i]=cube_matrix_temp[x][1][0][i];
		cube_matrix[x][0][2][i]=cube_matrix_temp[x][0][0][i];
		cube_matrix[x][1][0][i]=cube_matrix_temp[x][2][1][i];
		cube_matrix[x][1][1][i]=cube_matrix_temp[x][1][1][i];
		cube_matrix[x][1][2][i]=cube_matrix_temp[x][0][1][i];
		cube_matrix[x][2][0][i]=cube_matrix_temp[x][2][2][i];
		cube_matrix[x][2][1][i]=cube_matrix_temp[x][1][2][i];
		cube_matrix[x][2][2][i]=cube_matrix_temp[x][0][2][i];
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);

	for(var y=0;y<3;y++){
		for(var z=0;z<3;z++){
			var new_rotate_str=fun_get_new_rotate_str(cube_matrix[x][y][z],"L");
			cube_matrix[x][y][z][0].style.transform="translateX("+100*(x-1)+"px) translateY("+100*(y-1)+"px) translateZ("+100*(z-1)+"px) "+new_rotate_str;
			obj_cube_3d.appendChild(cube_matrix[x][y][z][0]);
			cube_matrix[x][y][z][3]=cube_matrix_temp[x][y][z][1];
			cube_matrix[x][y][z][4]=cube_matrix_temp[x][y][z][2];
			cube_matrix[x][y][z][2]=cube_matrix_temp[x][y][z][3];
			cube_matrix[x][y][z][1]=cube_matrix_temp[x][y][z][4];
			cube_matrix[x][y][z][5]=cube_matrix_temp[x][y][z][5];
			cube_matrix[x][y][z][6]=cube_matrix_temp[x][y][z][6];
		}
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	obj_cube_3d.removeChild(obj_surface_div);
}

/* function fun_change_R_surface()函数对R面执行顺时针旋转90度操作，
实现面旋转动画效果，子块的位置和朝向样式属性更新，和div子块对象矩阵的状态更新 */
async function fun_change_R_surface(){
	console.log("fun_change_R_surface():");

	var x=2;

	obj_surface_div=document.createElement("div");
	transform_step_number=transform_step_number+1;
	obj_surface_div.setAttribute("id","transform_surface_"+transform_step_number);
	obj_surface_div.setAttribute("class","transform_surface");
	obj_surface_div.appendChild(cube_matrix[x][0][0][0]);
	obj_surface_div.appendChild(cube_matrix[x][0][1][0]);
	obj_surface_div.appendChild(cube_matrix[x][0][2][0]);
	obj_surface_div.appendChild(cube_matrix[x][1][0][0]);
	obj_surface_div.appendChild(cube_matrix[x][1][1][0]);
	obj_surface_div.appendChild(cube_matrix[x][1][2][0]);
	obj_surface_div.appendChild(cube_matrix[x][2][0][0]);
	obj_surface_div.appendChild(cube_matrix[x][2][1][0]);
	obj_surface_div.appendChild(cube_matrix[x][2][2][0]);
	obj_cube_3d.appendChild(obj_surface_div);
	obj_surface_div.style.transform="rotateX(90deg)";
	obj_surface_div.style.animation="rotate_surface_R 1s 1 linear";
	await sleep(1200); 
	
	for(var i=0;i<7;i++){
		cube_matrix[x][0][0][i]=cube_matrix_temp[x][0][2][i];
		cube_matrix[x][0][1][i]=cube_matrix_temp[x][1][2][i];
		cube_matrix[x][0][2][i]=cube_matrix_temp[x][2][2][i];
		cube_matrix[x][1][0][i]=cube_matrix_temp[x][0][1][i];
		cube_matrix[x][1][1][i]=cube_matrix_temp[x][1][1][i];
		cube_matrix[x][1][2][i]=cube_matrix_temp[x][2][1][i];
		cube_matrix[x][2][0][i]=cube_matrix_temp[x][0][0][i];
		cube_matrix[x][2][1][i]=cube_matrix_temp[x][1][0][i];
		cube_matrix[x][2][2][i]=cube_matrix_temp[x][2][0][i];
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);

	for(var y=0;y<3;y++){
		for(var z=0;z<3;z++){
			var new_rotate_str=fun_get_new_rotate_str(cube_matrix[x][y][z],"R");
			cube_matrix[x][y][z][0].style.transform="translateX("+100*(x-1)+"px) translateY("+100*(y-1)+"px) translateZ("+100*(z-1)+"px) "+new_rotate_str;
			obj_cube_3d.appendChild(cube_matrix[x][y][z][0]);
			cube_matrix[x][y][z][1]=cube_matrix_temp[x][y][z][3];
			cube_matrix[x][y][z][2]=cube_matrix_temp[x][y][z][4];
			cube_matrix[x][y][z][3]=cube_matrix_temp[x][y][z][2];
			cube_matrix[x][y][z][4]=cube_matrix_temp[x][y][z][1];
			cube_matrix[x][y][z][5]=cube_matrix_temp[x][y][z][5];
			cube_matrix[x][y][z][6]=cube_matrix_temp[x][y][z][6];
		}
	}
	fun_copy_array(cube_matrix,cube_matrix_temp);
	obj_cube_3d.removeChild(obj_surface_div);
}

/* fun_get_current_graphic_state()函数读取魔方数组cube_matrix的元素属性，
获取并返回当前魔方状态字符串*/
function fun_get_current_graphic_state(){
	graphic_state_string=cube_matrix[0][0][0][1]+cube_matrix[1][0][0][1]+cube_matrix[2][0][0][1]+ /*U面*/
                         cube_matrix[0][0][1][1]+cube_matrix[1][0][1][1]+cube_matrix[2][0][1][1]+
                         cube_matrix[0][0][2][1]+cube_matrix[1][0][2][1]+cube_matrix[2][0][2][1]+
                         cube_matrix[2][0][2][6]+cube_matrix[2][0][1][6]+cube_matrix[2][0][0][6]+ /*R面*/
                         cube_matrix[2][1][2][6]+cube_matrix[2][1][1][6]+cube_matrix[2][1][0][6]+
                         cube_matrix[2][2][2][6]+cube_matrix[2][2][1][6]+cube_matrix[2][2][0][6]+
                         cube_matrix[0][0][2][3]+cube_matrix[1][0][2][3]+cube_matrix[2][0][2][3]+ /*F面*/
                         cube_matrix[0][1][2][3]+cube_matrix[1][1][2][3]+cube_matrix[2][1][2][3]+
                         cube_matrix[0][2][2][3]+cube_matrix[1][2][2][3]+cube_matrix[2][2][2][3]+
                         cube_matrix[0][2][2][2]+cube_matrix[1][2][2][2]+cube_matrix[2][2][2][2]+ /*D面*/
                         cube_matrix[0][2][1][2]+cube_matrix[1][2][1][2]+cube_matrix[2][2][1][2]+
                         cube_matrix[0][2][0][2]+cube_matrix[1][2][0][2]+cube_matrix[2][2][0][2]+
                         cube_matrix[0][0][0][5]+cube_matrix[0][0][1][5]+cube_matrix[0][0][2][5]+ /*L面*/
                         cube_matrix[0][1][0][5]+cube_matrix[0][1][1][5]+cube_matrix[0][1][2][5]+
                         cube_matrix[0][2][0][5]+cube_matrix[0][2][1][5]+cube_matrix[0][2][2][5]+
                         cube_matrix[2][0][0][4]+cube_matrix[1][0][0][4]+cube_matrix[0][0][0][4]+ /*B面*/
                         cube_matrix[2][1][0][4]+cube_matrix[1][1][0][4]+cube_matrix[0][1][0][4]+
                         cube_matrix[2][2][0][4]+cube_matrix[1][2][0][4]+cube_matrix[0][2][0][4]
    graphic_state_string=graphic_state_string.replace(/y-/g,'U').replace(/x\+/g,'R').replace(/z\+/g,'F').replace(/y\+/g,'D').replace(/x-/g,'L').replace(/z-/g,'B');
    if(graphic_state_string=="UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"){
	    document.getElementById("text_current_graphic_state").value="初始状态: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB";
	} else {
		document.getElementById("text_current_graphic_state").value=graphic_state_string;
	}
	console.log("graphic_state_string="+graphic_state_string);
	return graphic_state_string;
}

/* fun_resolve_cube()函数调用 kociemba.js 算法代码中的接口方法，
根据输入的状态字符串，计算得出解魔方步骤字符串*/
function fun_resolve_cube(cube_state_string){
	//console.log("cube_state_string="+cube_state_string);
	if(cube_state_string=="UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"){
		resolve_step_string="";
	} else {
	    resolve_step_string=Module.ccall('solve', 'string', ['string'], [cube_state_string]);
	    split_str=resolve_step_string.split(" ");
	    resolve_step_string_new="";
	    for(var i=0;i<split_str.length;i++){
	    	if(split_str[i].substring(1)=="'"){
	    		resolve_step_string_new=resolve_step_string_new+split_str[i].substring(0,1)+split_str[i].substring(0,1)+split_str[i].substring(0,1);
	    	} else if(split_str[i].substring(1)=="2"){
	    		resolve_step_string_new=resolve_step_string_new+split_str[i].substring(0,1)+split_str[i].substring(0,1);
	    	} else{
	    		resolve_step_string_new=resolve_step_string_new+split_str[i].substring(0,1);
	    	}
	    }
	    resolve_step_string=resolve_step_string_new;
	}
	//console.log("resolve_step_string="+resolve_step_string);
	return resolve_step_string;
}

/* fun_resolve_from_graphic()函数先调用 fun_get_current_graphic_state()函数获取当前状态字符串,
然后调用 fun_resolve_cube()函数，计算解魔方步骤字符串，
最后调用 fun_execute_transform()函数，根据解魔方步骤执行魔方变换操作*/
function fun_resolve_from_graphic(){
	graphic_state_string=fun_get_current_graphic_state();
	if(graphic_state_string=="UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"){
	    document.getElementById("text_resolve_from_graphic_step").value="无需操作";
	} else{
	    resolve_step_string=fun_resolve_cube(graphic_state_string);
	    document.getElementById("text_resolve_from_graphic_step").value=resolve_step_string;
		//console.log("resolve_step_string="+resolve_step_string);
	    fun_execute_transform(resolve_step_string);
	}
}

/* fun_transform_to_input_state()函数将魔方图形从 初始状态 变换至 用户输入的状态字符串 的状态*/
function fun_transform_to_input_state(){
	cube_state_string=document.getElementById("text_cube_state_string").value;
	resolve_step_string=fun_resolve_cube(cube_state_string);
	transform_to_input_step=resolve_step_string.split('').reverse().join('');
	transform_to_input_step=transform_to_input_step.replace(/U/g,'UUU').replace(/R/g,'RRR').replace(/F/g,'FFF').replace(/D/g,'DDD').replace(/L/g,'LLL').replace(/B/g,'BBB').replace(/UUUU/g,'').replace(/RRRR/g,'').replace(/FFFF/g,'').replace(/DDDD/g,'').replace(/LLLL/g,'').replace(/BBBB/g,'');
    console.log("transform_to_input_step="+transform_to_input_step);
	fun_execute_transform(transform_to_input_step);
}

/* fun_resolve_from_input_state()函数将魔方图形从 用户输入的状态字符串 变换至 初始状态*/
function fun_resolve_from_input_state(){
	cube_state_string=document.getElementById("text_cube_state_string").value;
	resolve_step_string=fun_resolve_cube(cube_state_string);
	document.getElementById("text_resolve_step_string").value=resolve_step_string;
	//console.log("resolve_step_string="+resolve_step_string);
	fun_execute_transform(resolve_step_string);
}