javascript:
/*RANK jelentése:
100%-kal több fakitermelés 1
100%-kal több agyagkitermelés 2
100%-kal több vaskitermelés 3
30%-kal több nyersanyag kitermelés (minden nyersanyagból) 8
50%-kal nagyobb raktárkapacitás és kereskedõszám 9
50%-kal gyorsabb képzés a mûhelyben 7
33%-kal gyorsabb képzés a barakkban 5
33%-kal gyorsabb képzés az istállóban 6
10%-kal több népesség 4*/
try{if (document.getElementById("options").innerHTML!=undefined) {alert("Már fut"); exit(0);}}catch(e){}
try{
sor=document.documentElement.innerText.split("\n");

img1 = new Image();
img1.src = "http://muhely2.cncdani2.freeiz.com/images/preloader-w8-line-black.gif";
document.documentElement.innerHTML+='<div id="options" style="width: 270px;  background: #e3c68c; background-image: url(\'http://cncdani2.000webhostapp.com/images/Script/Bir_ker.jpg\');background-repeat:no-repeat; background-position:left top; color: black;  position: fixed; left:10%; top:10%; border:3px solid black; text-shadow: 0 0 2px white; font-size: 15px; font-family:Lucida Sans Unicode; padding: 13px; z-index:2;"><br><p style="display:inline">Falu(k): </p><a href="javascript: csere()" style="text-decoration:none; border-bottom:1px dashed #0000CC; font-size:small; color:#55F">(Csere)</a> <input type="text" value="" size="17" id="falus"><br>Max táv:<input type="text" value="10.0" size="4"> mezõ<br>Min pont:<input type="text" value="" size="4">Max pont:<input type="text" value="" size="4"><br>Falunév leszûrõ: <input type="text" value="V%C3%A1roskapu" size="15"><input type="radio" name="selector" value="mind" checked="true">Minden<br><input type="radio" name="selector" value="barb">Csak barbár<br><input type="radio" name="selector" value="jatek">Csak játékos<br><input type="button" style="margin-top:5px" onclick="javascript: keres()" value="Keresés..."><br><br>Eredmény:<br><textarea style="background-color: #c0c0c0; opacity: 0.8;" id="result" onclick=\'this.select();\' rows="10" cols="32"  readonly="readonly"></textarea><p id="work" style="position: absolute;bottom: 170px;right: 39px;"></p></div>';
data=document.getElementById("options");
result=document.getElementById("result");
}catch(e){alert(e);}
/*---------------------------*/
function csere(){try{
	var csere=data.getElementsByTagName("p")[0];
	if (csere.innerHTML=="Falu(k): ") {
		csere.innerHTML="Játékos ID: ";
		document.getElementById("falus").setAttribute("size","14");
	} else {
		csere.innerHTML="Falu(k): ";
		document.getElementById("falus").setAttribute("size","17");
	}
	return;
}catch(e){alert("Hiba történt:\n"+e);}}
/*17.98 LETT. VOLT: 18.27*/
function keres(){
	try{
	var falu = new Array();
	if (data.getElementsByTagName("p")[0].innerHTML=="Játékos ID: "){
		/*Játékos ID faluinak keresése*/
		var player=data.getElementsByTagName("input")[0].value;
		player=player.replace(/[^0-9]/g,"");
		if (player=="") {alert("A játékos azonosítója csak számokból áll."); return;}
		data.getElementsByTagName("input")[0].value=player;
		var found=false;
		for (var i=1;i<sor.length;i++){
			if (sor[i].split(",")[4]==player){
				found=true;
				falu.push(sor[i].split(",")[2]+"|"+sor[i].split(",")[3]);
			}
		}
		if (!found) {alert("Nem létezik játékos ilyen azonosítóval!"); return;}
	} else {
		try{
			falu=data.getElementsByTagName("input")[0].value.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
		}catch(e){alert("Nem található koordináta a listában"); return;}}

	result.innerHTML='FaluID\tKoordi\tTáv\tPontszám\tJátékos ID\n';

	var tav=data.getElementsByTagName("input")[1].value;
	tav=tav.replace(/[^0-9\.]/g,""); data.getElementsByTagName("input")[1].value=tav;
	if (tav=="") {alert("A távolság egy pozitív valós szám lehet. Tizedesvesszõ elválasztására .-ot használj!");return;}
	tav=parseFloat(tav); data.getElementsByTagName("input")[1].value=tav;

	var minp=data.getElementsByTagName("input")[2].value;
	minp=minp.replace(/[^0-9]/g,""); data.getElementsByTagName("input")[2].value=minp;
	var maxp=data.getElementsByTagName("input")[3].value;
	maxp=maxp.replace(/[^0-9]/g,""); data.getElementsByTagName("input")[3].value=maxp;

	if (minp=="") minp=0;if (maxp=="" || maxp=="0") maxp=13000;
	minp=parseInt(minp); maxp=parseInt(maxp);
	if (maxp<minp) {maxp=minp; data.getElementsByTagName("input")[3].value=maxp;}

	var barb=true; if (data.getElementsByTagName("input")[6].checked==false) barb=false;
	var jatek=false; if (data.getElementsByTagName("input")[7].checked==true) jatek=true; 
	var falunev=data.getElementsByTagName("input")[4].value;

	document.getElementById("work").innerHTML='<img src="http://muhely2.cncdani2.freeiz.com/images/preloader-w8-line-black.gif" alt="" width="100px">Feldolgozás...';

	var str="";
	for (var i=0;i<sor.length;i++){
		pont=parseInt(sor[i].split(",")[5]);
		if (pont<minp) continue;
		if (pont>maxp) continue;
		if (barb && sor[i].split(",")[4]!="0") continue;
		if (jatek && sor[i].split(",")[4]=="0") continue;
		if (falunev == sor[i].split(",")[1]) continue;
				
		for (var j=0;j<falu.length;j++){
			var x=parseInt(sor[i].split(",")[2]);
			var atf2=Math.abs(parseInt(falu[j].match(/[0-9]+/g)[0],10)-x);
			if(atf2>tav) continue;
			
			var y=parseInt(sor[i].split(",")[3]);
			var atf1=Math.abs(parseInt(falu[j].match(/[0-9]+/g)[1],10)-y);
			if(atf1>tav) continue;
			
			RTav=Math.sqrt(Math.pow(atf1,2)+Math.pow(atf2,2));

			if (RTav<=tav) {
				RTav=RTav.toFixed(2);
				RTav=RTav.toString();
				RTav=RTav.replace(".",",");
				str+=sor[i].split(",")[0]+"\t"+x+"|"+y+"\t"+RTav+"\t"+sor[i].split(",")[5]+"\t"+sor[i].split(",")[4]+"\n";
				break;
			}
		}
	}
	document.getElementById("result").innerHTML+=str;
	}catch(e){alert(e);}
	document.getElementById("work").innerHTML="Feldolgozás kész!";
}
void(0);