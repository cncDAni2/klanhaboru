function stop(){
var x = setTimeout('',100); for (var i = 0 ; i < x ; i++) clearTimeout(i);}
stop(); /*Időstop*/
document.getElementsByTagName("html")[0].setAttribute("class","");

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

if (typeof(AZON)!="undefined") {alert("SZEM már fut\nHa ez nem igaz, nyiss egy új lapot, és próbáld ott újra"); exit();}
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

AZON=game_data.player.id+"_"+game_data.world+AZON;
}catch(e){alert(e);}

function vercheck(){try{
	naplo("Globál","Verzió: GIT-ről lekért legfrisebb");
}catch(e){alert2(e);}}

function init(){try{
	if (document.getElementById("production_table"))  var PFA=document.getElementById("production_table"); else 
	if (document.getElementById("combined_table"))  var PFA=document.getElementById("combined_table"); else 
	if (document.getElementById("buildings_table"))  var PFA=document.getElementById("buildings_table"); else 
	if (document.getElementById("techs_table"))  var PFA=document.getElementById("techs_table"); else 
	{alert("Ilyen nézetbe való futtatás nem támogatott. Kísérlet az áttekintés betöltésére...\n\nLaunching from this view is not supported. Trying to load overview..."); document.location.href=document.location.href.replace(/screen=[a-zA-Z]+/g,"screen=overview_villages"); return false;}
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (patt.test(PFA.rows[1].cells[0].textContent)) var oszl=0; else
	if (patt.test(PFA.rows[1].cells[1].textContent)) var oszl=1; else
	if (patt.test(PFA.rows[1].cells[2].textContent)) var oszl=2; else
	{alert("Nem találok koordinátákat ebbe a listába.\n\nI can not find coordinates in this view."); return false;}
	VILL1ST=PFA.rows[1].cells[oszl].getElementsByTagName("a")[0].href;
	for (var i=1;i<PFA.rows.length;i++){
		var kord=PFA.rows[i].cells[oszl].textContent.match(/[0-9]+(\|)[0-9]+/g);
		kord=kord[kord.length-1];
		KTID[i-1]=kord+";"+PFA.rows[i].cells[oszl].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0];
	}
	document.getElementsByTagName("head")[0].innerHTML += '<style type="text/css">body{ background: #111; } table.fej{ padding:1px;  margin:auto; color: white; border: 1px solid yellow; } table.menuitem{ vertical-align:top; text-align: top; padding: 20px; margin:auto; color: white; border: 1px solid yellow; } table.menuitem td{ padding: 0px; vertical-align:top; }  table{ padding: 0px; margin: auto; color: white;  } table.vis{ color:black; } table.vis td, table.vis th{ padding: 3px 6px 3px 6px;  } #farm_honnan tr td:last-child{font-size:50%;  width:130px;} #farm_hova tr td:last-child{font-size:50%; width:130px;}  textarea{ background-color: #020; color:white; } .divrow{ display: table-row; } .divcell { display: table-cell; text-align: center; vertical-align:top; }  a{ color: white; } img{ border-color: grey; padding:1px; } #naploka a {color:blue;} input[type="button"] {font-size:13px; font-family:Century Gothic,sans-serif;    color:#FFFF77;    background-color:#3366CC;    border-style:ridge;    border-color:#000000;    border-width:3px; }  </style>';
	document.getElementsByTagName("body")[0].innerHTML='<div id="alert2" style="width: 300px; background-color: #60302b; color: #FFA; position: fixed; left:40%; top:40%; border:3px solid black; font-size: 11pt; padding: 5px; z-index:200; display:none"><div id="alert2head" style="width:100%;cursor:all-scroll; text-align:right; background: rgba(255,255,255,0.1)"><a href=\'javascript: alert2("close");\'>X (Bezár)</a></div><p id="alert2szov"></p></div> <table width="1024px" align="center" class="fej" style="background: #111; background-image:url(\''+pic("wallp.jpg")+'\'); background-size:1024px;"> <tr><td width="70%" id="fejresz" style="vertical-align:middle; margin:auto;"><h1><i></i></h1></td><td id="sugo" height="110px"></td></tr> <tr><td colspan="2" id="menuk" style="">  	<div class="divrow" style="width: 1024px"> 		<span class="divcell" id="kiegs" style="text-align:left; padding-top: 5px;width:774px;"><img src="'+pic("muhely_logo.png")+'" alt="Muhely" title="C&amp;C Műhely megnyitása" onclick="window.open(\'http://cncdani2.000webhostapp.com/index.php\')"> <img src="'+pic("kh_logo.png")+'" alt="Game" title="Klánháború megnyitása" onclick="window.open(\''+VILL1ST+'\')"> | </span> 		<span class="divcell" style="text-align:right; width:250px"> 			<a href=\'javascript: nyit("naplo");\' onmouseover="sugo(\'Események naplója\')">Napló</a> 			<a href=\'javascript: nyit("debug");\' onmouseover="sugo(\'Hibanapló\')">Debug</a> 			<a href=\'javascript: nyit("hang");\'><img src="'+pic("hang.png")+'" onmouseover="sugo(\'Hangbeállítások\')" alt="hangok"></a> 		</span> 	</div> 	 </td></tr> </table> <p id="content" style="display: inline"></p>';
	document.getElementById("content").innerHTML='<table class="menuitem" width="1024px" align="center" id="naplo" style="display: none"> <tr><td> <h1 align="center">Napló</h1><br> <br> <table align="center" class="vis" id="naploka"><tr><th onclick=\'rendez("datum2",false,this,"naploka",0)\'  style="cursor: pointer;">Dátum</th><th  onclick=\'rendez("szoveg",false,this,"naploka",1)\' style="cursor: pointer;">Script</th><th  onclick=\'rendez("szoveg",false,this,"naploka",2)\' style="cursor: pointer;">Esemény</th></tr></table> </td></tr> </table>  <table class="menuitem" width="1024px" align="center" id="debug" style="display: none"> <tr><td> <h1 align="center">DeBugger</h1><br> <br> <table align="center" class="vis" id="debugger"><tr><th onclick=\'rendez("datum2",false,this,"debugger",0)\' style="cursor: pointer;">Dátum</th><th onclick=\'rendez("szoveg",false,this,"debugger",1)\' style="cursor: pointer;">Script</th><th onclick=\'rendez("szoveg",false,this,"debugger",2)\' style="cursor: pointer;">Esemény</th></tr></table> </td></tr> </table>  <table class="menuitem" width="1024px" align="center" id="hang" style="display: none"> <tr><td> <p align="center"><audio id="audio1" controls="controls" autoplay="autoplay"><source id="wavhang" src="" type="audio/wav"></audio></p> <h1 align="center">Hangbeállítás</h1><br> <div id="hangok" style="display:table;"> 	<div style="display:table-row;"><div style="display:table-cell; padding:10px;" onmouseover=\'sugo("Ha be van kapcsolva, bot védelem esetén ez a link is megnyitódik, mint figyelmeztetés.")\'><b>Alternatív botriadó? <a href="javascript: altbot()">BEKAPCSOLVA</a><br>Megnyitott URL (egyszer)<br><input type="text" id="altbotURL" size="42" value="http://www.youtube.com/watch?v=k2a30--j37Q"></div>   </div> </div> </td></tr> </table>';
	document.title="SZEM IV";
	
	debug("SZEM 4","Verzió: GIT_" + new Date().toLocaleDateString());
	debug("SZEM 4","Prog.azon: "+AZON);
	debug("SZEM 4","W-Speed: "+SPEED);
	debug("SZEM 4","U-Speed: "+UNIT_S);
	return true;
}catch(e){alert("Hiba indításkor:\n\nError at starting:\n"+e); return false;}}

function pic(file){
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+file;
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
	if (ison==undefined) {debug("hanghiba","Nem definiált hang: "+hang); return}
	if (ison.checked==false) return;
	var play="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+hang+".wav";
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
	
	if (nez[0].value=="") hiba+="Termelés/óra értéke üres. Legalább egy 0 szerepeljen!\n";
	if (parseInt(nez[0].value,10)<50) warn+="Termelés/óra értéke nagyon alacsony. \n";
	
	if (nez[1].value=="") hiba+="Max táv/óra: Üres érték. \n";
	if (nez[2].value=="") hiba+="Max táv/perc: Üres érték. \n";
	if (parseInt(nez[1].value,10)==0 && parseInt(nez[2].value,10)<1) hiba+="A jelenleg megadott max távolság 0!\n";	
	if (parseInt(nez[1].value,10)==0 && parseInt(nez[2].value,10)<40) warn+="A jelenleg megadott max távolság nagyon rövid!\n";	
	
	if (nez[3].value=="") hiba+="A határszám értéke üres. Minimum megengedett értéke: 100.\n";
	if (parseInt(nez[3].value,10)<100) hiba+="A határszám értéke túl alacsony. Minimum megengedett értéke: 100.\n";
	
	
	if (nez[4].value=="") hiba+="Ha nem szeretnél kémet küldeni, írj be 0-t.\n";
	if (parseInt(nez[4].value,10)>3) warn+="3-nál több kém egyik szerveren sem szükséges. Javasolt: 1 vagy 3.\n";
	if (nez[5].checked && parseInt(nez[4].value,10)==0) warn+="Kényszeríted a kémek küldését, de a küldendő kém értékére 0 van megadva!\n";
	if (nez[6].checked && parseInt(nez[4].value,10)==0) warn+="Kezdő kémtámadást szeretnél, de a küldendő kém értékére 0 van megadva!\n";
	
	if (nez[7].value=="") hiba+="Ha minimum limit nélkül szeretnéd egységeid küldeni, írj be 0-t.\n";
	var hatarszam=parseInt(nez[3].value,10);
	var minsereg=parseInt(nez[7].value,10);
	
	if (Math.ceil(hatarszam/20)<minsereg) hiba+="A minimum sereg/falu legalább 20x-osa kell hogy legyen a határszám. Javaslatok: Minimum sereg "+Math.ceil(hatarszam/20)+", vagy Határszám: "+Math.ceil(minsereg*20)+"\n";
	
	if (nez[8].value=="") hiba+="A legkevesebb pihenő idő: 1 perc, ne hagyd üresen.\n";
	if (parseInt(nez[8].value,10)<1) hiba+="A legkevesebb pihenő idő: 1 perc.\n";
	if (parseInt(nez[8].value,10)>150) hiba+="150 percnél több pihenő időt nem lehet megadni.\n";
	if (nez[9].value=="") hiba+="A leggyorsabb ciklusidő: 200 ms, ne hagyd üresen.\n";
	if (parseInt(nez[9].value,10)<200) hiba+="A leggyorsabb ciklusidő: 200 ms\n";
	if (parseInt(nez[9].value,10)>3000) hiba+="3000 ms-nél több ciklusidő felesleges, és feltűnő. Írj be 3000 alatti értéket.\n";
	
	if (parseInt(nez[10].value,10)<20) hiba+="Raktár telítettségi értéke túl alacsony, így vélhetőleg sehonnan se fog fosztani.";
	
	if (hiba!="" && !FARM_PAUSE) szunet("farm",document.getElementsByName("farm")[0]);
	if (FARM_PAUSE) warn+="A farmoló jelenleg meg van állítva!";
	if (hiba!="") {alert2("<b>Egy vagy több beállítási hiba miatt nem indítható a farmoló! Javítsa, majd indítsa el a kiegészítőt.</b><br><br>"+hiba); return false;} 
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
	document.getElementById("alert2szov").innerHTML="<b>Üzenet:</b><br>"+szov;
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
	document.getElementById("kiegs").innerHTML+='<img onclick=\'szunet("'+id+'",this)\' name="'+id+'" onmouseover=\'sugo("Az érintett scriptet tudod megállítani/elindítani.")\' src="'+pic("play.png")+'" alt="Stop" title="Klikk a szüneteltetéshez"> <a href=\'javascript: nyit("'+id+'");\'>'+nev.toUpperCase()+'</a> ';
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
			alert2("Ezt a script nem állítható meg, mivel nem igényel semmilyen erőforrást.<br>Ha a hangot szeretnéd kikapcsolni, megteheted azt a hangbeállításoknál.");
			break;
		case "epit":
			EPIT_PAUSE=!EPIT_PAUSE;
			var sw=EPIT_PAUSE;
			break;
		case "adatok":
			ADAT_PAUSE=!ADAT_PAUSE;
			var sw=ADAT_PAUSE;
			break;
		default: {alert2("Sikertelen script megállatás. Nincs ilyen alscript: "+script);return;}
	}
	
	if (sw) {
		kep.src=pic("pause.png");
		kep.alt="Start";
		kep.title="Klikk a folytatáshoz";
	} else {
		kep.src=pic("play.png");
		kep.alt="Stop";
		kep.title="Klikk a szüneteltetéshez";
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
			default: throw("Nem értelmezhető mi szerint kéne rendezni."); return;
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
}catch(e){alert2("Hiba rendezéskor:\n"+e);}}

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
/*dupla klikk események*/
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
	var uj=prompt('Új érték?');
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

var BOTORA, ALTBOT2=false, BOT_VOL=0.0; /*ALTBOT2 --> megnyílt e már 1x az ablak*/
function BotvedelemBe(){try{
	BOT_VOL+=0.2;
	if (BOT_VOL>1.0) BOT_VOL=1.0;
	soundVolume(BOT_VOL);
	playSound("bot2");
	BOT=true;
	alert2('BOT VÉDELEM!!!<br>Írd be a kódot, és kattints ide lentre!<br><br><a href="javascript: BotvedelemKi()">Beírtam a kódot, mehet tovább!</a>');
	if (ALTBOT && !ALTBOT2) {window.open(document.getElementById("altbotURL").value);ALTBOT2=true;}
	}catch(e){debug("BotvedelemBe()",e);}
	BOTORA=setTimeout("BotvedelemBe()",1500);
}
function BotvedelemKi(){
	BOT=false; ALTBOT2=false; BOT_VOL=0.0;
	document.getElementById("audio1").pause;
	alert2("OK");
	clearTimeout(BOTORA);
	/*Megnyitott lapok frissítése*/
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
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk=faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	var istarget=false;
	for (var j=0;j<datas.rows[2].cells[0].getElementsByTagName("input").length;j++){
		if (datas.rows[2].cells[0].getElementsByTagName("input")[j].checked==true) {istarget=true; break;}
	}
	if (!istarget){
		if (!confirm("Nincs semmilyen egység megadva, amit küldhetnék. Folytatod?\n(később ez a megadás módosítható)")) return;
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
	if (dupla!="") alert2("Dupla falumegadások, esetleg nem lévő saját faluk kiszűrve:\n"+dupla);
	return;	
}catch(e){alert(e);}}
function add_farmolando(){try{
	var datas=document.getElementById("farm_opts");
	var faluk=datas.rows[1].cells[1].getElementsByTagName("input")[0].value;
	if (faluk=="") return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
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
	if (dupla!="") alert2("Dupla falumegadások kiszűrve:\n"+dupla);
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
		nov=Math.round(nov/60); /*Mert percenként frissítjük majd*/
		var uj=(parseInt(a[i].cells[3].innerHTML)+nov);
		if (isNaN(uj)) {debug("Farmoló","Autófrissítő anomália: "+a[i].cells[0].innerHTML+"falunál: "+a[i].cells[3].innerHTML+"+"+nov+"=Nem szám!"); continue;}
		if (uj>1000000) uj=1000000;
		/*Túl régi?*/
		var age=parseInt(a[i].cells[0].getAttribute("data-age"),10); age++; a[i].cells[0].setAttribute("data-age",age);
		if (age>120) {
			var hatarszam=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value;
			if (uj>(hatarszam*2)) {
				uj=hatarszam*2;
			}
		}
		a[i].cells[3].innerHTML=uj;
	}catch(e){debug("Farmoló","Hiba az autofrissítőnél: "+e);}}
	setTimeout("szem4_farmolo_updater()",60000);
	return;
}catch(e){debug("Farmoló","Hiba az autofrissítőnél: "+e);setTimeout("szem4_farmolo_updater()",60000);}}

function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('bot_check') || ref.document.title=="Bot védelem") {
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1){
		naplo("Globális","Kijelentkezett fiók. Jelentkezzen be újra, vagy állítsa le a programot.");
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
	var lista=prompt("Faluszűrő\nAdd meg azon faluk koordinátáit, melyeket a listában szeretnél látni. A többi falu csupán láthatatlan lesz, de tovább folyik a használata.\nSpeciális lehetőségid:\n-1: Csupán ezt az értéket adva meg megfordítódik a jelenlegi lista láthatósága (negáció)\n-...: Ha az első karakter egy - jel, akkor a felsorolt faluk kivonódnak a jelenlegi listából (különbség)\n+...: Ha az első karaktered +, akkor a felsorolt faluk hozzáadódnak a listához (unió)\nÜresen leokézva az összes falu láthatóvá válik");
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
	0: Semmi sem engedélyezett
	1: Csak ló mehet
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
function szem4_farmolo_1kereso(){try{/*Farm keresi párját :)*/
	var cp=""; /*ezt támadjuk*/
	var a=document.getElementById("farm_hova").rows;
	var b=document.getElementById("farm_honnan").rows;
	var par=[]; /*Távolság;Gyalogosok e?;Koordináta-honnan;koord-hova*/
	var d=new Date(); var sp;
	if (a.length==1 || b.length==1) return "zero";
	for (var i=1;i<a.length;i++){
		if (a[i].cells[0].style.backgroundColor=="red") continue;
		if (parseInt(a[i].cells[3].textContent)<parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value)) continue;
		
		/*Farm megvan (a[i]. sor), párkeresés hozzá (van e egyátalán (par.length==3?))*/
		var hogyok="";
		for (var j=1;j<b.length;j++){
			sp=0;
			/*Elérhető forrás keresése*/
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
			
			/*Sebesség kiszámítása*/
			var gy=isgyalog(j);
			if (gy==0) continue;
			if (gy==1 && hogyok=="gyalog") continue;
			if (gy==1 && hogyok=="all") sp=10;
			if (gy==2 && hogyok=="gyalog") sp=18;
			if (gy==2 && hogyok=="all") sp=10;
			if (gy==3) {sp=18; hogyok="gyalog";}
			
			if (sp==0) {debug("Farmoló","Anomália lépett fel farmkereséskor."); continue;}
			sp=sp*(1/SPEED)*(1/UNIT_S);
			/*alert2("hogyok: "+hogyok+" -- speed: "+sp+" --- gy="+gy);*/
			sp=sp*(distCalc(a[i].cells[0].textContent.split("|"),b[j].cells[0].textContent.split("|"))); /*a[i]<->b[j] távkeresés*/
			/*debug("farm",a[i].cells[0].textContent+" - "+b[j].cells[0].textContent+" táv="+sp);*/
			if (par.length==0 || par[0]>sp) {/*Közelebbit találtam*/
				par=[sp,hogyok,b[j].cells[0].textContent,a[i].cells[0].textContent];
			}
		}
	}
	if (par.length==0) {return "";}/*Nincs munka*/
	var maxspeed=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[1].value)*60+(parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[2].value));
	/*debug("TEST_01",maxspeed+" - "+par[0]);*/
	if (par[0]>maxspeed) return "";
	/*debug("Farmolo","Célpontválasztás: "+par);	*/
	return par;
}catch(e){debug("szem4_farmolo_1kereso()",e);}
	return "";
}

function szem4_farmolo_2illeszto(adatok){try{/*FIXME: határszám alapján számolódjon a min. sereg*/
	/*Lovat a gyalogossal együtt nem küld. Ha adatok[1]=="all" -->ló megy. Ha az nincs, majd return-ba rászámolunk*/
	try{TamadUpdt(FARM_REF);}catch(e){}
	var C_form=FARM_REF.document.forms["units"];
	C_form.x.value=adatok[3].split("|")[0];
	C_form.y.value=adatok[3].split("|")[1];
	if (C_form["input"].value == undefined) {
		throw "Nem töltött be az oldal?"+C_form["input"].innerHTML;
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
	/*Elérhető sereg*/
	var elerheto=new Array();
	for (var i=0;i<UNITS.length;i++){try{
		if (falu_helye[i].checked) elerheto[i]=parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
		else {
			if (i==4 && opts[5].checked) elerheto[i]=parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
			else elerheto[i]=0;
		}
		}catch(e){elerheto[i]=0;}
	}
	
	/*Listaösszeállítás*/
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
	
	
	if (ny>parseInt(opts[3].value,10)) C_form.spy.value=0; /*Ha biztos megy rá MÉG támadás*/	
	
	var kek=false;
	/*Forced?*/if (opts[5].checked && elerheto[4]<parseInt(opts[4].value)) {ezt=adatok[1]+"|semmi";} else {
	
	/*Raktár túltelített?*/ var nyersarany=(parseInt(FARM_REF.document.getElementById("wood").textContent)+parseInt(FARM_REF.document.getElementById("stone").textContent)+parseInt(FARM_REF.document.getElementById("iron").textContent))/(parseInt(FARM_REF.document.getElementById("storage").textContent)*3);
	/*debug("Illeszt","Nyersarány: "+Math.round(nyersarany*100)+", limit: "+parseInt(opts[10].value));*/
	if (Math.round(nyersarany*100)>parseInt(opts[10].value))  {ezt=adatok[1]+"|semmi";} else {
	
		/*FAKE LIMIT!?*/
		/*console.info('Össz:', betesz_ossz, parseInt(opts[7].value), betesz_ossz>parseInt(opts[7].value));*/
		if (betesz_ossz>=parseInt(opts[7].value)) {
			/*Init?*/
			if (opts[6].checked) {
				if (farm_helye.cells[1].style.backgroundColor=="rgb(213, 188, 244)") C_form.spy.value=0;
				if (farm_helye.cells[1].innerHTML!="") C_form.spy.value=0;
			}
			if (parseInt(C_form.spy.value,10)>0 && farm_helye.cells[1].innerHTML=="") kek=true;
			
			/*debug("Farmolo()","Seregküldés "+adatok[3]+"-re. Nyers_faluba: "+parseInt(farm_helye.cells[3].textContent,10)+". Egység küldés: "+debugstr+". Teherbírás: "+debugzsak);*/
			if ((debugzsak-100)>parseInt(farm_helye.cells[3].textContent,10)) debug("Farmolo()","<b>ERROR: TOO MANY UNITS</b>");
			C_form.attack.click(); ezt=adatok[1]; 						
		} else ezt=adatok[1]+"|semmi";
	}}
	
	/*console.info('Beillesztve', [ny,ezt,adatok[2],adatok[3],sslw,kek,debugzsak]);*/
	return [ny,ezt,adatok[2],adatok[3],sslw,kek,debugzsak]; /*nyers_maradt;all/gyalog/semmi;honnan;hova;speed_slowest;kém ment e;teherbírás*/
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
	
	/*Piros szöveg*/
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].getAttribute("class")=="error_box"){
			naplo("Farmoló","Hiba "+adatok[3]+" farmolásánál: "+FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].textContent+". Tovább nem támadom");
			farm_helye.cells[0].style.backgroundColor="red";
			FARM_LEPES=0;
			return "";
		}
	}catch(e){/*debug("3()","Nincs hiba");*/}
	
	/*Játékos-e?*/	
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].getElementsByTagName("a")[0].href.indexOf("info_player")>-1){
			if (!farm_helye.cells[4].getElementsByTagName("input")[0].checked){
				naplo("Farmoló","Játékos "+maplink(adatok[3])+" helyen: "+FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].innerHTML.replace("href",'target="_BLANK" href')+". Tovább nem támadom");
				farm_helye.cells[0].style.backgroundColor="red";
				FARM_LEPES=0;
				return "";
			}
		}
	}catch(e){/*debug("3()","Nincs játékos");*/}
	
	/*adatok[6]==teherbírás?. Egyezik?*/
	try{
		var a=FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows;
		a=parseInt(a[a.length-1].cells[0].textContent.replace(/[^0-9]+/g,""));
		/*debug("farm3","Teher: "+adatok[6]+"_Itteni teher: "+a);*/
		if (adatok[6]!=a) debug("farm3","Valódi teherbírás nem egyezik a kiszámolttal. Hiba, ha nincs teherbírást módosító \"eszköz\".");
	}catch(e){debug("farm3","Teherbírás megállapítás hiba: "+e);}
	
	hatszam=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10);
	if (adatok[1].indexOf("semmi")==-1 || adatok[6]>hatszam*2) {
		var opts=document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input");
		if (adatok[5]) farm_helye.cells[1].style.backgroundColor="rgb(213, 188, 244)";
		FARM_REF.document.getElementById("troop_confirm_submit").click();
		farm_helye.cells[0].setAttribute("data-age",0);
		if (adatok[0]>parseInt(opts[3].value)){
			/*Lekérni a szerver időt*/
			var d=getServerTime(FARM_REF);
			var ido=distCalc(adatok[2].split("|"),adatok[3].split("|"));
			ido=ido*(1/SPEED)*(1/UNIT_S)*adatok[4]; ido=(Math.round(ido));
			/*debug("farm3",ido+"p a táv, "+d+" az idő - összenyomjuk!");*/
			d.setMinutes(d.getMinutes()+ido);
			farm_helye.cells[5].innerHTML=d;
		}	
	}
	farm_helye.cells[3].innerHTML=adatok[0];
	if (adatok[1]=="all") var sarga=true; else var sarga=false;
	var nez=false; if (adatok[0]>25) nez=true;
	return [nez,sarga,adatok[2],adatok[3]];
	/*Legyen e 3. lépés;sárga hátteres idő lesz?;honnan;---*/
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

	if (lehetEGyalog){ /*Sárga; de ha nincs gyalog->fehér*/
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
	} /*ellenben nézd meg van e bent ló amit lehet küldeni!?*/
	
	/*Leggyorsabb kijelölt egység*/
	var a=falu_helye.cells[1].getElementsByTagName("input");
	var fastest=22;
	for (var i=0;i<a.length;i++){
		if (i==4) continue;
		if (a[i].checked && E_SEB[i]<fastest) fastest=E_SEB[i];
	}
	fastest = fastest*(1/SPEED)*(1/UNIT_S);
	
	/*Leghamarább visszaérő sereg*/
	/*var mozgas = getLastDate(FARM_REF,fastest);
	if (!(mozgas instanceof Date && !isNaN(mozgas.valueOf()))) {
		debug('Advanced error at #1', mozgas + " - Fastest: " + fastest);
		naplo("Farmolo",'<a target="_BLANK" href=\''+VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(adatok[2])).replace("screen=overview","screen=place")+'\'>'+adatok[2]+'</a> faluban nincs egység, vagy túltelített a raktár!.');
		sarga=false;
		var d = new Date();
		d.setMinutes(d.getMinutes()+(30*SPEED));
		falu_helye.cells[2].innerHTML=d;
		return;
	}*/
	
	var sarga=true;
	
	if (/*mozgas && */!lehetEGyalog) sarga=false;
	/*if (!mozgas && !lehetEGyalog) {
		naplo("Farmolo",'<a target="_BLANK" href=\''+VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(adatok[2])).replace("screen=overview","screen=place")+'\'>'+adatok[2]+'</a> faluban nincs egység, vagy túltelített a raktár!.');
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
	if (FARM_HIBA>10) {FARM_HIBA=0; FARM_GHIBA++; if(FARM_GHIBA>3) {if (FARM_GHIBA>5) {naplo("Globál","Nincs internet? Folyamatos hiba farmolónál"); nexttime=60000; playSound("bot2"); } FARM_REF.close();} FARM_LEPES=0;}
	switch (FARM_LEPES){
		case 0: /*Meg kell nézni mi lesz a célpont, +nyitni a HONNAN-t.*/
				PM1=szem4_farmolo_1kereso();
				if (PM1=="zero") {nexttime=10000; break;} /*Ha nincs még tábla feltöltve*/
				if (PM1=="") {nexttime=parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[8].value,10)*60000; break;}
				FARM_REF=window.open(VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(PM1[2])).replace("screen=overview","screen=place"),AZON+"_Farmolo");
				FARM_REF.blur();
				/*debug("Farmoló_ToStep1",PM1);*/
				FARM_LEPES=1;
				break;
		case 1: /*Gyül.helyen vagyunk, be kell illeszteni a megfelelő sereget, -nyers.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"screen=place")) {
					FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_2illeszto(PM1);
					console.info("PM1::", PM1);
					if (typeof(PM1)=="object" && PM1.length>0) {
						/*debug("Farmoló_ToStep2",PM1);*/
						if (PM1[1].indexOf("semmi")>0) 
							FARM_LEPES=3;
						else
							FARM_LEPES=2;
					} else FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		case 2: /*Confirm: nem e jött piros szöveg, játékos e -> OK-ézás.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_3egyeztet(PM1);
					if (typeof(PM1)=="object" && PM1.length>0 && PM1[0]==true) {/*debug("Farmoló_ToStep3",PM1);*/ FARM_LEPES=3;} else FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		case 3: /*Támadás elküldve, időt és ID-t nézünk, ha kell.*/ 
				/*Kell e időt nézni? Kell, ha PM1[1].indexOf("semmi")>-1 VAGY PM1[0]=TRUE; */
				if (isPageLoaded(FARM_REF,koordTOid(PM1[2]),"not try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					szem4_farmolo_4visszaell(PM1);
					FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		default: FARM_LEPES=0;
	}}
}catch(e){debug("szem4_farmolo_motor()",e+" Lépés:"+FARM_LEPES);}

var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
console.info("Heartbeat", nexttime, FARM_LEPES);
FARMOLO_TIMER = setTimeout(function(){szem4_farmolo_motor()},nexttime);
return;}

var KTID=new Array(), /*Koord-ID párosok*/
	TERMELES=new Array(5,30,35,41,47,55,64,74,86,100,117,136,158,184,214,249,289,337,391,455,530,616,717,833,969,1127,1311,1525,1774,2063,2400),
	UNITS=new Array("spear","sword","axe","archer","spy","light","marcher","heavy"),
	TEHER=new Array(25,15,10,10,0,80,50,50),
	TANYA=new Array(1,1,1,1,2,4,5,6),
	E_SEB=new Array(18,22,18,18,9,10,10,11),
	BOT=false.
	FARMOLO_TIMER;
	
init();
ujkieg_hang("Alaphangok","naplobejegyzes;bot2");
ujkieg("farm","Farmoló",'<tr><td>  <table class="vis" id="farm_opts" style="width:100%; margin-bottom: 50px;"><tr><th>Farmoló falu hozzáadása</th><th>Farmolandó falu hozzáadása</th></tr><tr><td style="width:48%;" onmouseover="sugo(\'Adj meg koordinátákat, melyek a te faluid és farmolni szeretnél velük. A koordináták elválasztása bármivel történhet.\')">Koordináták: <input type="text" size="45" placeholder="111|111, 222|222, ..."> <input type="button" value="Hozzáad" onclick="add_farmolo()"></td><td style="width:52%;" onmouseover="sugo(\'Adj meg koordinátákat, amelyek farmok, és farmolni szeretnéd. A koordináták elválasztása bármivel történhet.\')">Koordináták:  <input type="text" size="45" placeholder="111|111, 222|222, ..."> <input type="button" value="Hozzáad" onclick="add_farmolando()"></td></tr><tr><td onmouseover="sugo(\'A felvivendő falukból ezeket az egységeket használhatja SZEM IV farmolás céljából. Később módosítható.\')" style="vertical-align:middle;">Mivel? '+rovidit("egysegek")+'</td><td>Termelés/óra: <input onkeypress="validate(event)" type="text" size="5" value="3600" onmouseover="sugo(\'Ha nincs felderített bányaszint, úgy veszi ennyi nyers termelődik\')"> Max táv: <input type="text" size="2" value="4" onkeypress="validate(event)" onmouseover="sugo(\'A max távolság, amin túl már nem küldök támadásokat\')">óra <input onkeypress="validate(event)" type="text" size="2" value="0" onmouseover="sugo(\'A max távolság, amin túl már nem küldök támadásokat\')">perc. Határszám: <input type="text" onkeypress="validate(event)" onmouseover="sugo(\'Az új farmok ennyi nyersanyaggal lesznek felvíve. Másrész, ez alatti nyersanyagért még nem indulok el.\')" value="3600" size="5"><br>Kém/falu: <input onkeypress="validate(event)" type="text" value="1" size="2" onmouseover="sugo(\'Minden támadással ennyi kém fog menni\')"> Kényszerített?<input type="checkbox" onmouseover="sugo(\'Kémek nélkül nem indít támadást. Kémeket annak ellenére is fog vinni, ha nincs bepipálva a kém egység.\')">Kezdő feld.?<input type="checkbox" onmouseover="sugo(\'Minden falura maximum egyszer fog menni kém.\')">&nbsp;&nbsp;Min sereg/falu: <input onkeypress="validate(event)" type="text" value="100" size="4" onmouseover="sugo(\'Ennél kevesebb fő támadásonként nem indul. A szám tanyahely szerinti foglalásban értendő.\')"><br>Sebesség: <input onkeypress="validate(event)" type="text" size="2" value="10" onmouseover="sugo(\'Ha a farmoló nem talál több feladatot magának megáll, ennyi időre. Érték lehet: 1-300. Javasolt érték: 10-120 perc\')">perc/<input onkeypress="validate(event)" type="text" size="3" value="500" onmouseover="sugo(\'Egyes utasítások/lapbetöltődések ennyi időközönként hajtódnak végre. Érték lehet: 200-6000. Javasolt: 500ms, lassabb gépek esetén 1000-2000.\')">ms. Ha a raktár &gt;<input type="text" size="2" onmouseover="sugo(\'Figyeli a raktár telítettségét, és ha a megadott % fölé emelkedik, nem indít támadást onnan. Telítettség össznyersanyag alapján számolva. Min: 20. Ne nézze: 100-nál több érték megadása esetén.\')" value="90">%, nem foszt.</td></tr></table>  <table class="vis" id="farm_honnan" style="vertical-align:top; display: inline-block; width:550px"><tr><th width="55px" onmouseover="sugo(\'Ezen falukból farmolsz. Dupla klikk az érintett sor koordinátájára=sor törlése.<br>Rendezhető\')" style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"farm_honnan",0)\'>Honnan</th><th onmouseover="sugo(\'Ezen egységeket használ fel SZEM a farmoláshoz. Bármikor módosítható.\')">Mivel?</th><th onmouseover="sugo(\'Ekkor ér vissza sereg a számításaim szerint. Dupla klikk=törlés=már megérkezett/nézd újra.<br>Rendezhető.<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.\')" onclick=\'rendez("datum",false,this,"farm_honnan",2)\' style="cursor: pointer; vertical-align:middle;">Return <span style="margin-left: 45px; margin-right: 0px;"><img src="'+pic("search.png")+'" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport(\'honnan\')"><input type="checkbox" id="farm_multi_honnan" onmouseover="sugo(\'Ha bepipálod, akkor egy cellán végzett dupla klikkes művelet minden sorra érvényes lesz az adott oszlopba (tehát minden falura), ami jelenleg látszik. Légy óvatos!\')"></span></th></tr></table> <table class="vis" id="farm_hova" style="vertical-align:top; display: inline-block;"><tr><th onmouseover="sugo(\'Ezen falukat farmolod. A háttérszín jelöli a jelentés színét: alapértelmezett=zöld jelik/nincs felderítve. Sárga=veszteség volt a falun. Piros: a támadás besült, nem megy rá több támadás.<br>Dupla klikk a koordira: a háttérszín alapértelmezettre állítása.<br>Rendezhető\')" style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"farm_hova",0)\'>Hova</th><th onmouseover="sugo(\'Felderített bányaszintek, ha van. Kék háttér: megy rá kémtámadás.<br>Dupla klikk=az érintett sor törlése\')">Bányák</th><th onmouseover="sugo(\'Fal szintje. Dupla klikk=háttér csere (csak megjelölésként). <br>Rendezhető.\')" onclick=\'rendez("szam",false,this,"farm_hova",2)\' style="cursor: pointer;">Fal</th><th onmouseover="sugo(\'Számítások szerint ennyi nyers van az érintett faluba. Dupla klikk=érték módosítása.<br>Rendezhető.\')" onclick=\'rendez("szam",false,this,"farm_hova",3)\' style="cursor: pointer;">Nyers</th><th onmouseover="sugo(\'Játékos e? Ha játékost szeretnél támadni, pipáld be a falut mint játékos uralta, így támadni fogja. Ellenben piros hátteret kap a falu.\')">J?</th><th onmouseover="sugo(\'A falura ekkor ér be az utolsó nagyerejű támadás. Információ a jelentés elemzőnek. Dupla klikk=idő törlése.<br>Rendezhető.<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.\')" onclick=\'rendez("datum",false,this,"farm_hova",5)\' style="cursor: pointer; vertical-align:middle;">Ut.T<span style="margin-left: 65px; margin-right: 0px;"><img src="'+pic("search.png")+'" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport(\'hova\')"><input type="checkbox" id="farm_multi_hova"></span></th></tr></table></p> </td></tr>');
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
	/*Eredménye: jelentés azon;célpont koord;jelentés SZÍNe;volt e checkbox-olt jeli*/
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
		var eredm=VIJE_FarmElem(koord); /*BenneVanE,VanEBanyaSzint,ut. támadás ideje*/
		if (eredm[0]==false) continue;
		/*+++IDŐ*/
		var d=getServerTime(VIJE_REF1); var d2=getServerTime(VIJE_REF1);
		if (eredm[2]>d) {/*debug("VIJE1()",jid+":"+koord+"-et nem nézem, mert van rá \"nagy\" támadás.");*/ continue;}
		
		(function convertDate(){
			var ido = VT[i].cells[2].textContent;
			var oraperc=ido.match(/[0-9]+:[0-9]+/g)[0];
			var nap=ido.replace(oraperc,"").match(/[0-9]+/g)[0];
			d.setMinutes(parseInt(oraperc.split(":")[1],10));
			d.setHours(parseInt(oraperc.split(":")[0],10));
			d.setDate(parseInt(nap,10));
		})();
		
		/*debug("VIJE1()","Ezt nézem: koord "+koord+". Idő: "+d+", most: "+d2+". Különbség: "+(d2-d));*/
		if ((d2-d) > 10800000 || (d2-d) < 0) var regi=true; else var regi=false; /*3 óra*/
		if (eredm[1]==false) { vane=true; break;}
		if (regi) continue;
		if (eredm[1]==true) { /*bányaszint ismert, de elemezni kell*/
			vane=true; break;
		}
	}
	if (!vane) {
		for (var i=VT.length-2;i>0;i--){
			if (VT[i].cells[0].getElementsByTagName("input")[0].checked) return [0,0,"",true];
		}
		return [0,0,"",false];
	} /*Ha nincs talált jeli --> nézd meg volt e checkboxolt, és ha igen, akkor a 4. PM=true;*/
	
	if (szin=="green") VT[i].cells[0].getElementsByTagName("input")[0].checked=true;
	/*debug("VIJE_1()","Megvan a jeli amit nézni kell majd! Koord: "+koord+" ID="+jid);*/
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
		/*DEBUG*/if (nyers>parseInt(document.getElementById("farm_opts").rows[2].cells[1].getElementsByTagName("input")[3].value,10)*3) debug("VIJE_adatbeír","Sok nyers van itt, lehet hiba? "+koord+" falunál");}
	if (szin==="green") farm_helye.cells[0].style.backgroundColor="#f4e4bc"; else 
	if (szin==="yellow") farm_helye.cells[0].style.backgroundColor="yellow"; else 
	if (szin==="blue") {} else 
	{farm_helye.cells[0].style.backgroundColor="red"; naplo("Jelentés Elemző",koord+" farm veszélyesnek ítélve. Jelentésének színe "+szin+".");}
	if (farm_helye.cells[5].innerHTML!="") farm_helye.cells[5].innerHTML="";
	return;
}catch(e){debug("VIJE_adatbeir","Hiba: "+e);}}
function szem4_VIJE_2elemzes(adatok){try{
	/*Adatok: [0]jelentés azon;[1]célpont koord;[2]jelentés SZÍNe;[3]volt e checkbox-olt jeli;[4]régi jeli e? (igen->nincs nyerselem)*/
	var nyersossz=0;
	if (VIJE_REF2.document.getElementById("attack_spy_resources")){
		var x=VIJE_REF2.document.getElementById("attack_spy_resources").rows[0].cells[1];
		if (adatok[4]) {var nyersossz="";debug("VIJE2","Nem kell elemezni (régi)"); } else {
			try{
				if (/\d/.test(x.textContent)) {
					var nyers=x.textContent.replace(/\./g,"").match(/[0-9]+/g); 
					if (nyers.length!=3) throw "LENGTH_NOT_3";
					if (x.innerHTML.indexOf("iron")===-1) throw "IRON_NOT_FOUND";
					var nyersossz=0;
					for (var i=0;i<nyers.length;i++) nyersossz+=parseInt(nyers[i],10);
				} else {
					nyersossz=0;
				}
			}catch(e){var nyersossz=0; debug("VIJE","<a href='"+VIJE_REF2.document.location+"' target='_BLANK'>"+adatok[0]+"</a> ID-jű jelentés nem szokványos, talált nyers 0-ra állítva. Hiba: "+e);}
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
		} else { /*Csak nyerset láttunk*/
			var banyak="";
			var fal="";
		}
		VIJE_adatbeir(adatok[1],nyersossz,banyak,fal,adatok[2]);
	} else {
		/*Nem 0-t adunk vissza hanem negatívot: amennyit fosztottunk! Új funkció*/
		VIJE_adatbeir(adatok[1],0,"","",adatok[2]);
		/*Nincs elemzendo adat :(*/
	}
	
	/*Tedd be az elemzettek listájába az ID-t*/
	document.getElementById("VIJE_elemzett").innerHTML+=adatok[0]+",";
	if (document.getElementById("VIJE_elemzett").innerHTML.split(",").length>200){
		document.getElementById("VIJE_elemzett").innerHTML=document.getElementById("VIJE_elemzett").innerHTML.split(",").splice(100,100)+",";
	}
	
	return true;
}catch(e){debug("VIJE2","Elemezhetetlen jelentés: "+adatok[0]+":"+adatok[1]+". Hiba: "+e); VIJE_adatbeir(adatok[1],nyersossz,"","",adatok[2]); return false;}}

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
				naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); nexttime=60000; playSound("bot2");
			}
			debug('szem4_VIJE_motor', 'Jelentés elemzo hiba >3, ablak bezár/újranyit');
			VIJE_REF1.close();
		} VIJE_LEPES=0;
	}
	
	if (VIJE2_HIBA>10) {VIJE2_HIBA=0; VIJE2_GHIBA++; if(VIJE2_GHIBA>3) {if (VIJE2_GHIBA>5) naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); VIJE_REF2.close();} VIJE_LEPES=0;}
	if (!VIJE_REF1 || (VIJE_LEPES!=0 && VIJE_REF1.closed)) VIJE_LEPES=0;
	
	
	switch(VIJE_LEPES){
		case 0: /*Támadói jelentések megnyitása*/
			if (document.getElementById("farm_hova").rows.length>1){
			var csoport="";
			if (game_data.player.premium) csoport="group_id=-1&";
			VIJE_REF1=window.open(VILL1ST.replace("screen=overview","mode=attack&"+csoport+"screen=report"),AZON+"_SZEM4VIJE_1");
			VIJE_REF1.blur();
			VIJE_LEPES=1;
			} else nexttime=10000;
			break;
		case 1: /*Megnyitandó jelentés kiválasztás(+bepipálás)*/
			if (isPageLoaded(VIJE_REF1,-1,"screen=report")){VIJE_HIBA=0; VIJE_GHIBA=0;
				PM2=szem4_VIJE_1kivalaszt();
/*Nincs meló->60k*/	if (PM2[0]===0) {
					if (PM2[3]) VIJE_LEPES=3; else {VIJE_LEPES=0; nexttime=120000;}
				} else {
					VIJE_REF2=window.open(VILL1ST.replace("screen=overview","mode=attack&view="+PM2[0]+"&screen=report"),AZON+"_SZEM4VIJE_2");
					VIJE_REF2.blur();
					VIJE_LEPES=2;
				}
			} else { VIJE_HIBA++;}
			break;
		case 2: /*Megnyitott jelentés elemzése*/
			if (isPageLoaded(VIJE_REF2,-1,PM2[0])){VIJE2_HIBA=0; VIJE2_GHIBA=0;
				szem4_VIJE_2elemzes(PM2);
				if (PM2[3]) VIJE_LEPES=3; else VIJE_LEPES=1;
			} else { VIJE2_HIBA++;}
			break;
		case 3: /*bepipált jelentések törlése*/
			szem4_VIJE_3torol();
			VIJE_LEPES=0;
			break;
		default: VIJE_LEPES=0;
	}}
}catch(e){debug("szem4_VIJE_motor()","ERROR: "+e+" Lépés:"+VIJE_LEPES);}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
setTimeout("szem4_VIJE_motor()",nexttime);
}
/*VIJE*/
ujkieg("vije","Jelentés Elemző",'<tr><td>A VIJE a Farmoló táblázatába dolgozik, itt csupán működési beállításokat módosíthatsz.<br><br><br>"Fatelep" a szerver jelenlegi nyelvén: <input type="text" size="15"  value="Fatelep"><br>"Agyagbánya" a szerver jelenlegi nyelvén: <input type="text" size="15"  value="Agyagbánya"><br>"Vasbánya" a szerver jelenlegi nyelvén: <input type="text" size="15" value="Vasbánya"><br>"Fal" a szerver jelenlegi nyelvén: <input type="text" size="15" value="Fal"><br><input type="checkbox"> Zöld farmjelentések törlése<br><br><br><i>Elemzett jelentések:</i><div id="VIJE_elemzett" style="font-size:30%;width:980px;word-wrap: break-word;"></div></td></tr>');

var VIJE_PAUSE=false;
var VIJE_LEPES=0;
var VIJE_REF1; var VIJE_REF2;
var VIJE_HIBA=0; var VIJE_GHIBA=0;
var VIJE2_HIBA=0; var VIJE2_GHIBA=0;
var PM2;
szem4_VIJE_motor();

$(document).ready(function(){
	nyit("naplo");
	naplo("Indulás","SZEM4 Elindult. Hangteszt...");
	soundVolume(0.2);
	playSound("bot2");
	setTimeout(function(){naplo("Indulás","Hangteszt vége. Ha nem hallotta a sípszót, vélhetőleg nem elérhető a cnc weboldal - használja az alternatív botriadót!"); soundVolume(1.0);},3000);
	
	setTimeout('vercheck()',5000);
	$(function() {
		$("#alert2").draggable({handle: $('#alert2head')});
		$('#sugo').mouseover(function() {sugo("Ez itt a súgó");});
		$('#fejresz').mouseover(function() {sugo("");});
	});
	$("#farm_opts input").on('keydown keypress',function(){
		setTimeout('shorttest()',20);
	});
}); 
/*
ADDME: webworker :(
ADDME: szüneteltethetó a falu támadása/pipára mint a J?
FIXME: Loading unit types
FIXME: Ne töltse be újra a lapot a farmoló, ha már azon vagyok ami kell! 10:00
ADDME: Farmok rendezése táv szerint
ADDME: Címet írd már át h "SZEM IV", csak hogy tudjuk. Esetlen külön motorba, ami minden referenciát átír mp-enként
ADDME: VIJE sat, h hány %-osan térnek vissza az egységek. Óránként resettelni!?
FIXME: pontos határszám kezelés, ne legyen hozzáadás h "még egy kis egység"
FIXME: Kevesebbszer nyissa a lapot
ADDME: "Sárgát NE támadd"
ADDME: Ha fal van, küldjön TÖBB sereget! (csak kl?) "IntelliWall" (beállítás felugró ablakba?)
ADDME: Fal szint lehessen mínusz is, ha elofeltételek nem teljesülnek: Barakk és 3as fohadi
ADDME: Reset/ébreszto: Néha pihen a script, lehessen "felébreszteni" (timeout clear+újra motorindít)
LOG: Ha lapot kell nyitnia, azt logolja a debug-ba miért kellett neki (hiba/nem talált)
ADDME: Teherbírás módosító
FIXME: Számolja bele az odaérkezés alatt keletkező nyerseket, és úgy keresse a "párját"
ADDME: FAKE limit, és ennek figyelembe vétele
REMOVE: Min sereg/falu, helyette minimum <határszám>-nyi nyersanyag elvétele
?TRANSFORM: Gombbal állítódjon át a cucc (legyen RESET is), ezt olvassa ki, ekkor ellenőrizzen.
Optional ADDME: határszám felülírása FAKE limitnél? Alap: NEM
*/

void(0);