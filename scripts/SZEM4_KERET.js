javascript:
function stop(){
var x = setTimeout('',100); for (var i = 0 ; i < x ; i++) clearTimeout(i);}
stop(); /*Id�stop*/
document.getElementsByTagName("html")[0].setAttribute("class","");

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

if (typeof(AZON)!="undefined") exit();
try{ /*Rendszeradatok*/
var SZEM4_LOCAL_STORAGE="";
var AZON="S0";
if (window.name.indexOf(AZON)>-1) AZON="S1";
var BASE_URL=document.location.href.split("game.php")[0];
var CONFIG=loadXMLDoc(BASE_URL+"interface.php?func=get_config");
var SPEED=parseFloat(CONFIG.getElementsByTagName("speed")[0].textContent);
var UNIT_S=parseFloat(CONFIG.getElementsByTagName("unit_speed")[0].textContent);
var VILL1ST="";
var ALTBOT=true;
var VERZIO="4.570828"; /* (4.)+(kieg.-ek sz�ma)+(alverz:(d�tum[�HHNN]))*/

AZON=game_data.player.id+"_"+game_data.world+AZON;
}catch(e){alert(e);}

function vercheck(){try{
	if (typeof(CVERZIO)=="undefined") {naplo("Glob�l","Verzi�ellen�rz�s nem lehets�ges. <a href='https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/szem4/SZEM4_VER.js' target='_BLANK'>Kattints ide</a> hogy megn�zd mi a legfrisebb v�ltozat. A ti�d: "+VERZIO); return;}
	if (CVERZIO!=VERZIO) naplo("Glob�l","<b>�j verzi� jelent meg!</b> Friss�t�s aj�nlott. Jelenlegi: "+VERZIO+". �j: "+CVERZIO);
}catch(e){alert2(e);}}

function init(){try{
	if (document.getElementById("production_table"))  var PFA=document.getElementById("production_table"); else 
	if (document.getElementById("combined_table"))  var PFA=document.getElementById("combined_table"); else 
	if (document.getElementById("buildings_table"))  var PFA=document.getElementById("buildings_table"); else 
	if (document.getElementById("techs_table"))  var PFA=document.getElementById("techs_table"); else 
	{alert("Ilyen n�zetbe val� futtat�s nem t�mogatott. K�s�rlet az �ttekint�s bet�lt�s�re...\n\nLaunching from this view is not supported. Trying to load overview..."); document.location.href=document.location.href.replace(/screen=[a-zA-Z]+/g,"screen=overview_villages"); return false;}
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (patt.test(PFA.rows[1].cells[0].textContent)) var oszl=0; else
	if (patt.test(PFA.rows[1].cells[1].textContent)) var oszl=1; else
	if (patt.test(PFA.rows[1].cells[2].textContent)) var oszl=2; else
	{alert("Nem tal�lok koordin�t�kat ebbe a list�ba.\n\nI can not find coordinates in this view."); return false;}
	VILL1ST=PFA.rows[1].cells[oszl].getElementsByTagName("a")[0].href;
	for (var i=1;i<PFA.rows.length;i++){
		var kord=PFA.rows[i].cells[oszl].textContent.match(/[0-9]+(\|)[0-9]+/g);
		kord=kord[kord.length-1];
		KTID[i-1]=kord+";"+PFA.rows[i].cells[oszl].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0];
	}
	document.getElementsByTagName("head")[0].innerHTML += '<style type="text/css">body{ background: #111; } table.fej{ padding:1px;  margin:auto; color: white; border: 1px solid yellow; } table.menuitem{ vertical-align:top; text-align: top; padding: 20px; margin:auto; color: white; border: 1px solid yellow; } table.menuitem td{ padding: 0px; vertical-align:top; }  table{ padding: 0px; margin: auto; color: white;  } table.vis{ color:black; } table.vis td, table.vis th{ padding: 3px 6px 3px 6px;  } #farm_honnan tr td:last-child{font-size:50%;  width:130px;} #farm_hova tr td:last-child{font-size:50%; width:130px;}  textarea{ background-color: #020; color:white; } .divrow{ display: table-row; } .divcell { display: table-cell; text-align: center; vertical-align:top; }  a{ color: white; } img{ border-color: grey; padding:1px; } #naploka a {color:blue;} input[type="button"] {font-size:13px; font-family:Century Gothic,sans-serif;    color:#FFFF77;    background-color:#3366CC;    border-style:ridge;    border-color:#000000;    border-width:3px; }  </style>';
	document.getElementsByTagName("body")[0].innerHTML='<div id="alert2" style="width: 300px; background-color: #60302b; color: #FFA; position: fixed; left:40%; top:40%; border:3px solid black; font-size: 11pt; padding: 5px; z-index:200; display:none"><div id="alert2head" style="width:100%;cursor:all-scroll; text-align:right; background: rgba(255,255,255,0.1)"><a href=\'javascript: alert2("close");\'>X (Bez�r)</a></div><p id="alert2szov"></p></div> <table width="1024px" align="center" class="fej" style="background: #111; background-image:url(\''+pic("wallp.jpg")+'\'); background-size:1024px;"> <tr><td width="70%" id="fejresz" style="vertical-align:middle; margin:auto;"><h1><i></i></h1></td><td id="sugo" height="110px"></td></tr> <tr><td colspan="2" id="menuk" style="">  	<div class="divrow" style="width: 1024px"> 		<span class="divcell" id="kiegs" style="text-align:left; padding-top: 5px;width:774px;"><img src="'+pic("muhely_logo.png")+'" alt="Muhely" title="C&amp;C M�hely megnyit�sa" onclick="window.open(\'http://cncdani2.000webhostapp.com/index.php\')"> <img src="'+pic("kh_logo.png")+'" alt="Game" title="Kl�nh�bor� megnyit�sa" onclick="window.open(\''+VILL1ST+'\')"> | </span> 		<span class="divcell" style="text-align:right; width:250px"> 			<a href=\'javascript: nyit("naplo");\' onmouseover="sugo(\'Esem�nyek napl�ja\')">Napl�</a> 			<a href=\'javascript: nyit("debug");\' onmouseover="sugo(\'Hibanapl�\')">Debug</a> 			<a href=\'javascript: nyit("hang");\'><img src="'+pic("hang.png")+'" onmouseover="sugo(\'Hangbe�ll�t�sok\')" alt="hangok"></a> 		</span> 	</div> 	 </td></tr> </table> <p id="content" style="display: inline"></p>';
	document.getElementById("content").innerHTML='<table class="menuitem" width="1024px" align="center" id="naplo" style="display: none"> <tr><td> <h1 align="center">Napl�</h1><br> <br> <table align="center" class="vis" id="naploka"><tr><th onclick=\'rendez("datum2",false,this,"naploka",0)\'  style="cursor: pointer;">D�tum</th><th  onclick=\'rendez("szoveg",false,this,"naploka",1)\' style="cursor: pointer;">Script</th><th  onclick=\'rendez("szoveg",false,this,"naploka",2)\' style="cursor: pointer;">Esem�ny</th></tr></table> </td></tr> </table>  <table class="menuitem" width="1024px" align="center" id="debug" style="display: none"> <tr><td> <h1 align="center">DeBugger</h1><br> <br> <table align="center" class="vis" id="debugger"><tr><th onclick=\'rendez("datum2",false,this,"debugger",0)\' style="cursor: pointer;">D�tum</th><th onclick=\'rendez("szoveg",false,this,"debugger",1)\' style="cursor: pointer;">Script</th><th onclick=\'rendez("szoveg",false,this,"debugger",2)\' style="cursor: pointer;">Esem�ny</th></tr></table> </td></tr> </table>  <table class="menuitem" width="1024px" align="center" id="hang" style="display: none"> <tr><td> <p align="center"><audio id="audio1" controls="controls" autoplay="autoplay"><source id="wavhang" src="" type="audio/wav"></audio></p> <h1 align="center">Hangbe�ll�t�s</h1><br> <div id="hangok" style="display:table;"> 	<div style="display:table-row;"><div style="display:table-cell; padding:10px;" onmouseover=\'sugo("Ha be van kapcsolva, bot v�delem eset�n ez a link is megnyit�dik, mint figyelmeztet�s.")\'><b>Alternat�v botriad�? <a href="javascript: altbot()">BEKAPCSOLVA</a><br>Megnyitott URL (egyszer)<br><input type="text" id="altbotURL" size="42" value="http://www.youtube.com/watch?v=k2a30--j37Q"></div>   </div> </div> </td></tr> </table>';
	document.title="SZEM IV";
	
	debug("SZEM 4","Verzi�: "+VERZIO);
	debug("SZEM 4","Prog.azon: "+AZON);
	debug("SZEM 4","W-Speed: "+SPEED);
	debug("SZEM 4","U-Speed: "+UNIT_S);
	return true;
}catch(e){alert("Hiba ind�t�skor:\n\nError at starting:\n"+e); return false;}}

function pic(file){
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/szem4/"+file;
}

function altbot(){try{
	alert(ALTBOT);
	ALTBOT=!ALTBOT;
	if (ALTBOT) {
		document.getElementById("altbotURL").parentNode.getElementsByTagName("a")[0].innerHTML="BEKAPCSOLVA";
		document.getElementById("altbotURL").removeAttribute("disabled");
	} else {
		document.getElementById("altbotURL").parentNode.getElementsByTagName("a")[0].innerHTML="KIKAPCSOLVA";
		document.getElementById("altbotURL").setAttribute("disabled","true");
	}
	return;
}catch(e){alert(e);}}

function soundVolume(vol){
	document.getElementById("audio1").volume=vol;
}

function playSound(hang){try{
	var ison=document.getElementsByName(hang)[0];
	if (ison==undefined) {debug("hanghiba","Nem defini�lt hang: "+hang); return}
	if (ison.checked==false) return;
	var play="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/szem4/"+hang+".wav";
	document.getElementById("wavhang").src=play;
	document.getElementById("audio1").load();
	setTimeout('if (document.getElementById("audio1").paused) document.getElementById("audio1").play()',666);
}catch(e){alert2(e);}}

function validate(evt) {
  var theEvent = evt || window.event;
  var key = theEvent.keyCode || theEvent.which;
  key = String.fromCharCode( key );
  var regex = /[0-9]|\./;
  if( !regex.test(key) ) {
	theEvent.returnValue = false;
	if(theEvent.preventDefault) theEvent.preventDefault();
  }
}

function shorttest(){try{
	return;
	var hiba=""; var warn="";
	var nez=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
	
	if (nez[0].value=="") hiba+="Termel�s/�ra �rt�ke �res. Legal�bb egy 0 szerepeljen!\n";
	if (parseInt(nez[0].value,10)<50) warn+="Termel�s/�ra �rt�ke nagyon alacsony. \n";
	
	if (nez[1].value=="") hiba+="Max t�v/�ra: �res �rt�k. \n";
	if (nez[2].value=="") hiba+="Max t�v/perc: �res �rt�k. \n";
	if (parseInt(nez[1].value,10)==0 && parseInt(nez[2].value,10)<1) hiba+="A jelenleg megadott max t�vols�g 0!\n";	
	if (parseInt(nez[1].value,10)==0 && parseInt(nez[2].value,10)<40) warn+="A jelenleg megadott max t�vols�g nagyon r�vid!\n";	
	
	if (nez[3].value=="") hiba+="A hat�rsz�m �rt�ke �res. Minimum megengedett �rt�ke: 100.\n";
	if (parseInt(nez[3].value,10)<100) hiba+="A hat�rsz�m �rt�ke t�l alacsony. Minimum megengedett �rt�ke: 100.\n";
	
	
	if (nez[4].value=="") hiba+="Ha nem szeretn�l k�met k�ldeni, �rj be 0-t.\n";
	if (parseInt(nez[4].value,10)>3) warn+="3-n�l t�bb k�m egyik szerveren sem sz�ks�ges. Javasolt: 1 vagy 3.\n";
	if (nez[5].checked && parseInt(nez[4].value,10)==0) warn+="K�nyszer�ted a k�mek k�ld�s�t, de a k�ldend� k�m �rt�k�re 0 van megadva!\n";
	if (nez[6].checked && parseInt(nez[4].value,10)==0) warn+="Kezd� k�mt�mad�st szeretn�l, de a k�ldend� k�m �rt�k�re 0 van megadva!\n";
	
	if (nez[7].value=="") hiba+="Ha minimum limit n�lk�l szeretn�d egys�geid k�ldeni, �rj be 0-t.\n";
	var hatarszam=parseInt(nez[3].value,10);
	var minsereg=parseInt(nez[7].value,10);
	
	if (Math.ceil(hatarszam/20)<minsereg) hiba+="A minimum sereg/falu legal�bb 20x-osa kell hogy legyen a hat�rsz�m. Javaslatok: Minimum sereg "+Math.ceil(hatarszam/20)+", vagy Hat�rsz�m: "+Math.ceil(minsereg*20)+"\n";
	
	if (nez[8].value=="") hiba+="A legkevesebb pihen� id�: 1 perc, ne hagyd �resen.\n";
	if (parseInt(nez[8].value,10)<1) hiba+="A legkevesebb pihen� id�: 1 perc.\n";
	if (parseInt(nez[8].value,10)>150) hiba+="150 percn�l t�bb pihen� id�t nem lehet megadni.\n";
	if (nez[9].value=="") hiba+="A leggyorsabb ciklusid�: 200 ms, ne hagyd �resen.\n";
	if (parseInt(nez[9].value,10)<200) hiba+="A leggyorsabb ciklusid�: 200 ms\n";
	if (parseInt(nez[9].value,10)>3000) hiba+="3000 ms-n�l t�bb ciklusid� felesleges, �s felt�n�. �rj be 3000 alatti �rt�ket.\n";
	
	if (parseInt(nez[10].value,10)<20) hiba+="Rakt�r tel�tetts�gi �rt�ke t�l alacsony, �gy v�lhet�leg sehonnan se fog fosztani.";
	
	if (hiba!="" && !FARM_PAUSE) szunet("farm",document.getElementsByName("farm")[0]);
	if (FARM_PAUSE) warn+="A farmol� jelenleg meg van �ll�tva!";
	if (hiba!="") {alert2("<b>Egy vagy t�bb be�ll�t�si hiba miatt nem ind�that� a farmol�! Jav�tsa, majd ind�tsa el a kieg�sz�t�t.</b><br><br>"+hiba); return false;} 
		else { if (warn=="") alert2("close");
					else alert2("Javaslatok:\n"+warn);
			   return true;} 
	return;
}catch(e){alert2("Hiba :(\n"+e);}}

var SUGOORA;
function sugo(str){
	var hossz=str.length;
	hossz=Math.round((hossz*1000)/23);
	if (SUGOORA!="undefined") clearTimeout(SUGOORA);
	document.getElementById("sugo").innerHTML=str;
	if (str!="") SUGOORA=setTimeout('sugo("")',hossz);
	return;
}

function prettyDatePrint(m){
	return m.getFullYear() + "/" +
    ("0" + (m.getMonth()+1)).slice(-2) + "/" +
    ("0" + m.getDate()).slice(-2) + " " +
    ("0" + m.getHours()).slice(-2) + ":" +
    ("0" + m.getMinutes()).slice(-2) + ":" +
    ("0" + m.getSeconds()).slice(-2);
}
function nyit(ezt){try{
	var temp=document.getElementById("content").childNodes;
	var cid="";
	for (var i=0;i<temp.length;i++){
		if (temp[i].nodeName.toUpperCase()=="TABLE") {cid=temp[i].getAttribute("id");
		$("#"+cid).fadeOut(300);}
	} var patt=new RegExp("\""+ezt+"\"");
	temp=document.getElementById("menuk").getElementsByTagName("a");
	for (i=0;i<temp.length;i++){
		temp[i].style.padding="3px";
		if (patt.test(temp[i].getAttribute("href"))) temp[i].style.backgroundColor="#000000"; else temp[i].style.backgroundColor="transparent";
	}
	setTimeout(function(){$("#"+ezt).fadeIn(300)},300);
}catch(e){alert(e);}}

function alert2(szov){
	szov=szov+"";
	if (szov=="close") {$("#alert2").hide(); return;}
	szov=szov.replace("\n","<br>");
	document.getElementById("alert2szov").innerHTML="<b>�zenet:</b><br>"+szov;
	$("#alert2").show();
}

function naplo(script,szoveg){
	var d=new Date();
	var perc=d.getMinutes(); var mp=d.getSeconds(); if (perc<10) perc="0"+perc; if (mp<10) mp="0"+mp;
	var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
	var table=document.getElementById("naploka");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=honap[d.getMonth()]+" "+d.getDate()+", "+d.getHours()+":"+perc+":"+mp;
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
	playSound("naplobejegyzes");
	return;
}
function debug(script,szoveg){
	var d=new Date();
	var perc=d.getMinutes(); var mp=d.getSeconds(); if (perc<10) perc="0"+perc; if (mp<10) mp="0"+mp;
	var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
	var table=document.getElementById("debugger");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=honap[d.getMonth()]+" "+d.getDate()+", "+d.getHours()+":"+perc+":"+mp;
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
}

function ujkieg(id,nev,tartalom){
	if (document.getElementById(nev)) return false;
	document.getElementById("kiegs").innerHTML+='<img onclick=\'szunet("'+id+'",this)\' name="'+id+'" onmouseover=\'sugo("Az �rintett scriptet tudod meg�ll�tani/elind�tani.")\' src="'+pic("play.png")+'" alt="Stop" title="Klikk a sz�neteltet�shez"> <a href=\'javascript: nyit("'+id+'");\'>'+nev.toUpperCase()+'</a> ';
	document.getElementById("content").innerHTML+='<table class="menuitem" width="1024px" align="center" id="'+id+'" style="display: none">'+tartalom+'</table>';
	return true;
}
function ujkieg_hang(nev,hangok){
	try{var files=hangok.split(";");}catch(e){var files=hangok;}
	var hely=document.getElementById("hangok").getElementsByTagName("div")[0];
	var kieg=document.createElement("div"); kieg.setAttribute("style","display:table-cell; padding:10px;");
	var str="<h3>"+nev+"</h3>";
	for (var i=0;i<files.length;i++){
		str+='<input type="checkbox" name="'+files[i]+'" checked> <a href="javascript: playSound(\''+files[i]+'\');">'+files[i]+'</a><br>';
	}
	kieg.innerHTML=str;
	hely.appendChild(kieg);
	return;
}

function szunet(script,kep){try{
	switch (script){
		case "farm": 
			FARM_PAUSE=!FARM_PAUSE;
			var sw=FARM_PAUSE;
			break;
		case "vije":
			VIJE_PAUSE=!VIJE_PAUSE;
			var sw=VIJE_PAUSE;
			break;
		case "idtamad":
			alert2("Ezt a script nem �ll�that� meg, mivel nem ig�nyel semmilyen er�forr�st.<br>Ha a hangot szeretn�d kikapcsolni, megteheted azt a hangbe�ll�t�sokn�l.");
			break;
		case "epit":
			EPIT_PAUSE=!EPIT_PAUSE;
			var sw=EPIT_PAUSE;
			break;
		case "adatok":
			ADAT_PAUSE=!ADAT_PAUSE;
			var sw=ADAT_PAUSE;
			break;
		default: {alert2("Sikertelen script meg�llat�s. Nincs ilyen alscript: "+script);return;}
	}
	
	if (sw) {
		kep.src=pic("pause.png");
		kep.alt="Start";
		kep.title="Klikk a folytat�shoz";
	} else {
		kep.src=pic("play.png");
		kep.alt="Stop";
		kep.title="Klikk a sz�neteltet�shez";
	}
	
	if (script=="farm") shorttest();
}catch(e){alert2("Hiba:\n"+e);}}

function distCalc(S,D){
	S[0]=parseInt(S[0]);
	S[1]=parseInt(S[1]);
	D[0]=parseInt(D[0]);
	D[1]=parseInt(D[1]);
	return Math.abs(Math.sqrt(Math.pow(S[0]-D[0],2)+Math.pow(S[1]-D[1],2)));
}

function rendez(tipus,bool,thislink,table_azon,oszlop){try{
/*Tipus: "szoveg" v "szam"*/
	var OBJ=document.getElementById(table_azon).getElementsByTagName("tbody")[0];
	var prodtable=document.getElementById(table_azon).rows;
	if (prodtable.length<2) return;
	var tavok=new Array(); var sorok=new Array(); var indexek=new Array();
	var no=0;
	var vizsgal=$.trim(prodtable[1].cells[oszlop].innerText).replace(" ","");
	
	for (var i=1;i<prodtable.length;i++){
		switch (tipus) {
			case "szoveg": tavok[i-1]=prodtable[i].cells[oszlop].innerText; break;
			case "szam": tavok[i-1]=parseInt(prodtable[i].cells[oszlop].innerText.replace(".","")); break;
			case "datum": if (prodtable[i].cells[oszlop].innerText=="") tavok[i-1]=new Date(); else tavok[i-1]=new Date(prodtable[i].cells[oszlop].innerText); break;
			case "datum2": var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
				var d=new Date();
				var s=prodtable[i].cells[oszlop].innerText;
				d.setMonth(honap.indexOf(s.split(" ")[0]));
				d.setDate(s.split(" ")[1].replace(",",""));
				d.setHours(s.split(" ")[2].split(":")[0]);
				d.setMinutes(s.split(" ")[2].split(":")[1]);
				d.setSeconds(s.split(" ")[2].split(":")[2]);
				tavok[i-1]=d; break;
			case "lista": tavok[i-1]=prodtable[i].cells[oszlop].getElementsByTagName("select")[0].value; break;
			default: throw("Nem �rtelmezhet� mi szerint k�ne rendezni."); return;
		}
		sorok[i-1]=prodtable[i];
		indexek[i-1]=i-1;
	}
	
	for (var i=0;i<tavok.length;i++){
		var min=i;
		for (var j=i;j<tavok.length;j++){
			if (bool) {if (tavok[j]>tavok[min]) min=j;}
			else {if (tavok[j]<tavok[min]) min=j;}
		}
		var Ttemp=tavok[i];
		tavok[i]=tavok[min];
		tavok[min]=Ttemp;
		
		var Ttemp=indexek[i];
		indexek[i]=indexek[min];
		indexek[min]=Ttemp;
	}
	
	for (var i=prodtable.length-1;i>0;i--){
		OBJ.deleteRow(i);
	}
	
	for (var i=0;i<tavok.length;i++){
		OBJ.appendChild(sorok[indexek[i]]);
	}
	
	thislink.setAttribute("onclick","rendez(\""+tipus+"\","+!bool+",this,\""+table_azon+"\","+oszlop+")");
	return;
}catch(e){alert2("Hiba rendez�skor:\n"+e);}}

function koordTOid(koord){
	for (var i=0;i<KTID.length;i++){
		if (KTID[i].split(";")[0]==koord) return KTID[i].split(";")[1];
	}
	return 0;
}

function rovidit(tipus){
	var ret="";
	switch (tipus){
		case "egysegek": 
			for (var i=0;i<UNITS.length;i++)
			ret+='<img style="width:15px" src="/graphic/unit/unit_'+UNITS[i]+'.png"><input type="checkbox" onclick="szem4_farmolo_multiclick('+i+',\'honnan\',this.checked)">';
			break;
		default: ret="";
	}
	return ret;
}

function getServerTime(ref){ /* !!! */
	var d=new Date();
	return d;
}

function maplink(koord){
	return '<a href="'+VILL1ST.replace("screen=overview","x="+koord.split("|")[0]+"&y="+koord.split("|")[1]+"&screen=map")+'" target="_BLANK">'+koord+'</a>';
}
/*dupla klikk esem�nyek*/
function multipricer(ez,tip,s1){try{
	if (ez==undefined) return;
	if (!(document.getElementById("farm_multi_"+ez).checked)) return;
	var x=document.getElementById("farm_"+ez).rows;
	for (var i=x.length-1;i>0;i--){
		if (x[i].style.display!="none") {
			switch(tip){
			case "del": x[i].parentNode.removeChild(x[i]);break;
			case "urit": if (ez=="honnan") x[i].cells[2].innerHTML="";else x[i].cells[5].innerHTML="";break;
			case "mod": x[i].cells[3].innerHTML=s1;break;
			case "htor": x[i].cells[0].style.backgroundColor="#f4e4bc";break;
			case "hcser": x[i].cells[2].style.backgroundColor=s1;break;
			}
		}
	}
}catch(e){}}

function sortorol(cella,ismulti) {
 var row = cella.parentNode;
 row.parentNode.removeChild(row);
 multipricer(ismulti,"del");
}
function urit(cella,ismulti){
	cella.innerHTML="";
	multipricer(ismulti,"urit");
}
function modosit_szam(cella){
	var uj=prompt('�j �rt�k?');
	if (uj==null) return;
	uj=uj.replace(/[^0-9]/g,"");
	if (uj=="") return;
	cella.innerHTML=uj;
	multipricer("hova","mod",uj);
}
function hattertolor(cella){
	cella.style.backgroundColor="#f4e4bc";
	multipricer("hova","htor");
}
function hattercsere(cella){
	var szin="#00FF00";
	if (cella.style.backgroundColor=="rgb(0, 255, 0)" || cella.style.backgroundColor=="#00FF00") szin="#f4e4bc";
	cella.style.backgroundColor=szin;
	multipricer("hova","hcser",szin);
}

var BOTORA, ALTBOT2=false, BOT_VOL=0.0; /*ALTBOT2 --> megny�lt e m�r 1x az ablak*/
function BotvedelemBe(){try{
	BOT_VOL+=0.2;
	if (BOT_VOL>1.0) BOT_VOL=1.0;
	soundVolume(BOT_VOL);
	playSound("bot2");
	BOT=true;
	alert2('BOT V�DELEM!!!<br>�rd be a k�dot, �s kattints ide lentre!<br><br><a href="javascript: BotvedelemKi()">Be�rtam a k�dot, mehet tov�bb!</a>');
	if (ALTBOT && !ALTBOT2) {window.open(document.getElementById("altbotURL").value);ALTBOT2=true;}
	}catch(e){debug("BotvedelemBe()",e);}
	BOTORA=setTimeout("BotvedelemBe()",1500);
}
function BotvedelemKi(){
	BOT=false; ALTBOT2=false; BOT_VOL=0.0;
	document.getElementById("audio1").pause;
	alert2("OK");
	clearTimeout(BOTORA);
	/*Megnyitott lapok friss�t�se*/
	try{FARM_REF.location.reload();}catch(e){}
	try{VIJE_REF1.location.reload();}catch(e){}
	try{VIJE_REF2.location.reload();}catch(e){}
	try{IDTAMAD_REF.location.reload();}catch(e){}
	try{EPIT_REF.location.reload();}catch(e){}
	return;
}

function add_farmolo(){ try{
	var datas=document.getElementById("farm_opts");
	var faluk=datas.rows[1].cells[0].getElementsByTagName("input")[0].value;
	if (faluk=="") return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs �rv�nyes koordin�ta megadva";
	faluk=faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	var istarget=false;
	for (var j=0;j<datas.rows[2].cells[0].getElementsByTagName("input").length;j++){
		if (datas.rows[2].cells[0].getElementsByTagName("input")[j].checked==true) {istarget=true; break;}
	}
	if (!istarget){
		if (!confirm("Nincs semmilyen egys�g megadva, amit k�ldhetn�k. Folytatod?\n(k�s�bb ez a megad�s m�dos�that�)")) return;
	}
	
	var dupla="";
	for (var i=0;i<faluk.length;i++){
		var a=document.getElementById("farm_honnan");
		var b=document.getElementById("farm_hova");
		for (var j=1;j<a.rows.length;j++){
			if (a.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		for (var j=1;j<b.rows.length;j++){
			if (b.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		if (koordTOid(faluk[i])==0) {dupla+=faluk[i]+", "; faluk[i]=""; continue;}
		
		var b=a.insertRow(-1);
		var c=b.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick",'sortorol(this,"honnan")');
		var c=b.insertCell(1); c.innerHTML=rovidit("egysegek");
		for (var j=0;j<c.getElementsByTagName("input").length;j++){
			if (datas.rows[2].cells[0].getElementsByTagName("input")[j].checked==true) c.getElementsByTagName("input")[j].checked=true;
		}
		var c=b.insertCell(2); c.innerHTML=""; c.setAttribute("ondblclick",'urit(this,"honnan")');
	}
	datas.rows[1].cells[0].getElementsByTagName("input")[0].value="";
	if (dupla!="") alert2("Dupla falumegad�sok, esetleg nem l�v� saj�t faluk kisz�rve:\n"+dupla);
	return;	
}catch(e){alert(e);}}
function add_farmolando(){try{
	var datas=document.getElementById("farm_opts");
	var faluk=datas.rows[1].cells[1].getElementsByTagName("input")[0].value;
	if (faluk=="") return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs �rv�nyes koordin�ta megadva";
	faluk=faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	datas.rows[2].cells[1].getElementsByTagName("input")[3].value=datas.rows[2].cells[1].getElementsByTagName("input")[3].value.replace(/[^0-9]/g,"");
	if 	(datas.rows[2].cells[1].getElementsByTagName("input")[3].value=="") datas.rows[2].cells[1].getElementsByTagName("input")[3].value=3600;
	
	var dupla="";
	for (var i=0;i<faluk.length;i++){
		var a=document.getElementById("farm_hova");
		var b=document.getElementById("farm_honnan");
		for (var j=1;j<a.rows.length;j++){
			if (a.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		for (var j=1;j<b.rows.length;j++){
			if (b.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		var b=a.insertRow(-1); 
		var c=b.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick","hattertolor(this)"); c.setAttribute("data-age","0");
		var c=b.insertCell(1); c.innerHTML=""; c.setAttribute("ondblclick",'sortorol(this,"hova")');
		var c=b.insertCell(2); c.innerHTML="0"; c.setAttribute("ondblclick","hattercsere(this)");
		var c=b.insertCell(3); c.innerHTML=datas.rows[2].cells[1].getElementsByTagName("input")[3].value; c.setAttribute("ondblclick",'modosit_szam(this)');
		var c=b.insertCell(4); c.innerHTML='<input type="checkbox" onclick="szem4_farmolo_multiclick(0,\'hova\',this.checked)">';
		var c=b.insertCell(5); c.innerHTML=""; c.setAttribute("ondblclick",'urit(this,"hova")');
	}
		
	datas.rows[1].cells[1].getElementsByTagName("input")[0].value="";
	if (dupla!="") alert2("Dupla falumegad�sok kisz�rve:\n"+dupla);
	return;	
}catch(e){alert(e);}}

function szem4_farmolo_updater(){try{
	alapszam=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[0].value;
	if (alapszam!="") alapszam=parseInt(alapszam); else alapszam=1000;
	
	var a=document.getElementById("farm_hova").rows;
	var nov=0;
	for (var i=1;i<a.length;i++){try{
		if (a[i].cells[0].style.backgroundColor=="red") continue;
		if (a[i].cells[1].textContent=="") nov=alapszam; else {
		var r=a[i].cells[1].textContent.split(",");
		for (var l=0;l<r.length;l++) r[l]=parseInt(r[l],10);
		nov=(TERMELES[r[0]]+TERMELES[r[1]]+TERMELES[r[2]])*SPEED;}
		nov=Math.round(nov/60); /*Mert percenk�nt friss�tj�k majd*/
		var uj=(parseInt(a[i].cells[3].innerHTML)+nov);
		if (isNaN(uj)) {debug("Farmol�","Aut�friss�t� anom�lia: "+a[i].cells[0].innerHTML+"falun�l: "+a[i].cells[3].innerHTML+"+"+nov+"=Nem sz�m!"); continue;}
		if (uj>1000000) uj=1000000;
		/*T�l r�gi?*/
		var age=parseInt(a[i].cells[0].getAttribute("data-age"),10); age++; a[i].cells[0].setAttribute("data-age",age);
		if (age>120) {
			var hatarszam=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value;
			if (uj>(hatarszam*2)) {
				uj=hatarszam*2;
			}
		}
		a[i].cells[3].innerHTML=uj;
	}catch(e){debug("Farmol�","Hiba az autofriss�t�n�l: "+e);}}
	setTimeout("szem4_farmolo_updater()",60000);
	return;
}catch(e){debug("Farmol�","Hiba az autofriss�t�n�l: "+e);setTimeout("szem4_farmolo_updater()",60000);}}

function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('bot_check') || ref.document.title=="Bot v�delem") {
		naplo("Glob�lis","Bot v�delem akt�v!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1){
		naplo("Glob�lis","Kijelentkezett fi�k. Jelentkezzen be �jra, vagy �ll�tsa le a programot.");
		BotvedelemBe();
		return false;
	}
	if (address.indexOf("not ")>-1) var neg=true; else var neg=false;
	if (faluid>-1) if (ref.game_data.village.id!=faluid) return false;
	if (ref.document.getElementById("serverTime").innerHTML.length>4){
		if (neg){
			if (ref.document.location.href.indexOf(address.split(" ")[1])==-1) return true;
		} else {
			if (ref.document.location.href.indexOf(address)>-1)	return true;
		}
	}
}catch(e){return false;}
return false;}

function szem4_farmolo_multiclick(no,t,mire){try{
	if (!(document.getElementById("farm_multi_"+t).checked)) return;
	var x=document.getElementById("farm_"+t).rows;
	if (t=="honnan") t=1; else t=4;
	for (var i=1;i<x.length;i++){
		if (x[i].style.display!="none") x[i].cells[t].getElementsByTagName("input")[no].checked=mire;
	}
	return;
}catch(e){alert2("Hiba: "+t+"-"+no+"\n"+e);}}
function szem4_farmolo_csoport(tabla){try{
	var lista=prompt("Falusz�r�\nAdd meg azon faluk koordin�t�it, melyeket a list�ban szeretn�l l�tni. A t�bbi falu csup�n l�thatatlan lesz, de tov�bb folyik a haszn�lata.\nSpeci�lis lehet�s�gid:\n-1: Csup�n ezt az �rt�ket adva meg megford�t�dik a jelenlegi lista l�that�s�ga (neg�ci�)\n-...: Ha az els� karakter egy - jel, akkor a felsorolt faluk kivon�dnak a jelenlegi list�b�l (k�l�nbs�g)\n+...: Ha az els� karaktered +, akkor a felsorolt faluk hozz�ad�dnak a list�hoz (uni�)\n�resen leok�zva az �sszes falu l�that�v� v�lik");
	if (lista==null)return;
	var type="norm";
	if (lista=="-1") type="negalt";
		else {
			if (lista[0]=="-")type="kulonbseg";
			if (lista[0]=="+")type="unio";
		}
	if (lista=="") type="all";
	if (lista=="S") type="yellow";
	lista=lista.match(/[0-9]+(\|)[0-9]+/g);
	var uj=false; var jel;
	var x=document.getElementById("farm_"+tabla).rows;
	for (var i=1;i<x.length;i++){
		uj=false; jel=x[i].cells[0].textContent;
		switch(type){
			case "norm": if (lista.indexOf(jel)>-1) uj=true; break;
			case "negalt": if (x[i].style.display=="none") uj=true; break;
			case "kulonbseg": if (x[i].style.display!="none" && lista.indexOf(jel)==-1) uj=true; break;
			case "unio": if (x[i].style.display!="none" || lista.indexOf(jel)>-1) uj=true; break;
			case "all": uj=true; break;
			case "yellow": if (x[i].cells[0].style.backgroundColor=="yellow") uj=true; break;
		}
		if(uj)x[i].setAttribute("style","display:line");else x[i].setAttribute("style","display:none");
	}
}catch(e){alert2("Hiba: \n"+e);}}

function isgyalog(sor){try{
/*
	0: Semmi sem enged�lyezett
	1: Csak l� mehet
	2: Minden mehet e?
	3: Csak gyalog?
	*/
	var ered=0;
	var c=document.getElementById("farm_honnan").rows[sor].cells[1].getElementsByTagName("input");
	if (c[5].checked || c[6].checked || c[7].checked) ered=1;
	if (c[0].checked || c[1].checked || c[2].checked || c[3].checked) {
		if (ered==1) ered=2; else ered=3;
	}
	return ered;
}catch(e){debug("isgyalog()",e);}}

/*function getLastDate(ref,fastest){try{
	var table=ref.document.getElementById("content_value").getElementsByTagName("table");
	table=table[table.length-1].rows;
	if (ref.document.location.href.indexOf("try=confirm")>0 || !table[1].cells[0].getElementsByTagName("img")[0]) return false;
	var currVill=[ref.game_data.village.x,ref.game_data.village.y];
	var target, curr, result, time;
	for (var i=1;i<table.length;i++){
		if (table[i].cells[0].getElementsByTagName("img")[0].src.indexOf("support")>-1) continue;
		target=table[i].cells[0].innerText.match(/[0-9]+(\|)[0-9]+/g);
		target=target[target.length-1];
		curr=new Date();
		
		time=table[i].cells[2].innerText.split(":");
		time[0] = parseInt(time[0],10); if (isNaN(time[0]) || time[0]>23) {return table[i].cells[2].innerText;}
		time[1] = parseInt(time[1],10); if (isNaN(time[1]) || time[1]>59) {return table[i].cells[2].innerText;}
		time[2] = parseInt(time[2],10); if (isNaN(time[2]) || time[2]>59) {return table[i].cells[2].innerText;}
		curr.setSeconds(curr.getSeconds() + (time[0]*3600)+(time[1]*60)+time[2]);
		if (table[i].cells[0].getElementsByTagName("img")[0].src.indexOf("return")==-1) {
			curr.setSeconds(curr.getSeconds() + fastest*60*distCalc(currVill,target.split("|")));
		}
		if (!result || curr<result) result=curr;
	}
	return result;
}catch(e){debug('getLastDate', e)}}
*/
function szem4_farmolo_1kereso(){try{/*Farm keresi p�rj�t :)*/
	var cp=""; /*ezt t�madjuk*/
	var a=document.getElementById("farm_hova").rows;
	var b=document.getElementById("farm_honnan").rows;
	var par=new Array(); /*T�vols�g;Gyalogosok e?;Koordin�ta-honnan;koord-hova*/
	var d=new Date(); var sp;
	if (a.length==1 || b.length==1) return "zero";
	for (var i=1;i<a.length;i++){
		if (a[i].cells[0].style.backgroundColor=="red") continue;
		if (parseInt(a[i].cells[3].textContent)<parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value)) continue;
		
		/*Farm megvan (a[i]. sor), p�rkeres�s hozz� (van e egy�tal�n (par.length==3?))*/
		var hogyok="";
		for (var j=1;j<b.length;j++){
			sp=0;
			/*El�rhet� forr�s keres�se*/
			if (b[j].cells[2].innerHTML!=""){
				var d2=new Date(b[j].cells[2].textContent);
				if (!(d2 instanceof Date && !isNaN(d2.valueOf()))) {
					b[j].cells[2].innerHTML = '';
					d2 = new Date();
				}
				if (d>d2) {b[j].cells[2].innerHTML=""; hogyok="all";} else{
					if (b[j].cells[2].style.backgroundColor=="yellow") hogyok="gyalog"; else continue;
				}
			} else hogyok="all";
			
			/*Sebess�g kisz�m�t�sa*/
			var gy=isgyalog(j);
			if (gy==0) continue;
			if (gy==1 && hogyok=="gyalog") continue;
			if (gy==1 && hogyok=="all") sp=10;
			if (gy==2 && hogyok=="gyalog") sp=18;
			if (gy==2 && hogyok=="all") sp=10;
			if (gy==3) {sp=18; hogyok="gyalog";}
			
			if (sp==0) {debug("Farmol�","Anom�lia l�pett fel farmkeres�skor."); continue;}
			sp=sp*(1/SPEED)*(1/UNIT_S);
			/*alert2("hogyok: "+hogyok+" -- speed: "+sp+" --- gy="+gy);*/
			sp=sp*(distCalc(a[i].cells[0].textContent.split("|"),b[j].cells[0].textContent.split("|"))); /*a[i]<->b[j] t�vkeres�s*/
			/*debug("farm",a[i].cells[0].textContent+" - "+b[j].cells[0].textContent+" t�v="+sp);*/
			if (par.length==0 || par[0]>sp) {/*K�zelebbit tal�ltam*/
				par=[sp,hogyok,b[j].cells[0].textContent,a[i].cells[0].textContent];
			}
		}
	}
	if (par.length==0) {return "";}/*Nincs munka*/
	var maxspeed=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[1].value)*60+(parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[2].value));
	/*debug("TEST_01",maxspeed+" - "+par[0]);*/
	if (par[0]>maxspeed) return "";
	/*debug("Farmolo","C�lpontv�laszt�s: "+par);	*/
	return par;
}catch(e){debug("szem4_farmolo_1kereso()",e);}
	return "";
}

function szem4_farmolo_2illeszto(adatok){try{/*FIXME: hat�rsz�m alapj�n sz�mol�djon a min. sereg*/
	/*Lovat a gyalogossal egy�tt nem k�ld. Ha adatok[1]=="all" -->l� megy. Ha az nincs, majd return-ba r�sz�molunk*/

	try{TamadUpdt(FARM_REF);}catch(e){}
	var C_form=FARM_REF.document.forms["units"];
	C_form.x.value=adatok[3].split("|")[0];
	C_form.y.value=adatok[3].split("|")[1];
	if (C_form["input"].value == undefined) {
		throw "Nem t�lt�tt be az oldal?"+C_form["input"].innerHTML;
	}
	
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++){
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i].cells[1].getElementsByTagName("input"); break;}
	}
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++){
		if (farm_helye[i].cells[0].textContent==adatok[3]) {farm_helye=farm_helye[i]; break;}
	}
	
	var opts=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
	/*El�rhet� sereg*/
	var elerheto=new Array();
	for (var i=0;i<UNITS.length;i++){try{
		if (falu_helye[i].checked) elerheto[i]=parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
		else {
			if (i==4 && opts[5].checked) elerheto[i]=parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
			else elerheto[i]=0;
		}
		}catch(e){elerheto[i]=0;}
	}
	
	/*Lista�ssze�ll�t�s*/
	var sslw=10;
	if (falu_helye[4].checked || opts[5].checked) {
		if (elerheto[4]>parseInt(opts[4].value)) C_form.spy.value=opts[4].value;
	}
	var ny=parseInt(farm_helye.cells[3].textContent,10);
	var debugstr=""; var debugzsak=0;
	var betesz_ossz=0;
	
	if (adatok[1]=="all") {
		for (var i=5;i<UNITS.length;i++){try{
			if (ny>TEHER[i]){
				var kellene=Math.ceil(ny/TEHER[i]);
				var van=elerheto[i];
				if (kellene>van) var betesz=van; else var betesz=kellene;
				ny-=(betesz*TEHER[i]);
				debugzsak+=betesz*TEHER[i];
				debugstr+=UNITS[i]+":"+betesz+"; ";
				FARM_REF.document.getElementById("unit_input_"+UNITS[i]).value=betesz;
				betesz_ossz+=TANYA[i]*betesz;
				if (sslw<E_SEB[i]) sslw=E_SEB[i];
			}}catch(e){}
		}
	} else {
		for (var i=0;i<4;i++){try{
			if (ny>TEHER[i]){
				var kellene=Math.ceil(ny/TEHER[i]);
				var van=elerheto[i];
				if (kellene>van) var betesz=van; else var betesz=kellene;
				ny-=(betesz*TEHER[i]);
				debugzsak+=betesz*TEHER[i];
				debugstr+=UNITS[i]+":"+betesz+"; ";
				FARM_REF.document.getElementById("unit_input_"+UNITS[i]).value=betesz;
				/*debug("illeszto",i+". Kellene: "+kellene+", van: "+elerheto[i]+". Betesz: "+betesz+". Ny--"+ny);*/
				betesz_ossz+=TANYA[i]*betesz;
				if (sslw<E_SEB[i]) sslw=E_SEB[i];
			}}catch(e){}
		}
	}
	
	
	if (ny>parseInt(opts[3].value,10)) C_form.spy.value=0; /*Ha biztos megy r� M�G t�mad�s*/	
	
	var kek=false;
	/*Forced?*/if (opts[5].checked && elerheto[4]<parseInt(opts[4].value)) {ezt=adatok[1]+"|semmi";} else {
	
	/*Rakt�r t�ltel�tett?*/ var nyersarany=(parseInt(FARM_REF.document.getElementById("wood").textContent)+parseInt(FARM_REF.document.getElementById("stone").textContent)+parseInt(FARM_REF.document.getElementById("iron").textContent))/(parseInt(FARM_REF.document.getElementById("storage").textContent)*3);
	/*debug("Illeszt","Nyersar�ny: "+Math.round(nyersarany*100)+", limit: "+parseInt(opts[10].value));*/
	if (Math.round(nyersarany*100)>parseInt(opts[10].value))  {ezt=adatok[1]+"|semmi";} else {
	
		/*FAKE LIMIT!?*/
		/*console.info('�ssz:', betesz_ossz, parseInt(opts[7].value), betesz_ossz>parseInt(opts[7].value));*/
		if (betesz_ossz>=parseInt(opts[7].value)) {
			/*Init?*/
			if (opts[6].checked) {
				if (farm_helye.cells[1].style.backgroundColor=="rgb(213, 188, 244)") C_form.spy.value=0;
				if (farm_helye.cells[1].innerHTML!="") C_form.spy.value=0;
			}
			if (parseInt(C_form.spy.value,10)>0 && farm_helye.cells[1].innerHTML=="") kek=true;
			
			/*debug("Farmolo()","Seregk�ld�s "+adatok[3]+"-re. Nyers_faluba: "+parseInt(farm_helye.cells[3].textContent,10)+". Egys�g k�ld�s: "+debugstr+". Teherb�r�s: "+debugzsak);*/
			if ((debugzsak-100)>parseInt(farm_helye.cells[3].textContent,10)) debug("Farmolo()","<b>ERROR: TOO MANY UNITS</b>");
			C_form.attack.click(); ezt=adatok[1]; 						
		} else ezt=adatok[1]+"|semmi";
	}}
	
	/*console.info('Beillesztve', [ny,ezt,adatok[2],adatok[3],sslw,kek,debugzsak]);*/
	return [ny,ezt,adatok[2],adatok[3],sslw,kek,debugzsak]; /*nyers_maradt;all/gyalog/semmi;honnan;hova;speed_slowest;k�m ment e;teherb�r�s*/
}catch(e){debug("Illeszto()",e);FARM_LEPES=0;return "";}
}

function szem4_farmolo_3egyeztet(adatok){try{
	/*nyers_maradt;all/gyalog/semmi;honnan;hova;speed_slowest;kekesit*/
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++){
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i]; break;}
	}
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++){
		if (farm_helye[i].cells[0].textContent==adatok[3]) {farm_helye=farm_helye[i]; break;}
	}
	
	/*Piros sz�veg*/
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].getAttribute("class")=="error_box"){
			naplo("Farmol�","Hiba "+adatok[3]+" farmol�s�n�l: "+FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].textContent+". Tov�bb nem t�madom");
			farm_helye.cells[0].style.backgroundColor="red";
			FARM_LEPES=0;
			return "";
		}
	}catch(e){/*debug("3()","Nincs hiba");*/}
	
	/*J�t�kos-e?*/	
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].getElementsByTagName("a")[0].href.indexOf("info_player")>-1){
			if (!farm_helye.cells[4].getElementsByTagName("input")[0].checked){
				naplo("Farmol�","J�t�kos "+maplink(adatok[3])+" helyen: "+FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].innerHTML.replace("href",'target="_BLANK" href')+". Tov�bb nem t�madom");
				farm_helye.cells[0].style.backgroundColor="red";
				FARM_LEPES=0;
				return "";
			}
		}
	}catch(e){/*debug("3()","Nincs j�t�kos");*/}
	
	/*adatok[6]==teherb�r�s?. Egyezik?*/
	try{
		var a=FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows;
		a=parseInt(a[a.length-1].cells[0].textContent.replace(/[^0-9]+/g,""));
		/*debug("farm3","Teher: "+adatok[6]+"_Itteni teher: "+a);*/
		if (adatok[6]!=a) debug("farm3","Val�di teherb�r�s nem egyezik a kisz�molttal. Hiba, ha nincs teherb�r�st m�dos�t� \"eszk�z\".");
	}catch(e){debug("farm3","Teherb�r�s meg�llap�t�s hiba: "+e);}
	
	hatszam=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10);
	if (adatok[1].indexOf("semmi")==-1 || adatok[6]>hatszam*2) {
		var opts=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
		if (adatok[5]) farm_helye.cells[1].style.backgroundColor="rgb(213, 188, 244)";
		FARM_REF.document.getElementById("troop_confirm_submit").click();
		farm_helye.cells[0].setAttribute("data-age",0);
		if (adatok[0]>parseInt(opts[3].value)){
			/*Lek�rni a szerver id�t*/
			var d=getServerTime(FARM_REF);
			var ido=distCalc(adatok[2].split("|"),adatok[3].split("|"));
			ido=ido*(1/SPEED)*(1/UNIT_S)*adatok[4]; ido=(Math.round(ido));
			/*debug("farm3",ido+"p a t�v, "+d+" az id� - �sszenyomjuk!");*/
			d.setMinutes(d.getMinutes()+ido);
			farm_helye.cells[5].innerHTML=d;
		}	
	}
	farm_helye.cells[3].innerHTML=adatok[0];
	if (adatok[1]=="all") var sarga=true; else var sarga=false;
	var nez=false; if (adatok[0]>25) nez=true;
	return [nez,sarga,adatok[2],adatok[3]];
	/*Legyen e 3. l�p�s;s�rga h�tteres id� lesz?;honnan;---*/
}catch(e){debug("szem4_farmolo_3egyeztet()",e); FARM_LEPES=0;}}

function szem4_farmolo_4visszaell(adatok){try{
	/*
		true,sarga?,honnan,hova
		vagy
		nyers_maradt(db);all/gyalog + semmi;honnan;hova;speed_slowest
	*/	
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++){
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i]; break;}
	}
	
	if (typeof adatok[1]=="boolean") var lehetEGyalog=adatok[1]; else {
		if (adatok[1].indexOf("all")>-1) var lehetEGyalog=true; else var lehetEGyalog=false;
	}

	if (lehetEGyalog){ /*S�rga; de ha nincs gyalog->feh�r*/
		var backtest=false;
		for (var i=0;i<3;i++){
			if (falu_helye.cells[1].getElementsByTagName("input")[i].checked){
				if (FARM_REF.document.getElementById("unit_input_"+UNITS[i])){
					if (parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0])>5) {
						backtest=true;
						break;
					}
				}
			}
		}
		if (!backtest) lehetEGyalog=false;
	} /*ellenben n�zd meg van e bent l� amit lehet k�ldeni!?*/
	
	/*Leggyorsabb kijel�lt egys�g*/
	var a=falu_helye.cells[1].getElementsByTagName("input");
	var fastest=22;
	for (var i=0;i<a.length;i++){
		if (i==4) continue;
		if (a[i].checked && E_SEB[i]<fastest) fastest=E_SEB[i];
	}
	fastest = fastest*(1/SPEED)*(1/UNIT_S);
	
	/*Leghamar�bb vissza�r� sereg*/
	/*var mozgas = getLastDate(FARM_REF,fastest);
	if (!(mozgas instanceof Date && !isNaN(mozgas.valueOf()))) {
		debug('Advanced error at #1', mozgas + " - Fastest: " + fastest);
		naplo("Farmolo",'<a target="_BLANK" href=\''+VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(adatok[2])).replace("screen=overview","screen=place")+'\'>'+adatok[2]+'</a> faluban nincs egys�g, vagy t�ltel�tett a rakt�r!.');
		sarga=false;
		var d = new Date();
		d.setMinutes(d.getMinutes()+(30*SPEED));
		falu_helye.cells[2].innerHTML=d;
		return;
	}*/
	
	var sarga=true;
	
	if (/*mozgas && */!lehetEGyalog) sarga=false;
	/*if (!mozgas && !lehetEGyalog) {
		naplo("Farmolo",'<a target="_BLANK" href=\''+VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(adatok[2])).replace("screen=overview","screen=place")+'\'>'+adatok[2]+'</a> faluban nincs egys�g, vagy t�ltel�tett a rakt�r!.');
		/*falu_helye.cells[0].style.backgroundColor="red"; FIXME
		sarga=false;
	} else falu_helye.cells[0].style.backgroundColor="#f4e4bc";*/
	
	var d=new Date();
	if (sarga) falu_helye.cells[2].style.backgroundColor="yellow"; else falu_helye.cells[2].style.backgroundColor="#f4e4bc";
	/*if (mozgas) {
		mozgas.setSeconds(mozgas.getSeconds() + 10);
		falu_helye.cells[2].innerHTML=mozgas;
	} else {*/
		console.info(parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[8].value,10));
		d.setMinutes(d.getMinutes()+(parseInt( document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[8].value,10) ));
		falu_helye.cells[2].innerHTML=d;
	/*}*/
}catch(e){debug("szem4_farmolo_4visszaell()",e); return;}
return;}

function szem4_farmolo_motor(){try{
	var nexttime=500;
	nexttime=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[9].value,10);
	
	if (BOT||FARM_PAUSE) {nexttime=5000;} else {
	/*if (FARM_REF!="undefined" && FARM_REF.closed) FARM_LEPES=0;*/
	if (FARM_HIBA>10) {FARM_HIBA=0; FARM_GHIBA++; if(FARM_GHIBA>3) {if (FARM_GHIBA>5) {naplo("Glob�l","Nincs internet? Folyamatos hiba farmol�n�l"); nexttime=60000; playSound("bot2"); } FARM_REF.close();} FARM_LEPES=0;}
	switch (FARM_LEPES){
		case 0: /*Meg kell n�zni mi lesz a c�lpont, +nyitni a HONNAN-t.*/
				PM1=szem4_farmolo_1kereso();
				if (PM1=="zero") {nexttime=10000; break;} /*Ha nincs m�g t�bla felt�ltve*/
				if (PM1=="") {nexttime=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[8].value,10)*60000; break;}
				FARM_REF=window.open(VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(PM1[2])).replace("screen=overview","screen=place"),AZON+"_Farmolo");
				/*debug("Farmol�_ToStep1",PM1);*/
				FARM_LEPES=1;
				break;
		case 1: /*Gy�l.helyen vagyunk, be kell illeszteni a megfelel� sereget, -nyers.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"screen=place")) {FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_2illeszto(PM1); 
					if (typeof(PM1)=="object" && PM1.length>0) {/*debug("Farmol�_ToStep2",PM1);*/ if (PM1[1].indexOf("semmi")>0) FARM_LEPES=3; else FARM_LEPES=2;} else FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		case 2: /*Confirm: nem e j�tt piros sz�veg, j�t�kos e -> OK-�z�s.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_3egyeztet(PM1);
					if (typeof(PM1)=="object" && PM1.length>0 && PM1[0]==true) {/*debug("Farmol�_ToStep3",PM1);*/ FARM_LEPES=3;} else FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		case 3: /*T�mad�s elk�ldve, id�t �s ID-t n�z�nk, ha kell.*/ 
				/*Kell e id�t n�zni? Kell, ha PM1[1].indexOf("semmi")>-1 VAGY PM1[0]=TRUE; */
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"not try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					szem4_farmolo_4visszaell(PM1);
					FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		default: FARM_LEPES=0;
	}}
}catch(e){debug("szem4_farmolo_motor()",e+" L�p�s:"+FARM_LEPES);}

var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
setTimeout("szem4_farmolo_motor()",nexttime);
return;}

var KTID=new Array(), /*Koord-ID p�rosok*/
	TERMELES=new Array(5,30,35,41,47,55,64,74,86,100,117,136,158,184,214,249,289,337,391,455,530,616,717,833,969,1127,1311,1525,1774,2063,2400),
	UNITS=new Array("spear","sword","axe","archer","spy","light","marcher","heavy"),
	TEHER=new Array(25,15,10,10,0,80,50,50),
	TANYA=new Array(1,1,1,1,2,4,5,6),
	E_SEB=new Array(18,22,18,18,9,10,10,11),
	BOT=false;
init();
ujkieg_hang("Alaphangok","naplobejegyzes;bot2");
ujkieg("farm","Farmol�",'<tr><td>  <table class="vis" id="farm_opts" style="width:100%; margin-bottom: 50px;"><tr><th>Farmol� falu hozz�ad�sa</th><th>Farmoland� falu hozz�ad�sa</th></tr><tr><td style="width:48%;" onmouseover="sugo(\'Adj meg koordin�t�kat, melyek a te faluid �s farmolni szeretn�l vel�k. A koordin�t�k elv�laszt�sa b�rmivel t�rt�nhet.\')">Koordin�t�k: <input type="text" size="45" placeholder="111|111, 222|222, ..."> <input type="button" value="Hozz�ad" onclick="add_farmolo()"></td><td style="width:52%;" onmouseover="sugo(\'Adj meg koordin�t�kat, amelyek farmok, �s farmolni szeretn�d. A koordin�t�k elv�laszt�sa b�rmivel t�rt�nhet.\')">Koordin�t�k:  <input type="text" size="45" placeholder="111|111, 222|222, ..."> <input type="button" value="Hozz�ad" onclick="add_farmolando()"></td></tr><tr><td onmouseover="sugo(\'A felvivend� falukb�l ezeket az egys�geket haszn�lhatja SZEM IV farmol�s c�lj�b�l. K�s�bb m�dos�that�.\')" style="vertical-align:middle;">Mivel? '+rovidit("egysegek")+'</td><td>Termel�s/�ra: <input onkeypress="validate(event)" type="text" size="5" value="3600" onmouseover="sugo(\'Ha nincs felder�tett b�nyaszint, �gy veszi ennyi nyers termel�dik\')"> Max t�v: <input type="text" size="2" value="4" onkeypress="validate(event)" onmouseover="sugo(\'A max t�vols�g, amin t�l m�r nem k�ld�k t�mad�sokat\')">�ra <input onkeypress="validate(event)" type="text" size="2" value="0" onmouseover="sugo(\'A max t�vols�g, amin t�l m�r nem k�ld�k t�mad�sokat\')">perc. Hat�rsz�m: <input type="text" onkeypress="validate(event)" onmouseover="sugo(\'Az �j farmok ennyi nyersanyaggal lesznek felv�ve. M�sr�sz, ez alatti nyersanyag�rt m�g nem indulok el.\')" value="3600" size="5"><br>K�m/falu: <input onkeypress="validate(event)" type="text" value="1" size="2" onmouseover="sugo(\'Minden t�mad�ssal ennyi k�m fog menni\')"> K�nyszer�tett?<input type="checkbox" onmouseover="sugo(\'K�mek n�lk�l nem ind�t t�mad�st. K�meket annak ellen�re is fog vinni, ha nincs bepip�lva a k�m egys�g.\')">Kezd� feld.?<input type="checkbox" onmouseover="sugo(\'Minden falura maximum egyszer fog menni k�m.\')">&nbsp;&nbsp;Min sereg/falu: <input onkeypress="validate(event)" type="text" value="100" size="4" onmouseover="sugo(\'Enn�l kevesebb f� t�mad�sonk�nt nem indul. A sz�m tanyahely szerinti foglal�sban �rtend�.\')"><br>Sebess�g: <input onkeypress="validate(event)" type="text" size="2" value="10" onmouseover="sugo(\'Ha a farmol� nem tal�l t�bb feladatot mag�nak meg�ll, ennyi id�re. �rt�k lehet: 1-300. Javasolt �rt�k: 10-120 perc\')">perc/<input onkeypress="validate(event)" type="text" size="3" value="500" onmouseover="sugo(\'Egyes utas�t�sok/lapbet�lt�d�sek ennyi id�k�z�nk�nt hajt�dnak v�gre. �rt�k lehet: 200-6000. Javasolt: 500ms, lassabb g�pek eset�n 1000-2000.\')">ms. Ha a rakt�r &gt;<input type="text" size="2" onmouseover="sugo(\'Figyeli a rakt�r tel�tetts�g�t, �s ha a megadott % f�l� emelkedik, nem ind�t t�mad�st onnan. Tel�tetts�g �ssznyersanyag alapj�n sz�molva. Min: 20. Ne n�zze: 100-n�l t�bb �rt�k megad�sa eset�n.\')" value="90">%, nem foszt.</td></tr></table>  <table class="vis" id="farm_honnan" style="vertical-align:top; display: inline-block; width:550px"><tr><th width="55px" onmouseover="sugo(\'Ezen falukb�l farmolsz. Dupla klikk az �rintett sor koordin�t�j�ra=sor t�rl�se.<br>Rendezhet�\')" style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"farm_honnan",0)\'>Honnan</th><th onmouseover="sugo(\'Ezen egys�geket haszn�l fel SZEM a farmol�shoz. B�rmikor m�dos�that�.\')">Mivel?</th><th onmouseover="sugo(\'Ekkor �r vissza sereg a sz�m�t�saim szerint. Dupla klikk=t�rl�s=m�r meg�rkezett/n�zd �jra.<br>Rendezhet�.<br><br>Pipa: egy cell�n v�grehajtott (duplaklikkes) m�velet minden l�that� falura �rv�nyes lesz.\')" onclick=\'rendez("datum",false,this,"farm_honnan",2)\' style="cursor: pointer; vertical-align:middle;">Return <span style="margin-left: 45px; margin-right: 0px;"><img src="'+pic("search.png")+'" alt="?" title="Sz�r�s falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport(\'honnan\')"><input type="checkbox" id="farm_multi_honnan" onmouseover="sugo(\'Ha bepip�lod, akkor egy cell�n v�gzett dupla klikkes m�velet minden sorra �rv�nyes lesz az adott oszlopba (teh�t minden falura), ami jelenleg l�tszik. L�gy �vatos!\')"></span></th></tr></table> <table class="vis" id="farm_hova" style="vertical-align:top; display: inline-block;"><tr><th onmouseover="sugo(\'Ezen falukat farmolod. A h�tt�rsz�n jel�li a jelent�s sz�n�t: alap�rtelmezett=z�ld jelik/nincs felder�tve. S�rga=vesztes�g volt a falun. Piros: a t�mad�s bes�lt, nem megy r� t�bb t�mad�s.<br>Dupla klikk a koordira: a h�tt�rsz�n alap�rtelmezettre �ll�t�sa.<br>Rendezhet�\')" style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"farm_hova",0)\'>Hova</th><th onmouseover="sugo(\'Felder�tett b�nyaszintek, ha van. K�k h�tt�r: megy r� k�mt�mad�s.<br>Dupla klikk=az �rintett sor t�rl�se\')">B�ny�k</th><th onmouseover="sugo(\'Fal szintje. Dupla klikk=h�tt�r csere (csak megjel�l�sk�nt). <br>Rendezhet�.\')" onclick=\'rendez("szam",false,this,"farm_hova",2)\' style="cursor: pointer;">Fal</th><th onmouseover="sugo(\'Sz�m�t�sok szerint ennyi nyers van az �rintett faluba. Dupla klikk=�rt�k m�dos�t�sa.<br>Rendezhet�.\')" onclick=\'rendez("szam",false,this,"farm_hova",3)\' style="cursor: pointer;">Nyers</th><th onmouseover="sugo(\'J�t�kos e? Ha j�t�kost szeretn�l t�madni, pip�ld be a falut mint j�t�kos uralta, �gy t�madni fogja. Ellenben piros h�tteret kap a falu.\')">J?</th><th onmouseover="sugo(\'A falura ekkor �r be az utols� nagyerej� t�mad�s. Inform�ci� a jelent�s elemz�nek. Dupla klikk=id� t�rl�se.<br>Rendezhet�.<br><br>Pipa: egy cell�n v�grehajtott (duplaklikkes) m�velet minden l�that� falura �rv�nyes lesz.\')" onclick=\'rendez("datum",false,this,"farm_hova",5)\' style="cursor: pointer; vertical-align:middle;">Ut.T<span style="margin-left: 65px; margin-right: 0px;"><img src="'+pic("search.png")+'" alt="?" title="Sz�r�s falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport(\'hova\')"><input type="checkbox" id="farm_multi_hova"></span></th></tr></table></p> </td></tr>');
/*Table IDs:  farm_opts; farm_honnan; farm_hova*/
szem4_farmolo_updater();
var FARM_LEPES=0, FARM_REF, FARM_HIBA=0, FARM_GHIBA=0,
	PM1, FARM_PAUSE=false;
szem4_farmolo_motor();

function VIJE_FarmElem(koord){try{
	var farm_helye=document.getElementById("farm_hova").rows;
	var BenneVanE=false;
	for (var i=1;i<farm_helye.length;i++){
		if (farm_helye[i].cells[0].textContent==koord) {BenneVanE=true; farm_helye=farm_helye[i]; break;}
	}
	if (!BenneVanE) return [false,false,0];
	
	var BanyaVanE=true;
	if (farm_helye.cells[1].textContent=="") BanyaVanE=false;
	
	if (farm_helye.cells[5].textContent!="") var d=new Date(farm_helye.cells[5].textContent); else var d=getServerTime(VIJE_REF1);;
	d.setMinutes(d.getMinutes()-1);
	return [BenneVanE,BanyaVanE,d];
}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
function VIJE_elemzett(jid){try{
	var a=document.getElementById("VIJE_elemzett").textContent;
	if (a=="") return false;
	a=a.split(",");
	for (var i=0;i<a.length;i++){
		if (a[i]==jid) return true;
	}
	if (a.length>130) document.getElementById("VIJE_elemzett").innerHTML=a.slice(a.length-100,a.length);
	return false;
}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
function szem4_VIJE_1kivalaszt(){try{
	/*Eredm�nye: jelent�s azon;c�lpont koord;jelent�s SZ�Ne;volt e checkbox-olt jeli*/
	try{TamadUpdt(VIJE_REF1);}catch(e){}
	VT=VIJE_REF1.document.getElementById("report_list").rows;
	if (VT.length<3) return [0,0,"",false];
	var vane=false;
	for (var i=VT.length-2;i>0;i--){
		try{var koord=VT[i].cells[1].textContent.match(/[0-9]+(\|)[0-9]+/g);
		koord=koord[koord.length-1];}catch(e){continue;}
		var jid=VT[i].cells[1].getElementsByTagName("span")[0].getAttribute("data-id").replace("label_","");
		if (VIJE_elemzett(jid)) continue;
		var szin=VT[i].cells[1].childNodes;
		for (var s=0;s<szin.length;s++){
			if (szin[s].nodeName=="IMG") {szin=szin[s].src.split(".png")[0].split("/"); szin=szin[szin.length-1]; break;}
		}
		var eredm=VIJE_FarmElem(koord); /*BenneVanE,VanEBanyaSzint,ut. t�mad�s ideje*/
		if (eredm[0]==false) continue;
		/*+++ID�*/
		var d=getServerTime(VIJE_REF1); var d2=getServerTime(VIJE_REF1);
		if (eredm[2]>d) {/*debug("VIJE1()",jid+":"+koord+"-et nem n�zem, mert van r� \"nagy\" t�mad�s.");*/ continue;}
		
		(function convertDate(){
			var ido = VT[i].cells[2].textContent;
			var oraperc=ido.match(/[0-9]+:[0-9]+/g)[0];
			var nap=ido.replace(oraperc,"").match(/[0-9]+/g)[0];
			d.setMinutes(parseInt(oraperc.split(":")[1],10));
			d.setHours(parseInt(oraperc.split(":")[0],10));
			d.setDate(parseInt(nap,10));
		})();
		
		/*debug("VIJE1()","Ezt n�zem: koord "+koord+". Id�: "+d+", most: "+d2+". K�l�nbs�g: "+(d2-d));*/
		if ((d2-d) > 10800000 || (d2-d) < 0) var regi=true; else var regi=false; /*3 �ra*/
		if (eredm[1]==false) { vane=true; break;}
		if (regi) continue;
		if (eredm[1]==true) { /*b�nyaszint ismert, de elemezni kell*/
			vane=true; break;
		}
	}
	if (!vane) {
		for (var i=VT.length-2;i>0;i--){
			if (VT[i].cells[0].getElementsByTagName("input")[0].checked) return [0,0,"",true];
		}
		return [0,0,"",false];
	} /*Ha nincs tal�lt jeli --> n�zd meg volt e checkboxolt, �s ha igen, akkor a 4. PM=true;*/
	
	if (szin=="green") VT[i].cells[0].getElementsByTagName("input")[0].checked=true;
	/*debug("VIJE_1()","Megvan a jeli amit n�zni kell majd! Koord: "+koord+" ID="+jid);*/
	return [jid,koord,szin,false,regi];
}catch(e){debug("VIJE1","Hiba: "+e);return [0,0,"",false];}}

function VIJE_adatbeir(koord,nyers,banya,fal,szin){try{
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++){
		if (farm_helye[i].cells[0].textContent==koord) {farm_helye=farm_helye[i]; break;}
	}
	farm_helye.cells[0].setAttribute("data-age",0);
	if (banya!=="") 	{farm_helye.cells[1].innerHTML=banya; farm_helye.cells[1].backgroundColor="#f4e4bc"; if(fal=="") fal=0;}
	if (fal!=="") 	{if (parseInt(farm_helye.cells[2].innerHTML)>parseInt(fal)) farm_helye.cells[2].backgroundColor=="#f4e4bc"; farm_helye.cells[2].innerHTML=fal;}
	if (nyers!=="")	{farm_helye.cells[3].innerHTML=nyers; 
		/*DEBUG*/if (nyers>parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10)) debug("VIJE_adatbe�r","Sok nyers van itt, lehet hiba? "+koord+" falun�l");}
	if (szin==="green") farm_helye.cells[0].style.backgroundColor="#f4e4bc"; else 
	if (szin==="yellow") farm_helye.cells[0].style.backgroundColor="yellow"; else 
	if (szin==="blue") {} else 
	{farm_helye.cells[0].style.backgroundColor="red"; naplo("Jelent�s Elemz�",koord+" farm vesz�lyesnek �t�lve. Jelent�s�nek sz�ne "+szin+".");}
	if (farm_helye.cells[5].innerHTML!="") farm_helye.cells[5].innerHTML="";
	return;
}catch(e){debug("VIJE_adatbeir","Hiba: "+e);}}
function szem4_VIJE_2elemzes(adatok){try{
	/*Adatok: [0]jelent�s azon;[1]c�lpont koord;[2]jelent�s SZ�Ne;[3]volt e checkbox-olt jeli;[4]r�gi jeli e? (igen->nincs nyerselem)*/
	var nyersossz=0;
	if (VIJE_REF2.document.getElementById("attack_spy_resources")){
		var x=VIJE_REF2.document.getElementById("attack_spy_resources").rows[0].cells[1];
		if (adatok[4]) {var nyersossz="";debug("VIJE2","Nem kell elemezni (r�gi)"); } else {
			try{var nyers=x.textContent.replace(/\./g,"").match(/[0-9]+/g); 
				if (nyers.length!=3) throw "LENGTH_NOT_3";
				if (x.innerHTML.indexOf("iron")===-1) throw "IRON_NOT_FOUND";
			var nyersossz=0;
			for (var i=0;i<nyers.length;i++) nyersossz+=parseInt(nyers[i],10);}catch(e){var nyersossz=0; debug("VIJE","<a href='"+VIJE_REF2.document.location+"'>"+adatok[0]+"</a> ID-j� jelent�s nem szokv�nyos, tal�lt nyers 0-ra �ll�tva. Hiba: "+e);}
		}
	
	if (VIJE_REF2.document.getElementById("attack_spy_buildings_left")){
			var s=document.getElementById("vije").getElementsByTagName("input");
			var nevek=new Array(s[0].value.toUpperCase(),s[1].value.toUpperCase(),s[2].value.toUpperCase(),s[3].value.toUpperCase());
			var banyak=new Array(0,0,0); var fal=0;
			
			var s=VIJE_REF2.document.getElementById("attack_spy_buildings_left").rows;
			for (var i=1;i<s.length;i++){
				for (var j=0;j<3;j++){
				if (s[i].cells[0].textContent.toUpperCase().indexOf(nevek[j])>-1) banyak[j]=s[i].cells[1].textContent;}
				if (s[i].cells[0].textContent.toUpperCase().indexOf(nevek[3])>-1) fal=s[i].cells[1].textContent;
			}
			var s=VIJE_REF2.document.getElementById("attack_spy_buildings_right").rows;
			for (var i=1;i<s.length;i++){
				for (var j=0;j<3;j++){
				if (s[i].cells[0].textContent.toUpperCase().indexOf(nevek[j])>-1) banyak[j]=s[i].cells[1].textContent;}
				if (s[i].cells[0].textContent.toUpperCase().indexOf(nevek[3])>-1) fal=s[i].cells[1].textContent;
			}
		} else { /*Csak nyerset l�ttunk*/
			var banyak="";
			var fal="";
		}
		VIJE_adatbeir(adatok[1],nyersossz,banyak,fal,adatok[2]);
	} else {
		/*Nem 0-t adunk vissza hanem negat�vot: amennyit fosztottunk! �j funkci�*/
		VIJE_adatbeir(adatok[1],0,"","",adatok[2]);
		/*Nincs elemzendo adat :(*/
	}
	
	/*Tedd be az elemzettek list�j�ba az ID-t*/
	document.getElementById("VIJE_elemzett").innerHTML+=adatok[0]+",";
	if (document.getElementById("VIJE_elemzett").innerHTML.split(",").length>200){
		document.getElementById("VIJE_elemzett").innerHTML=document.getElementById("VIJE_elemzett").innerHTML.split(",").splice(100,100)+",";
	}
	
	return true;
}catch(e){debug("VIJE2","Elemezhetetlen jelent�s: "+adatok[0]+":"+adatok[1]+". Hiba: "+e); VIJE_adatbeir(adatok[1],nyersossz,"","",adatok[2]); return false;}}

function szem4_VIJE_3torol(){try{
	if (document.getElementById("vije").getElementsByTagName("input")[4].checked) {
		try{VIJE_REF1.document.forms[0].del.click();}catch(e){VIJE_REF1.document.getElementsByName("del")[0].click();}
	}
}catch(e){debug("VIJE3","Hiba: "+e);return;}}

function szem4_VIJE_motor(){try{
	var nexttime=1500;
	if (BOT||VIJE_PAUSE) {nexttime=5000;} else {
	if (VIJE_HIBA>10) {
		VIJE_HIBA=0; VIJE_GHIBA++; 
		if(VIJE_GHIBA>3) {
			if (VIJE_GHIBA>5) {
				naplo("Glob�l","Nincs internet? Folyamatos hiba a jelent�s elemz�n�l"); nexttime=60000; playSound("bot2");
			} 
			VIJE_REF1.close();
		} VIJE_LEPES=0;
	}
	
	if (VIJE2_HIBA>10) {VIJE2_HIBA=0; VIJE2_GHIBA++; if(VIJE2_GHIBA>3) {if (VIJE2_GHIBA>5) naplo("Glob�l","Nincs internet? Folyamatos hiba a jelent�s elemz�n�l"); VIJE_REF2.close();} VIJE_LEPES=0;}
	if (!VIJE_REF1 || (VIJE_LEPES!=0 && VIJE_REF1.closed)) VIJE_LEPES=0;
	
	
	switch(VIJE_LEPES){
		case 0: /*T�mad�i jelent�sek megnyit�sa*/
			if (document.getElementById("farm_hova").rows.length>1){
			var csoport="";
			if (game_data.player.premium) csoport="group_id=-1&";
			VIJE_REF1=window.open(VILL1ST.replace("screen=overview","mode=attack&"+csoport+"screen=report"),AZON+"_SZEM4VIJE_1");
			VIJE_LEPES=1;
			} else nexttime=10000;
			break;
		case 1: /*Megnyitand� jelent�s kiv�laszt�s(+bepip�l�s)*/
			if (isPageLoaded(VIJE_REF1,-1,"screen=report")){VIJE_HIBA=0; VIJE_GHIBA=0;
				PM2=szem4_VIJE_1kivalaszt();
/*Nincs mel�->60k*/	if (PM2[0]===0) {
					if (PM2[3]) VIJE_LEPES=3; else {VIJE_LEPES=0; nexttime=120000;}
				} else {
					VIJE_REF2=window.open(VILL1ST.replace("screen=overview","mode=attack&view="+PM2[0]+"&screen=report"),AZON+"_SZEM4VIJE_2");
					VIJE_LEPES=2;
				}
			} else { VIJE_HIBA++;}
			break;
		case 2: /*Megnyitott jelent�s elemz�se*/
			if (isPageLoaded(VIJE_REF2,-1,PM2[0])){VIJE2_HIBA=0; VIJE2_GHIBA=0;
				szem4_VIJE_2elemzes(PM2);
				if (PM2[3]) VIJE_LEPES=3; else VIJE_LEPES=1;
			} else { VIJE2_HIBA++;}
			break;
		case 3: /*bepip�lt jelent�sek t�rl�se*/
			szem4_VIJE_3torol();
			VIJE_LEPES=0;
			break;
		default: VIJE_LEPES=0;
	}}
}catch(e){debug("szem4_VIJE_motor()","ERROR: "+e+" L�p�s:"+VIJE_LEPES);}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
setTimeout("szem4_VIJE_motor()",nexttime);
}
/*VIJE*/
ujkieg("vije","Jelent�s Elemz�",'<tr><td>A VIJE a Farmol� t�bl�zat�ba dolgozik, itt csup�n m�k�d�si be�ll�t�sokat m�dos�thatsz.<br><br><br>"Fatelep" a szerver jelenlegi nyelv�n: <input type="text" size="15"  value="Fatelep"><br>"Agyagb�nya" a szerver jelenlegi nyelv�n: <input type="text" size="15"  value="Agyagb�nya"><br>"Vasb�nya" a szerver jelenlegi nyelv�n: <input type="text" size="15" value="Vasb�nya"><br>"Fal" a szerver jelenlegi nyelv�n: <input type="text" size="15" value="Fal"><br><input type="checkbox"> Z�ld farmjelent�sek t�rl�se<br><br><br><i>Elemzett jelent�sek:</i><div id="VIJE_elemzett" style="font-size:30%;width:980px;word-wrap: break-word;"></div></td></tr>');

var VIJE_PAUSE=false;
var VIJE_LEPES=0;
var VIJE_REF1; var VIJE_REF2;
var VIJE_HIBA=0; var VIJE_GHIBA=0;
var VIJE2_HIBA=0; var VIJE2_GHIBA=0;
var PM2;
szem4_VIJE_motor();

function TamadUpdt(lap){try{
	var table=document.getElementById("idtamad_Bejovok");
	var d=new Date();
	var jelenlegi=parseInt(lap.game_data.player.incomings,10);
	var eddigi=0;
	if (table.rows.length>1) eddigi=parseInt(table.rows[1].cells[1].innerHTML,10);
	if (jelenlegi==eddigi) return;
	
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	cell1.innerHTML=d;
	cell2.innerHTML=jelenlegi;
	
	if (jelenlegi>eddigi) playSound("bejovo"); /*replace: ATTACK SOUND!*/
	return;
}catch(e){debug("ID beir","Hiba: "+e);}
}

ujkieg_hang("Bej�v� t�mad�sok","bejovo");
ujkieg("idtamad","Bej�v� t�mad�sok",'<tr><td align="center" ><table class="vis" id="idtamad_Bejovok" style="vertical-align:top; display: inline-block;"><tr><th>Id�pont</th><th>T�mad�sok sz�ma</th></tr></table> </td></tr>');

$(document).ready(function(){
	nyit("naplo");
	naplo("Indul�s","SZEM4 Elindult. Hangteszt...");
	soundVolume(0.2);
	playSound("bot2");
	setTimeout(function(){naplo("Indul�s","Hangteszt v�ge. Ha nem hallotta a s�psz�t, v�lhet�leg nem el�rhet� a cnc weboldal - haszn�lja az alternat�v botriad�t!"); soundVolume(1.0);},3000);
	
	setTimeout('vercheck()',5000);
	$(function() {
		$("#alert2").draggable({handle: $('#alert2head')});
		$('#sugo').mouseover(function() {sugo("Ez itt a s�g�");});
		$('#fejresz').mouseover(function() {sugo("");});
	});
	$("#farm_opts input").on('keydown keypress',function(){
		setTimeout('shorttest()',20);
	});
}); 
/*
FIXME: pontos hat�rsz�m kezel�s, ne legyen hozz�ad�s h "m�g egy kis egys�g"
FIXME: Sz�molja bele az oda�rkez�s alatt keletkez� nyerseket, �s �gy keresse a "p�rj�t"
//ADDME: Ha fal van, k�ldj�n T�BB sereget! (csak kl?) "IntelliWall" (be�ll�t�s felugr� ablakba?)
ADDME: Teherb�r�s m�dos�t�
ADDME: FAKE limit, �s ennek figyelembe v�tele
REMOVE: Min sereg/falu, helyette minimum <hat�rsz�m>-nyi nyersanyag elv�tele
TRANSFORM: Gombbal �ll�t�djon �t a cucc (legyen RESET is), ezt olvassa ki, ekkor ellen�rizzen.
Optional ADDME: hat�rsz�m fel�l�r�sa FAKE limitn�l? Alap: NEM
ADDME: "S�rg�t NE t�madd"
*/
void(0);