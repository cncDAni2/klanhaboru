javascript:
/*RANK jelent�se:
100%-kal t�bb fakitermel�s 1
100%-kal t�bb agyagkitermel�s 2
100%-kal t�bb vaskitermel�s 3
30%-kal t�bb nyersanyag kitermel�s (minden nyersanyagb�l) 8
50%-kal nagyobb rakt�rkapacit�s �s keresked�sz�m 9
50%-kal gyorsabb k�pz�s a m�helyben 7
33%-kal gyorsabb k�pz�s a barakkban 5
33%-kal gyorsabb k�pz�s az ist�ll�ban 6
10%-kal t�bb n�pess�g 4*/
try{if (document.getElementById("options").innerHTML!=undefined) {alert("M�r fut"); exit(0);}}catch(e){}
try{
sor=document.documentElement.innerText.split("\n");

img1 = new Image();
img1.src = "http://muhely2.cncdani2.freeiz.com/images/preloader-w8-line-black.gif";
document.documentElement.innerHTML+='<div id="options" style="width: 270px;  background: #e3c68c; background-image: url(\'http://cncdani2.000webhostapp.com/images/Script/Bir_ker.jpg\');background-repeat:no-repeat; background-position:left top; color: black;  position: fixed; left:10%; top:10%; border:3px solid black; text-shadow: 0 0 2px white; font-size: 15px; font-family:Lucida Sans Unicode; padding: 13px; z-index:2;"><br><p style="display:inline">Falu(k): </p><a href="javascript: csere()" style="text-decoration:none; border-bottom:1px dashed #0000CC; font-size:small; color:#55F">(Csere)</a> <input type="text" value="" size="17" id="falus"><br>Max t�v:<input type="text" value="10.0" size="4"> mez�<br>Min pont:<input type="text" value="" size="4">Max pont:<input type="text" value="" size="4"><br>Falun�v lesz�r�: <input type="text" value="V%C3%A1roskapu" size="15"><input type="radio" name="selector" value="mind" checked="true">Minden<br><input type="radio" name="selector" value="barb">Csak barb�r<br><input type="radio" name="selector" value="jatek">Csak j�t�kos<br><input type="button" style="margin-top:5px" onclick="javascript: keres()" value="Keres�s..."><br><br>Eredm�ny:<br><textarea style="background-color: #c0c0c0; opacity: 0.8;" id="result" onclick=\'this.select();\' rows="10" cols="32"  readonly="readonly"></textarea><p id="work" style="position: absolute;bottom: 170px;right: 39px;"></p></div>';
data=document.getElementById("options");
result=document.getElementById("result");
}catch(e){alert(e);}
/*---------------------------*/
function csere(){try{
	var csere=data.getElementsByTagName("p")[0];
	if (csere.innerHTML=="Falu(k): ") {
		csere.innerHTML="J�t�kos ID: ";
		document.getElementById("falus").setAttribute("size","14");
	} else {
		csere.innerHTML="Falu(k): ";
		document.getElementById("falus").setAttribute("size","17");
	}
	return;
}catch(e){alert("Hiba t�rt�nt:\n"+e);}}
/*17.98 LETT. VOLT: 18.27*/
function keres(){
	try{
	var falu = new Array();
	if (data.getElementsByTagName("p")[0].innerHTML=="J�t�kos ID: "){
		/*J�t�kos ID faluinak keres�se*/
		var player=data.getElementsByTagName("input")[0].value;
		player=player.replace(/[^0-9]/g,"");
		if (player=="") {alert("A j�t�kos azonos�t�ja csak sz�mokb�l �ll."); return;}
		data.getElementsByTagName("input")[0].value=player;
		var found=false;
		for (var i=1;i<sor.length;i++){
			if (sor[i].split(",")[4]==player){
				found=true;
				falu.push(sor[i].split(",")[2]+"|"+sor[i].split(",")[3]);
			}
		}
		if (!found) {alert("Nem l�tezik j�t�kos ilyen azonos�t�val!"); return;}
	} else {
		try{
			falu=data.getElementsByTagName("input")[0].value.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
		}catch(e){alert("Nem tal�lhat� koordin�ta a list�ban"); return;}}

	result.innerHTML='FaluID\tKoordi\tT�v\tPontsz�m\tJ�t�kos ID\n';

	var tav=data.getElementsByTagName("input")[1].value;
	tav=tav.replace(/[^0-9\.]/g,""); data.getElementsByTagName("input")[1].value=tav;
	if (tav=="") {alert("A t�vols�g egy pozit�v val�s sz�m lehet. Tizedesvessz� elv�laszt�s�ra .-ot haszn�lj!");return;}
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

	document.getElementById("work").innerHTML='<img src="http://muhely2.cncdani2.freeiz.com/images/preloader-w8-line-black.gif" alt="" width="100px">Feldolgoz�s...';

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
	document.getElementById("work").innerHTML="Feldolgoz�s k�sz!";
}
void(0);