var TIME = 333; /*Ennyi ms-enként dolgozik 1-1 lapon*/
if (typeof(MEGVALTO)=="undefined") MEGVALTO=true; else exit(0);
function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

/*Format: Unit1,Unit2,Unit3,Unit4,Unit5;minSereg/falu;nl=4?*/
function saveDataToCookie(){try{
	var str="";
	var unitTypes = document.getElementById("Utypes").getElementsByTagName("input");
	for (var i=0;i<unitTypes.length;i++) {
		if (i>0) str+=",";
		str+=unitTypes[i].checked;
	}
	str+=";"+document.getElementById("minegyseg").value;
	str+=";"+document.forms['megvalto'].speed.value;
	str+=";"+document.forms['megvalto'].nl.checked;
	localStorage.setItem("cnc_Megvalto",str);
}catch(e){alert("Hiba történt adat-lementéskor\n\n"+e)}}
function setDataFromCookie(){try{
	var lsItems = localStorage.getItem("cnc_Megvalto");
	if (!lsItems) return;
	lsItems = lsItems.split(";");
	var unitTypes = document.getElementById("Utypes").getElementsByTagName("input");
	var unitsCheck = lsItems[0].split(",");
	for (var i=0;i<unitTypes.length;i++) {
		unitTypes[i].checked = unitsCheck[i] == "true";
	}
	document.getElementById("minegyseg").value = lsItems[1];
	document.forms['megvalto'].speed.value = lsItems[2];
	document.forms['megvalto'].nl.checked = lsItems[3] == "true";
}catch(e){alert("Hiba történt adat-beolvasáskor\n\n"+e)}}

function getUnitImg(unitType) {
	return '<img src="/graphic/unit/unit_'+unitType+'.png">';
}

function getfaluk(){try{ /*OK*/
	var Rfaluk=0;
	var falvak=document.getElementById("production_table");
	for (var i=1;i<falvak.rows.length;i++){
		if (falvak.rows[i].style.display!="none") {
			Rfaluk++;
		}
	}
	Rfaluk2=Rfaluk;
	if (Rfaluk>100) Rfaluk2=Rfaluk+' <a href="javascript: alert(\'A böngészõ minden falut meg fog nyitni, ami jelen esetbe '+Rfaluk+'\ db-ot jelent. A megnyitás lassú lehet, és a böngészõ széteshet.\nJavasolt 100-nál kevesebb falu használata!\');">(!)</a>';
	document.getElementById("ofalu").innerHTML=Rfaluk2;
	return Rfaluk;
}catch(e){alert(e);}}

function bezar(){try{ /*OK*/
	saveDataToCookie();
	for (var i=0;i<refarray.length;i++){
		try{refarray[i].close();}catch(e){}
	}
	return;
}catch(e){alert(e);}}

function slowSuppClick(){try{
	CIK = 0;
	for (var i=0;i<refarray.length;i++) {
		setTimeout(function(){
			refarray[CIK].document.forms["units"].support.click();
			CIK++;
		},TIME*i);
	}
}catch(e){alert("OK-HIBA\n"+e);}}

function slowOkClick(){try{
	CIK = 0;
	for (var i=0;i<refarray.length;i++) {
		setTimeout(function(){
			refarray[CIK].document.forms["units"].support.click();
			CIK++;
		},TIME*i);
	}
}catch(e){alert("OK-HIBA\n"+e);}
}

function okez(){try{
	CIK = 0;
	saveDataToCookie();
	for (var i=0;i<refarray.length;i++){ /*Sereg összeszámolás*/
		setTimeout(function(){
			try{refarray[CIK].document.forms[0].submit.click();}catch(e){}
			CIK++;
		}, TIME*i);
	}
}catch(e){alert(e);}}

function getNl(){ /*nl=4 v 6?*/
	return document.forms['megvalto'].nl.checked == true ? 4 : 6;
}

function szamlalS(){try{ /*OK*/
	var maxidok=document.getElementById("beido").getElementsByTagName("input");
	if (maxidok[0].checked) var ido=maxidok[1].value; else var ido="";
	if (ido!=""){
		var datum=ido.match(/[0-9]+/g);
		for (i=0;i<6;i++){
			try{ 
				if(datum[i]=="") datum[i]=0; 
				datum[i]=parseInt(datum[i],10);
			} catch(e){alert("Hibás idõmegadás.\n"+e); return;}
		} if (datum[1]>12 || datum[2]>31 || datum[3]>23 || datum[4]>59 || datum[5]>59) {alert ("Érvénytelen idõpontmegadás"); return;}
		var adottido = new Date(datum[0],datum[1]-1,datum[2],datum[3],datum[4],datum[5],0);
	} else var adottido="";

	var sereg=new Array(0,0,0,0,0,0);
	var idore=0;
	if (refarray.length==0) throw "Nincs 1 lap sem megnyitva";
	for (var i=0;i<refarray.length;i++){
		if (!refarray[i].document.getElementById("unit_input_spear")){try{refarray[i].close();}catch(e){} continue;}
		sereg[0]+=parseInt(refarray[i].document.getElementById("unit_input_spear").parentNode.children[2].innerHTML.match(/[0-9]+/g)[0]);
		sereg[1]+=parseInt(refarray[i].document.getElementById("unit_input_sword").parentNode.children[2].innerHTML.match(/[0-9]+/g)[0]);
		if (ARCHERS) sereg[2]+=parseInt(refarray[i].document.getElementById("unit_input_archer").parentNode.children[2].innerHTML.match(/[0-9]+/g)[0]);
		sereg[3]+=parseInt(refarray[i].document.getElementById("unit_input_spy").parentNode.children[2].innerHTML.match(/[0-9]+/g)[0]);
		sereg[4]+=parseInt(refarray[i].document.getElementById("unit_input_heavy").parentNode.children[2].innerHTML.match(/[0-9]+/g)[0]);
		sereg[5]+=parseInt(refarray[i].document.getElementById("unit_input_catapult").parentNode.children[2].innerHTML.match(/[0-9]+/g)[0]);
		
		idore+=szumsereg(i,adottido);
	}
	if (adottido!="") idore="\n\nA megadott idõre viszont csak "+idore+" fõ egységet lehet küldeni"; else idore="";
	alert("Mozgosítható sereg:\n"+sereg[0]+" lándzsás\n"+sereg[1]+" kardforgató\n"+sereg[2]+" íjász\n"+sereg[3]+" felderítõ\n"+sereg[4]+" nehézlovas\n"+sereg[5]+" katapult\n\n"+
	"Összesen: "+(sereg[0]+sereg[1]+sereg[2]+sereg[4]*getNl())+" fõ egység (kata/kém nélkül)"+idore);
}catch(e){alert("Nem lehetett sereget összegezni.\n Sereg összegzésére csak akkor van lehetõség, ha a megnyitott lapokon a gyülekezõhely szerepel!\n\n"+e);}}

function szumsereg(sor,maxiido){
	function speed_Bonus(tav) {
		var extraSpeed = document.forms['megvalto'].speed.value;
		if (extraSpeed !== "") {
			extraSpeed = extraSpeed.replace(/[^0-9]+/g, "");
			extraSpeed = parseInt(extraSpeed);
			if (extraSpeed > 100) extraSpeed = 0;
			document.forms['megvalto'].speed.value = extraSpeed;
		} else extraSpeed = 0;
		extraSpeed = (100 - extraSpeed) / 100;
		return tav * extraSpeed;
	}
	
	var sereg=0;
	var csoki=refarray[sor].document; var csekk=document.getElementById("Utypes").getElementsByTagName("input");
	
	if (maxiido!=""){
		var targetcoord=refarray[sor].game_data.village.coord.split("|");
		var destcoord=document.getElementById("falu").value.split("|");
		var RTav=Math.abs(Math.sqrt(Math.pow(targetcoord[0]-destcoord[0],2)+Math.pow(targetcoord[1]-destcoord[1],2)));
		var ITav=RTav*(1/SPEED)*(1/UNITS); /*1-es sebességû unit; fel kell szorozni.*/	
		ITav = speed_Bonus(ITav);
		var date_now=new Date();
	}
	
	if (csekk[0].checked) {
		if (maxiido!="") {
			var celtav=new Date(date_now.getTime()+Math.round(60000*ITav*18));
			if (maxiido>celtav) sereg+=parseInt(csoki.getElementById("unit_input_spear").parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
		} else sereg+=parseInt(csoki.getElementById("unit_input_spear").parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
	}
	if (csekk[1].checked) {
	if (maxiido!="") {
			var celtav=new Date(date_now.getTime()+Math.round(60000*ITav*22));
			if (maxiido>celtav) sereg+=parseInt(csoki.getElementById("unit_input_sword").parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
		} else sereg+=parseInt(csoki.getElementById("unit_input_sword").parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
	}
	if (csekk[2].checked) {if (ARCHERS){
		if (maxiido!="") {
			var celtav=new Date(date_now.getTime()+Math.round(60000*ITav*18));
			if (maxiido>celtav) sereg+=parseInt(csoki.getElementById("unit_input_archer").parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
		} else sereg+=parseInt(csoki.getElementById("unit_input_archer").parentNode.children[2].textContent.match(/[0-9]+/g)[0]);
	}}
	if (csekk[3].checked) {
	if (maxiido!="") {
			var celtav=new Date(date_now.getTime()+Math.round(60000*ITav*11));
			if (maxiido>celtav) sereg+=parseInt(csoki.getElementById("unit_input_heavy").parentNode.children[2].textContent.match(/[0-9]+/g)[0])*getNl(); /*6*/
		} else sereg+=parseInt(csoki.getElementById("unit_input_heavy").parentNode.children[2].textContent.match(/[0-9]+/g)[0])*getNl(); /*6*/
	}
	if (csekk[4].checked) {
	if (maxiido!="") {
			var celtav=new Date(date_now.getTime()+Math.round(60000*ITav*30));
			if (maxiido>celtav) sereg+=parseInt(csoki.getElementById("unit_input_catapult").parentNode.children[2].textContent.match(/[0-9]+/g)[0])*8;
		} else sereg+=parseInt(csoki.getElementById("unit_input_catapult").parentNode.children[2].textContent.match(/[0-9]+/g)[0])*8;
	}
	return sereg;
}

function osszeszamol(isAlert) {
	var unitsDb = [];
	var slowest = [];
	var allUnits = { /* if isAlert*/
		spear: 0, allSpear: 0,
		sword: 0, allSword: 0,
		archer: 0, allArcher: 0,
		heavy: 0, allHeavy: 0,
		catapult: 0, allCatapult: 0,
		allTogether: 0, allAllTogether: 0
	};
	
	var minSeregPerFalu = document.getElementById("minegyseg").value;
	if (minSeregPerFalu == '') minSeregPerFalu = 0;
	
	var currUnits = {};
	for (var i=0;i<refarray.length;i++) {
		/* Get all units from i. window */
		var d = refarray[i].document;
		currUnits = getCurrUnit(d);
		
		/* Calculate distance*/
		var maxidok=document.getElementById("beido").getElementsByTagName("input");
		var isTav = maxidok[0].checked;
		slowest[i] = "";
		if (isTav) {
			var distance = getDistance();
			var adottido = getTimeFromUi(maxidok[1].value);
			var date_now = new Date();
			
			if (adottido > new Date(date_now.getTime()+Math.round(60000*distance*30))) slowest[i] = "catapult"; else
			if (adottido > new Date(date_now.getTime()+Math.round(60000*distance*22))) slowest[i] = "sword"; else
			if (adottido > new Date(date_now.getTime()+Math.round(60000*distance*18))) slowest[i] = "spear"; else
			if (adottido > new Date(date_now.getTime()+Math.round(60000*distance*11))) slowest[i] = "heavy";
		} else slowest[i] = "catapult";
				
		unitsDb[i] = szummUnits(slowest[i], currUnits, allUnits);
	}
	
	if (isAlert) {
		var idore = "\n\nA feltételek mellett maximum "+allUnits.allTogether+" fõt tudok küldeni.";
		alert("Mozgosítható sereg (" + allUnits.allAllTogether + " fõ): \n" + allUnits.allSpear+" lándzsás\n"+allUnits.allSword+" kardforgató\n"+allUnits.allArcher+" íjász\n"+allUnits.allHeavy+" nehézlovas\n"+allUnits.allCatapult+" katapult"+idore);
		console.info(allUnits);
	}
	
	return {
		slowest: slowest,
		unitsDb: unitsDb
	};
	
	function szummUnits(slowest, allUnit, allUnits) {
		var result = 0;
		var is = document.getElementById("Utypes").getElementsByTagName("input");
		if (isAlert) {
			allUnits.allCatapult += allUnit.catapult;
			allUnits.allSword += allUnit.sword;
			allUnits.allSpear += allUnit.spear;
			allUnits.allArcher += allUnit.archer;
			allUnits.allHeavy += allUnit.heavy;
			allUnits.allAllTogether += (allUnit.catapult * 8) + allUnit.sword + allUnit.spear + allUnit.archer + (allUnit.heavy * getNl());
		}
		// FIXME: Minimum egységszámot is vedd figyelembe
		switch (slowest) {
			case "catapult": if (is[4].checked) { result+=allUnit.catapult * 8; allUnits.catapult+=allUnit.catapult; }
			case "sword": if (is[1].checked) { result+=allUnit.sword; allUnits.sword+=allUnit.sword; }
			case "spear": if (is[0].checked) { result+=allUnit.spear; allUnits.spear+=allUnit.spear; }
						  if (is[2].checked) { result+=allUnit.archer; allUnits.archer+=allUnit.archer; }
			case "heavy": if (is[3].checked) { result+=allUnit.heavy * getNl(); /*6*/ allUnits.heavy+=allUnit.heavy; }
		}
		if (result < parseInt(document.getElementById("minegyseg").value, 10)) result = 0;
		allUnits.allTogether += result;
		return result;
	}
	function getDistance() {try{
		var targetcoord=refarray[i].game_data.village.coord.split("|");
		var destcoord=document.getElementById("falu").value.split("|");
		var RTav=Math.abs(Math.sqrt(Math.pow(targetcoord[0]-destcoord[0],2)+Math.pow(targetcoord[1]-destcoord[1],2)));
		var ITav=RTav*(1/SPEED)*(1/UNITS); /*1-es sebességû unit; fel kell szorozni.*/
		return speed_Bonus(ITav);
	}catch(e) {alert("Hibás koordináta megadás\n"+e)}}
	function getTimeFromUi(ido) {try {
		var datum=ido.match(/[0-9]+/g);
		for (var i=0;i<6;i++){
			
				if(datum[i]=="") datum[i]=0; 
				datum[i]=parseInt(datum[i],10);
			
		} if (datum[1]>12 || datum[2]>31 || datum[3]>23 || datum[4]>59 || datum[5]>59) {alert ("Érvénytelen idõpontmegadás"); return;}
			
		return new Date(datum[0],datum[1]-1,datum[2],datum[3],datum[4],datum[5],0);;
	} catch(e){alert("Hibás idõmegadás.\n"+e); return;}}
	function speed_Bonus(tav) {
		var extraSpeed = document.forms['megvalto'].speed.value;
		if (extraSpeed !== "") {
			extraSpeed = extraSpeed.replace(/[^0-9]+/g, "");
			extraSpeed = parseInt(extraSpeed);
			if (extraSpeed > 100) extraSpeed = 0;
			document.forms['megvalto'].speed.value = extraSpeed;
		} else extraSpeed = 0;
		extraSpeed = (100 - extraSpeed) / 100;
		return tav * extraSpeed;
	}
}
function getCurrUnit(d) {
	var returned = {
		spear: parseInt(d.getElementById("units_entry_all_spear").innerHTML.match(/[0-9]+/g)[0]),
		sword: parseInt(d.getElementById("units_entry_all_sword").innerHTML.match(/[0-9]+/g)[0]),
		heavy: parseInt(d.getElementById("units_entry_all_heavy").innerHTML.match(/[0-9]+/g)[0]),
		catapult: parseInt(d.getElementById("units_entry_all_catapult").innerHTML.match(/[0-9]+/g)[0]),
		archer: 0
	};
	if (ARCHERS) returned.archer = parseInt(d.getElementById("units_entry_all_archer").innerHTML.match(/[0-9]+/g)[0]);
	return returned;
}
function seregilleszt(kuldhetoSereg, ratio) {
	var szumm = {
		spear: 0,
		sword: 0,
		archer: 0,
		heavy: 0,
		catapult: 0
	};
	var d;
	var is = document.getElementById("Utypes").getElementsByTagName("input");
	
	for (var i=0;i<kuldhetoSereg.unitsDb.length;i++) {
		var unitToSend;
		var d = refarray[i].document;
		var currUnits = getCurrUnit(d);
		// kuldhetoSereg.unitsDb[i] <-- Ez tényleg az ottani sereg típusa létszáma
		d.getElementById("unit_input_catapult").value = "";
		if(kuldhetoSereg.unitsDb[i] == 0) continue;
		d.getElementById("unit_input_sword").value = "";
		d.getElementById("unit_input_spear").value = "";
		d.getElementById("unit_input_archer").value = "";
		d.getElementById("unit_input_heavy").value = "";
		switch (kuldhetoSereg.slowest[i]) {
			case "catapult": if (is[4].checked) { unitToSend=Math.round(currUnits.catapult * ratio); szumm.catapult += unitToSend; d.getElementById("unit_input_catapult").value=unitToSend; }
			case "sword": if (is[1].checked) { unitToSend=Math.round(currUnits.sword  * ratio); szumm.sword  += unitToSend; d.getElementById("unit_input_sword").value=unitToSend; }
			case "spear": if (is[0].checked) { unitToSend=Math.round(currUnits.spear  * ratio); szumm.spear  += unitToSend; d.getElementById("unit_input_spear").value=unitToSend; }
						  if (is[2].checked) { unitToSend=Math.round(currUnits.archer * ratio); szumm.archer += unitToSend; if (d.getElementById("unit_input_archer")) d.getElementById("unit_input_archer").value = unitToSend; }
			case "heavy": if (is[3].checked) { unitToSend=Math.round(currUnits.heavy  * ratio); szumm.heavy  += unitToSend; d.getElementById("unit_input_heavy").value=unitToSend; }
		}
		d.getElementById("place_target").getElementsByTagName("input")[0].value = document.getElementById("falu").value;
	}
	console.info("Kiküldött sereg::", szumm);
	return szumm;
}
function beilleszt(){try{
	if (refarray.length<1) return;
	saveDataToCookie();
	var kuldendoSereg = document.getElementById("oegyseg").value;
	var kuldhetoSereg = osszeszamol(false);
		
	/* Arány számítása */
	var ratio;
	var seregSzamOsszesen = 0;
	for (var i=0;i<kuldhetoSereg.unitsDb.length;i++) {
		seregSzamOsszesen += kuldhetoSereg.unitsDb[i];
	}
	if (seregSzamOsszesen == 0) {
		alert("A megadott feltételek mellett 1 fõt se tudok küldeni.")
		return;
	}
	if (kuldendoSereg == "max") ratio = 1; else {
		ratio = kuldendoSereg / seregSzamOsszesen;
		if (ratio > 1) {
			alert('Nincs ennyi sereg a falvakban, ezért a maximumot küldöm, ' + seregSzamOsszesen + " fõt.");
			ratio = 1; /*ERROR: Nincs ennyi sereg*/
		}
	}
	
	var kikuldottsereg = seregilleszt(kuldhetoSereg, ratio);
	
	slowSuppClick();
	
	str="";
	var csekk = document.getElementById("Utypes").getElementsByTagName("input");
	console.info('kikuldottsereg:', kikuldottsereg);
	if (csekk[0].checked && kikuldottsereg.spear >0) str+="&nbsp;&nbsp;"+getUnitImg('spear')+" "+kikuldottsereg.spear+" lándzsás<br>";
	if (csekk[1].checked && kikuldottsereg.sword >0) str+="&nbsp;&nbsp;"+getUnitImg('sword')+" "+kikuldottsereg.sword+" kardforgató<br>"; 
	if (csekk[2].checked && kikuldottsereg.archer>0) str+="&nbsp;&nbsp;"+getUnitImg('archer')+" "+kikuldottsereg.archer+" íjász<br>";
	if (csekk[3].checked && kikuldottsereg.heavy >0) str+="&nbsp;&nbsp;"+getUnitImg('heavy')+" "+kikuldottsereg.heavy+" nehézlovas<br>";
	if (csekk[4].checked && kikuldottsereg.catapult>0) str+="&nbsp;&nbsp;"+getUnitImg('catapult')+" "+kikuldottsereg.catapult+" katapult";
	if (str=="") str="Nagy gond van! Szerintem semmit se kell kiküldeni...";
	document.getElementById("eredmeny").innerHTML="Kiküldendõ sereg összesen:<br>"+str;
}catch(e){alert('Beilleszt hiba\n'+e);}}


function openIt(no,sor){
	var falu = document.getElementById("production_table").rows[sor].cells[0].getElementsByTagName("a");
	if (falu.length === 0) falu = document.getElementById("production_table").rows[sor].cells[1].getElementsByTagName("a");
	refarray[no]=window.open(falu[0].href.replace("overview","place"),"megvalto" + document.getElementById("megvalt_id").getElementsByTagName("input")[0].value + no);
	return;
}

function lapnyit(){try{ /*OK*/
	saveDataToCookie();
	refarray=new Array();
	var falvak=document.getElementById("production_table");
	if (getfaluk()>100) var biztos=confirm(getfaluk()+" db falut (azaz lapot) próbálsz megnyitni! Folytatod?"); else biztos=true;
	if (!biztos) return;
	
	var j=0;
	var sorok = [];
	for (var i=1;i<falvak.rows.length;i++){
		if (falvak.rows[i].style.display=="none") continue;
		sorok.push(i);
	}
	
	CIK = 0;
	for (i = 0;i<sorok.length;i++) {
		setTimeout(function(){
			openIt(CIK,sorok[CIK]);
			CIK++;
		},TIME*i);
	}
}catch(e){alert(e);}void(0);}

function init(){try{ if (ARCHERS) var a='checked'; else var a="";
	var d=new Date();
	var D2=d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':00';
	$("body").append('<style>#boxhead{padding-bottom:40px}#eredmeny{border-left: 2px solid blue;padding-left:5px;background: rgba(255,255,255,0.15);width: 250px;border-radius: 0 7px 7px 0}.megvalt_seregsz{background: rgba(0,255,0,0.6);color: #2e42D0;padding: 4px;border-radius: 10px}.megvalt_seregsz:hover{background: #2e42D0;color: white}form[name="megvalto"]{padding-bottom:10px}#megvalt_id {position: absolute; bottom:10px; right:5px; font-size: 80%;}.megvaltTbl{font-weight: bold;} .megvaltTbl tr td:first-child {text-align: right;padding-right: 7px;} .megvaltBtn{margin-left: -5px;border-left: none;width:175px;font-size:110%;text-align:left;margin-bottom:5px;padding:4px;background:linear-gradient(to right,#005,#44A);border:1px solid #66B;border-radius:0 10px 10px 0;color:#fff;cursor:pointer;outline:0}.megvaltBtn:hover{background:linear-gradient(to right,#229,#66C)}.megvaltBtn:active{background:green}</style>');
	$("body").append('<div style="background-color: #3F0;  width: 400px; background-image: url(\'https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/megvalto.png\'); color: black; font-weight:bold; background-position:center top; background-repeat:no-repeat; position: absolute; left:30%; top:30%; border:3px solid black; padding: 5px; z-index:200;" id="divbox">\
<div id="boxhead"></div>\
<b>Összes falu:</b> <p id="ofalu" style="display: inline;">???</p><br>\
<form name="megvalto">\
<table class="megvaltTbl"><tr>\
<td>Erõsítendõ falu</td><td><input type="text" id="falu" placeholder="xxx|xxx" size="7"></td>\
</tr><tr>\
<td>Küldendõ egységtípusok</td><td id="Utypes">'+getUnitImg('spear')+'<input type="checkbox" checked>\
'+getUnitImg('sword')+'<input type="checkbox" checked>\
'+getUnitImg('archer')+'<input type="checkbox"'+a+'>\
'+getUnitImg('heavy')+'<input type="checkbox" checked>\
'+getUnitImg('catapult')+'<input type="checkbox"></td>\
</tr><tr>\
<td>Küldendõ egységek száma</td><td><input type="text" id="oegyseg" placeholder="Értéke lehet \'max\'." size="14"></td>\
</tr><tr>\
<td>Minimum sereg/falu</td><td><input type="text" id="minegyseg" value="100" size="4" placeholder="0"></td>\
</tr><tr id="beido">\
<td><input type="checkbox" style="transform: scale(1.3, 1.3);"> Max beérkezési idõ <a href="javascript: alert(\'Ha bepipálod, a script figyelni fog arra, hogy a megadott idõn túl ne küldjön ki erõsítést. Ha kell, akkor egységmódosítást hajt végre, és pl. csak nehézlovast küld, hogy elérje célját.\n Ha van valamilyen erõsítés gyorsító bonusz az adott falura, azt megadhatod.\')">(?)</a></td><td><input type="text" size="18" value="'+D2+'"></td>\
</tr><tr>\
<td>Sebesség bónusz</td><td><input type="text" size="2" value="0" name="speed" placeholder="0">%</td>\
</tr><tr>\
<td>Nehézló = 4 ?</td><td><input type="checkbox" name="nl" style="transform: scale(1.3, 1.3);" value="false" onchange=""></td>\
</tr>\
</table>\
</form>\
<input class="megvaltBtn" type="button" onclick="lapnyit()" value="1) Lapok megnyitása">&nbsp;&nbsp;&nbsp;&nbsp;&rarr;&nbsp;&nbsp;<a href="javascript: osszeszamol(true)" class="megvalt_seregsz">&Sum; Seregszámlálás</a><br>\
<input class="megvaltBtn" type="button" onclick="beilleszt()" value="2) Sereg beillesztése"><br>\
<input class="megvaltBtn" type="button" onclick="okez()" value="3) Erõsítések leokézása"><br>\
<input class="megvaltBtn" type="button" onclick="bezar()" value="4) Lapok bezárása"><br>\
<p id="eredmeny"></p>C&amp;C Mûhely ~ cncDAni2\
<div id="megvalt_id">ID: <input type="text" value="M1" size="2"> <a style="color:blue" href="javascript: alert(\'Egyedi ablakcsoport-azonosító. Más ID = más ablaknevek, így pl. nem nyit rá az eddig megnyitott ablakokra.\');">(?)</a></div>\
</div>');
/*<b>Küldendõ felderítõk:</b> <input type="text" id="felder" size="4"><br>\*/
getfaluk();
setDataFromCookie();
}catch(e){alert("Indítási hiba:\n"+e);}}

try{
var BASE_URL=document.location.href.split("game.php")[0];
var CONFIG=loadXMLDoc(BASE_URL+"interface.php?func=get_config");
var ARCHERS=CONFIG.getElementsByTagName("archer")[0].textContent; if (ARCHERS=="0") ARCHERS=false; else ARCHERS=true;
var SPEED=CONFIG.getElementsByTagName("speed")[0].textContent;
var UNITS=CONFIG.getElementsByTagName("unit_speed")[0].textContent;
var CIK = 0;
}catch(e){alert(e);}

init();
refarray=new Array();

$(document).ready(function(){
	$(function() {
        $("#divbox").draggable({handle: $('#boxhead')});
	}); 
});
void(0);