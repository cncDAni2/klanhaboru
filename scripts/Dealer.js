var TABS = []; /*Az ablakok referenciája és adatai amin dolgozik [{ref: lapref, munka: munkaütem, szektor: szektor, param: minden_féle_paraméter}]*/
var MERCH = {}; /*Falukra lebontva, a kereskedők elérhetővé válásának ideje {Faluid: [array of Date]}*/
var BOT_VOL=1.0;
var ISPLAY = false;
var BOT = false;
var BOTORA;
var THRESHOLD = 3000; /* Ezen szám között már rendezettnek számít a falu */
var DEALER_VERSION = '0.11 Beta';
if (typeof getOszlopNo == 'undefined') {alert('Kérlek előbb futtasad a csoportképzőt'); exit();}
function dealer_onSectorSet() {
	var szektorName = prompt(szamlal() + ' db falut készülsz közös szektor alá vonni.\nAdd meg a szektor nevét.\n\n(Ha a szektor neve "X", akkor a Dealer nem fogja ezeket a falukat figyelembe venni, nem kereskedik velük)');
	if (szektorName == '' || szektorName == null) return;
	
	var x=document.getElementById("production_table").rows;
	var sc = getOszlopNo('dealer_szektor');
	for (i=1;i<x.length;i++){
		if (x[i].style.display == 'none') continue;
		x[i].cells[sc].innerHTML = szektorName;
	}
	setUpTABS(false);
}

function getNyersFromVillage(winref) {
	var beerkezo_lang = document.getElementById("beerkezo_lang").value.toUpperCase();
	var nyers = [winref.game_data.village.wood,winref.game_data.village.stone,winref.game_data.village.iron];
	var bar = winref.document.getElementById("market_status_bar").getElementsByTagName("table")[1];
	if (!bar) return nyers;
	bar = bar.rows[0].cells[0];
	console.info(bar.textContent, bar.textContent.indexOf(beerkezo_lang));
	var type;
	if (bar.textContent.toUpperCase().indexOf(beerkezo_lang) > -1) {
		var children = bar.childNodes;
		for (var i=0;i<children.length;i++) {
			if (children[i].tagName == "SPAN") {
				type = children[i].getElementsByTagName("span")[0].className;
				console.info(type);
				if (type.indexOf("wood") > -1) nyers[0] += parseInt(children[i].textContent.replace(/\./g, ''), 10);
				if (type.indexOf("stone") > -1) nyers[1] += parseInt(children[i].textContent.replace(/\./g, ''), 10);
				if (type.indexOf("iron") > -1) nyers[2] += parseInt(children[i].textContent.replace(/\./g, ''), 10);
			}
		}
	}
	return nyers;
}
function dealer_convertView() {
	//Header
	var newElem = document.createElement("div");
	newElem.style.background = '#050505';
	newElem.style.color = '#F5F5F5';
	newElem.style.padding="5px";
	newElem.style.position="relative";
	newElem.setAttribute("id", "dealer_header");
	newElem.innerHTML = '<img src="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/Dealer.jpg" style="display: block; height: 200px; margin:auto;">\
	<h1 align="center" style="margin: 0 0 15px 0">D E A L E R</h1>\
	<audio id="audio1" controls="controls" autoplay="autoplay" style="display:none"><source id="wavhang" src="" type="audio/wav"></audio>\
	Lehetőségek: <button type="button" id="dealer_play" onclick="startStop()">Script indítása</button><br>\
	"Beérkező", a szerver nyelvén (lsd. piac, bejövő nyers esetén): <input id="beerkezo_lang" value="Beérkező">\
	<p id="status">Állapot: A dealer elindult. Amint végeztél a beállításával, nyomd meg a "Script indítása" gombot.</p>\
	<p id="dealer_statics">Küldött nyers összesen: N/A</p>\
	<div id="dealer_console" class="console" style="position: absolute;text-align: right;right: 5px;top: 5px;width: 400px;height: 331px;"><span class="console_item">Example console item <img src="https://i.stack.imgur.com/1V57D.jpg?s=32&g=1" style="height: 10px"></span></div>';
	document.getElementsByClassName("maincell")[0].insertBefore(newElem, document.getElementsByClassName("maincell")[0].getElementsByTagName("div")[0]);
	document.getElementById('header_info')?.remove();
	document.getElementById('questlog')?.remove();
	
	//Table
	var x=document.getElementById("production_table").rows;
	var lastCell = x[0].cells.length;
	for (i=0;i<x.length;i++){
		var reqMerch = x[i].insertCell(lastCell);
		var uploadRatio = x[i].insertCell(1);
		var nyersRatio = x[i].insertCell(1);
		var szektor = x[i].insertCell(1);
		if (i==0) {
			reqMerch.setAttribute("id", "dealer_reqMerch");
			reqMerch.setAttribute('style', 'text-align:center');
			reqMerch.innerHTML = 'Szükséges kereskedők <a href="javascript:updateAllKereskedo()">U</a>';
			szektor.setAttribute("id", "dealer_szektor");
			szektor.setAttribute('style', 'text-align:center');
			szektor.innerHTML = '<a href=\'javascript: rendez(true,"", "dealer_szektor");\'>Szektor</a><br><a href="javascript:dealer_onSectorSet()">[Beállít]</a>';
			uploadRatio.setAttribute("id", "dealer_uploadratio");
			uploadRatio.setAttribute('style', 'text-align: center');
			uploadRatio.innerHTML = 'Össz-nyers arány<br><a href="javascript:setNyersRatio()">[Beállít]</a>';
			nyersRatio.setAttribute("id", "dealer_ratio");
			nyersRatio.setAttribute('style', 'text-align:center');
			nyersRatio.innerHTML = 'Nyersanyag arányok<br>\
				<a href="javascript:setRatio(\'Balance\')">[Balance]</a>\
				<a href="javascript:setRatio(\'Attack\')">[Támadó]</a>\
				<a href="javascript:setRatio(\'Coin\')">[Érmés]</a>\
				<a href="javascript:setRatio(\'Custom\')">[Egyéni]</a>';
		} else {
			szektor.innerHTML = '1';
			reqMerch.setAttribute('class', 'cnc_toolTip cnc_toolTip_right');
			reqMerch.innerHTML = 'N/A';
			uploadRatio.innerHTML = '<span class="icon header ressources"></span><input value="50" size="6">';
			nyersRatio.innerHTML = '<span class="res wood"></span><input value="50" size="6">\
				<span class="res stone"></span><input value="50" size="6">\
				<span class="res iron"></span><input value="50" size="6">';
		}
	}
	
	if (confirm("Szeretnéd, hogy a script gyors-felderítést alkalmazzon?\n\nA gyorsfelderítés eredményeként faluid nem lesznek átnézve, hanem feltételezve lesz hogy az ott lévő nyersanyag annyi, amennyi az áttekintés nézeten szerepel.")) {
		dealerFastExplore();
	} else {
		alert("Nem elérhető");
		dealerFastExplore();
	}
	
	document.title="Dealer";
	document.getElementById("linkContainer").innerHTML='<p align="center" style="line-height: 22px"><strong><a style="color: blue" href="https://github.com/cncDAni2/klanhaboru/tree/main/minified_scripts" target="_BLANK">c&c Műhely</a> -- DEALER -- Version '+DEALER_VERSION+'</strong></p>';
	
	initSzektor();
}
function initSzektor(egyeni) {
	var x=document.getElementById("production_table").rows;
	var szektors = {
		pont: [],
		pv: [],
		sp: [],
		kp: [],
		minus: []
	};
	var szektorName;
	var faluCell = getOszlopNo("falunev");
	for (var i=1;i<x.length;i++) {
		szektorName = $.trim(x[i].cells[faluCell].getElementsByClassName("quickedit-label")[0].textContent);
		szektorName = szektorName.split(/ \([0-9]{1,3}\|[0-9]{1,3}\) K[0-9][0-9]/g)[0];
		if (szektorName.indexOf(".") > 0) szektors.pont.push(szektorName);
		if (szektorName.indexOf(";") > 0) szektors.pv.push(szektorName);
		if (szektorName.indexOf(" ") > 0) szektors.sp.push(szektorName);
		if (szektorName.indexOf(":") > 0) szektors.kp.push(szektorName);
		if (szektorName.indexOf("-") > 0) szektors.minus.push(szektorName);
	}
	
	var max = 'pont';
	if (szektors.pv.length > szektors[max].length) max='pv';
	if (szektors.sp.length > szektors[max].length) max='sp';
	if (szektors.kp.length > szektors[max].length) max='kp';
	if (szektors.minus.length > szektors[max].length) max='minus';
	if (szektors[max].length < 10) return "Cannot say or too low";
	/* Test: Szektorba szervezés. Mennyi menne? */
	var list = {};
	var jel = '';
	switch (max) {
		case 'pont': jel='.'; break;
		case 'pv': jel=';'; break;
		case 'sp': jel=' '; break;
		case 'kp': jel=':'; break;
		case 'minus': jel='-'; break;
	}
	var szektorId;
	for (var i=1;i<x.length;i++) {
		szektorName = $.trim(x[i].cells[faluCell].getElementsByClassName("quickedit-label")[0].textContent);
		szektorName = szektorName.split(/ \([0-9]{1,3}\|[0-9]{1,3}\) K[0-9][0-9]/g)[0];
		if (szektorName.indexOf(jel) > 0) {
			szektorId = szektorName.split(jel)[0];
			if (list[szektorId]) list[szektorId]++; else list[szektorId] = 1;
		}
	}
	console.info(list);
	/* Valódi szektorra bontás >3 falu csoport esetén*/
	var szektorCell = getOszlopNo('dealer_szektor');
	for (var i=1;i<x.length;i++) {
		szektorName = $.trim(x[i].cells[faluCell].getElementsByClassName("quickedit-label")[0].textContent);
		szektorName = szektorName.split(/ \([0-9]{1,3}\|[0-9]{1,3}\) K[0-9][0-9]/g)[0];
		if (szektorName.indexOf(jel) > 0) {
			szektorId = szektorName.split(jel)[0];
			if (list[szektorId] > 3) {
				x[i].cells[szektorCell].innerHTML = szektorId;
			}
		}
	}
}

function dealerFastExplore() {
	var x=document.getElementById("production_table").rows;
	var nyersCellId=getOszlopNo('nyers');
	var falunevCell=getOszlopNo('falunev');
	var M;
	var faluId;
	for (i=1;i<x.length;i++){
		M=x[i].cells[nyersCellId].textContent.replace(/\./g,"").match(/[0-9]+/g);
		x[i].cells[nyersCellId].innerHTML=M[0]+','+M[1]+','+M[2];
		faluId = x[i].cells[falunevCell].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=','');
		MERCH[faluId] = [true];
	}
}
function startStop() {
	if (!ISPLAY) {
		setUpTABS(true);
		document.getElementById("dealer_play").innerHTML = 'Script leállítása';
		document.getElementById("status").innerHTML = 'Állapot: A dealer jelenleg dolgozik faluid rendezettségén.';
	} else {
		ISPLAY = false;
		document.getElementById("dealer_play").innerHTML = 'Script indítása';
		document.getElementById("status").innerHTML = 'Állapot: A dealer jelenleg szünetel, folytatáshoz kattints a Script indítása gombra.';
	}
}

function setNyersRatio() {
	var customRatio = prompt('Adja meg a relatív nyersarányt a kiválasztott csoportnak');
	if (customRatio == null || customRatio == '') return;
	customRatio = parseInt(customRatio, 10);
	if (isNaN(customRatio)) return;
	
	var x=document.getElementById("production_table").rows;
	var urc = getOszlopNo('dealer_uploadratio');
	for (i=1;i<x.length;i++){
		if (x[i].style.display == 'none') continue;
		x[i].cells[urc].getElementsByTagName("input")[0].value = customRatio;
	}
}

function setRatio(type) {
	/*
		types: Balance Attack Coin Custom
	*/
	var selectedRatio = [];
	switch(type) {
		case 'Balance': selectedRatio = [50,50,50, 50]; break;
		case 'Attack': selectedRatio = [50,40,60, "A40-75"]; break;
		case 'Coin': selectedRatio = [39,42,35, 25]; break;
		case 'Custom': showRatioPopup(); return; break;
	}
	insertRatio(selectedRatio);
	
	function showRatioPopup() {
		displayMessage('Aránybeállítás', '<form id="dealer_setRatio">\
			Add meg milyen arányú falukat szeretnél látni a kiválasztott csoportban?<br>\
			<span class="res wood" style="width:20px; height:15px;display: inline-block"> </span><input value="50" size="3">\
			<span class="res stone" style="width:20px; height:15px;display: inline-block"> </span><input value="50" size="3">\
			<span class="res iron" style="width:20px; height:15px;display: inline-block"> </span><input value="50" size="3">\
			<br><button type="button" onclick="getRatio()">Beállít</button></form>')
	}
}

function getRatio(){
	var selectedRatio = [];
	var inputs = document.getElementById('dealer_setRatio').getElementsByTagName("input");
	selectedRatio = [parseInt(inputs[0].value), parseInt(inputs[1].value), parseInt(inputs[2].value)];
	if (!isNaN(selectedRatio[0]) && !isNaN(selectedRatio[1]) && !isNaN(selectedRatio[2])) {
		insertRatio(selectedRatio);
		displayMessage('disable', 'disable');
	} else {
		alert("Érvénytelen megadás. Számokat adj meg");
	}
}

function insertRatio(selectedRatio) {
	var x=document.getElementById("production_table").rows;
	var rc = getOszlopNo('dealer_ratio');
	var urc = getOszlopNo('dealer_uploadratio');
	var rakt, raktRatio;
	for (i=1;i<x.length;i++){
		if (x[i].style.display == 'none') continue;
		var inputs = x[i].cells[rc].getElementsByTagName("input");
		inputs[0].value = selectedRatio[0];
		inputs[1].value = selectedRatio[1];
		inputs[2].value = selectedRatio[2];
		if (selectedRatio[3]) {
			if (selectedRatio[3][0] == 'A') {
				rakt = [parseInt(selectedRatio[3].match(/[0-9]+/g)[0],10), parseInt(selectedRatio[3].match(/[0-9]+/g)[1],10)]; // 25-75 || 10-es: 5
				raktRatio = x[i].cells[getOszlopNo("tanya")].textContent.split('/');
				raktRatio = parseInt(raktRatio[1]) - parseInt(raktRatio[0]);
				raktRatio = rakt[0] + (Math.round(raktRatio / 1000)*((rakt[1]-rakt[0]) / 10));
				if (raktRatio > rakt[1]) raktRatio = rakt[1]; else raktRatio = Math.round(raktRatio);
				x[i].cells[urc].getElementsByTagName("input")[0].value = raktRatio;
			} else {
				x[i].cells[urc].getElementsByTagName("input")[0].value = selectedRatio[3];
			}
		}
	}
}
function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('bot_check') || ref.document.title=="Bot védelem") {
		displayMessage("Dealer: Bot védelem","Bot védelem aktív!<br>Idő: "+new Date());
		document.getElementById("audio1").volume=0.1;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1){
		displayMessage("Dealer probléma","Kijelentkezett fiók. Jelentkezzen be újra, vagy állítsa le a programot.");
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
	return false;
}catch(e){return false;}}
function BotvedelemBe(){try{
	console.info("BOT");
	BOT_VOL+=0.2;
	if (BOT_VOL>1.0) BOT_VOL=1.0;
	soundVolume(BOT_VOL);
	playSound("bot2");
	BOT=true;
	displayMessage("Dealer: Bot védelem", 'Bot védelem aktív!<br><a href="javascript: BotvedelemKi()" style="color: white">&gt;&gt; Kattints ide, ha beírtad a kódot és minden mehet tovább!</a><br>Idő: '+new Date()); /*FIXME: Ne ide írd hanem a belső logba*/
	}catch(e){displayMessage('Dealer hiba#botVedelem', e);}
	BOTORA=setTimeout("BotvedelemBe()",2000);
}
function BotvedelemKi(){
	BOT=false; BOT_VOL=0.0;
	document.getElementById("audio1").pause;
	displayMessage('disable', 'disable');
	clearTimeout(BOTORA);
	for (var i=0;i<TABS.length;i++) {
		try{TABS[i].ref.close();}catch(e){}
	}
}
function soundVolume(vol){
	document.getElementById("audio1").volume=vol;
}
function playSound(hang){try{
	var play="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+hang+".wav";	
	document.getElementById("wavhang").src=play;
	document.getElementById("audio1").load();
	document.getElementById("audio1").play();
}catch(e){display(e);}}

function setUpTABS(isStart){
	for (var i=0;i<TABS.length;i++) {try{
		if (TABS[i] && TABS[i].timer) clearTimeout(TABS[i].timer);
		TABS[i].ref.close();
		TABS[i].munka = 0;
	}catch(e){}}
	
	var szektorNames = [];
	var szektorName = '';
	var x=document.getElementById("production_table").rows;
	var szektorCell=getOszlopNo('dealer_szektor');
	for (var i=1;i<x.length;i++) {
		szektorName= x[i].cells[szektorCell].textContent.toUpperCase();
		if (szektorName=='X' || szektorNames.indexOf(szektorName) > -1) {
			continue;
		}
		szektorNames.push(szektorName);
	}
	if (isStart === true) ISPLAY = true;
	if (ISPLAY == false) return;
	TABS = [];
	for (var i=0;i<szektorNames.length;i++) {
		if (TABS[i] && TABS[i].timer) clearTimeout(TABS[i].timer);
		TABS[i] = {
			ref: null,
			munka: 1,
			timer: null,
			szektor: szektorNames[i],
			param: null
		};
		dealer_main(i);
	}
}
function szumNyersSzint(sor) {
	var x=document.getElementById("production_table").rows;
	var ossznyers = [0,0,0]; // Szektor nyersátlagja [fa, agyag, vas]
	var ratios = [0,0,0,0]; // Szektor átlagos nyersanyaránya [fa, agyag, vas, össz]
	var szektorCell=getOszlopNo('dealer_szektor');
	var nyersCell=getOszlopNo('nyers');
	var ratioCell=getOszlopNo('dealer_ratio');
	var uploadratioCell=getOszlopNo('dealer_uploadratio');
	var falunyers, falurationyers;
	var faluk = 0;
	var szektor = x[sor].cells[szektorCell].textContent.toUpperCase();
	
	for (var i=1;i<x.length;i++) {
		//if (x[i].cells[szektorCell].textContent.toUpperCase()=='X') continue;
		if (x[i].cells[szektorCell].textContent.toUpperCase()==szektor) {
			faluk++;
			falunyers = x[i].cells[nyersCell].textContent.match(/[0-9]+/g);
			falurationyers = x[i].cells[ratioCell].getElementsByTagName('input');
			ossznyers[0]+=parseInt(falunyers[0],10);
			ossznyers[1]+=parseInt(falunyers[1],10);
			ossznyers[2]+=parseInt(falunyers[2],10);
			ratios[0]+=parseInt(falurationyers[0].value,10);
			ratios[1]+=parseInt(falurationyers[1].value,10);
			ratios[2]+=parseInt(falurationyers[2].value,10);
			ratios[3]+=parseInt(x[i].cells[uploadratioCell].getElementsByTagName('input')[0].value,10);
		}
	}
	ratios[0] = ratios[0] / faluk; ratios[1] = ratios[1] / faluk; ratios[2] = ratios[2] / faluk; ratios[3] = ratios[3] / faluk;
	ossznyers[0] = ossznyers[0] / faluk; ossznyers[1] = ossznyers[1] / faluk; ossznyers[2] = ossznyers[2] / faluk; ossznyers[3] = ossznyers[3] / faluk;
	
	var nyersarany = x[sor].cells[ratioCell].getElementsByTagName("input"); //Jelenlegi vizsgált falu arányai [fa, agyag, vas, össz]
	nyersarany = [parseInt(nyersarany[0].value,10), parseInt(nyersarany[1].value,10), parseInt(nyersarany[2].value,10)];
	nyersarany[3] = parseInt(x[sor].cells[uploadratioCell].getElementsByTagName("input")[0].value,10);
	
	var expectedNyers = [
		Math.round((nyersarany[0] / ratios[0]) * (nyersarany[3] / ratios[3]) * ossznyers[0]),
		Math.round((nyersarany[1] / ratios[1]) * (nyersarany[3] / ratios[3]) * ossznyers[1]),
		Math.round((nyersarany[2] / ratios[2]) * (nyersarany[3] / ratios[3]) * ossznyers[2]),
	];
	var raktar = parseInt(x[sor].cells[getOszlopNo("raktar")].textContent,10);
	var isFull = false;
	raktar*=0.95;
	if (expectedNyers[0] > raktar) {expectedNyers[0]=raktar; isFull=true;}
	if (expectedNyers[1] > raktar) {expectedNyers[1]=raktar; isFull=true;}
	if (expectedNyers[2] > raktar) {expectedNyers[2]=raktar; isFull=true;}
	
	if (isFull) {
		x[sor].cells[ratioCell].setAttribute("style", "background: red !important")
		x[sor].cells[getOszlopNo('dealer_reqMerch')].setAttribute("style", "background: red !important");
	} else {
		x[sor].cells[ratioCell].style.background="";
		x[sor].cells[getOszlopNo('dealer_reqMerch')].style.background="";
	}
	falunyers = x[sor].cells[nyersCell].textContent.match(/[0-9]+/g);
	var needNyers = [ 
		expectedNyers[0] - parseInt(falunyers[0],10),
		expectedNyers[1] - parseInt(falunyers[1],10),
		expectedNyers[2] - parseInt(falunyers[2],10)
	]
	TESTARR[0]+=needNyers[0];
	TESTARR[1]+=needNyers[1];
	TESTARR[2]+=needNyers[2];
	updateKereskedo(sor, needNyers, expectedNyers);
	
	return {
		expected: expectedNyers,
		need: needNyers /* pozitív: szükség; negatív: felesleg */
	};
	
	function updateKereskedo(sor, needNyers, expected) {
		var kereskedo = Math.round(Math.abs(needNyers[0]) / 1000) + Math.round(Math.abs(needNyers[1]) / 1000) + Math.round(Math.abs(needNyers[2]) / 1000);
		var elorejelzo=document.createElement("span");
		elorejelzo.setAttribute('class', 'cnc_toolTipText');
		elorejelzo.innerHTML = 'Elvárt szint:<br>\
			<span class="res wood"></span> '+expected[0]+'\
			<span class="res stone"></span> '+expected[1]+'\
			<span class="res iron"></span> '+expected[2]+'<br><br>\
			Szükséges nyers:<br>\
			<span class="res wood"></span> '+(needNyers[0]<THRESHOLD?needNyers[0]:'<font color="#ff8080">'+needNyers[0]+'</font>')+'\
			<span class="res stone"></span> '+(needNyers[1]<THRESHOLD?needNyers[1]:'<font color="#ff8080">'+needNyers[1]+'</font>')+'\
			<span class="res iron"></span> '+(needNyers[2]<THRESHOLD?needNyers[2]:'<font color="#ff8080">'+needNyers[2]+'</font>');
		document.getElementById("production_table").rows[sor].cells[getOszlopNo('dealer_reqMerch')].innerHTML = kereskedo;
		document.getElementById("production_table").rows[sor].cells[getOszlopNo('dealer_reqMerch')].appendChild(elorejelzo);
	}
}

TESTARR = [0,0,0]; //FIXME: Legyen, csak ne így - localba toljuk!
function updateAllKereskedo() {
	TESTARR = [0,0,0]
	var x = document.getElementById("production_table").rows;
	for (var i=1;i<x.length;i++) {
		szumNyersSzint(i);
	}
}
function getOpenedVillage(refindex) {try{
	var x=document.getElementById("production_table").rows;
	var szektorAvg, nyersarany;
	var szektorCell=getOszlopNo('dealer_szektor');
	var nyersCell=getOszlopNo('nyers');
	var ratioCell=getOszlopNo('dealer_ratio');
	var uploadratioCell=getOszlopNo('dealer_uploadratio');
	var elvartNyers = []; /*fa, agyag, vas*/
	var falunevCell = getOszlopNo('falunev');
	var faluId;
	var hit = false; /*Visszatérési érték. Volt e megnyitandó falu? */
	// FIXME: A legnagyobb fölöslegű falut keresse ki, ne sorba!!! Ezt a számítást be kéne gyorsítótárazni is, ne számolja mindig... Refresh-kor és nagy eltérés esetén törlődne, amúgymeg faluId: felesleg,felesleg,felesleg - nyersküldés után ezt a falut update-elni ebbe a tárba is!
	for (var i=1;i<x.length;i++) {
		if (x[i].cells[szektorCell].textContent.toUpperCase() == 'X') continue;
		if (x[i].cells[szektorCell].textContent.toUpperCase() !== TABS[refindex].szektor.toUpperCase()) continue;
		elvartNyers = szumNyersSzint(i);
		if (elvartNyers.need[0] < -THRESHOLD || elvartNyers.need[1] < -THRESHOLD || elvartNyers.need[2] < -THRESHOLD)  {
			/*Van felesleg*/
			console.info("Van felesleg TH felett itt:", x[i].cells[falunevCell].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=',''));
			faluId = x[i].cells[falunevCell].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=','');
			if (isKereskedo(faluId) && kellEz(elvartNyers.need, TABS[refindex].szektor)) {
				/*Van kereskedő is és kelleni fog valakinek => All OK, falu nyit*/
				var window_name="dealer"+refindex;
				if (window.name !== "") window_name="dealer2"+refindex;
				TABS[refindex].ref = window.open(x[i].cells[falunevCell].getElementsByTagName("a")[0].href.replace("screen=overview", "&screen=market&mode=send"), window_name);
				hit = true;
				TABS[refindex].param = elvartNyers;
				TABS[refindex].param.faluId = x[i].cells[falunevCell].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=', '');
				var faluCoord = x[i].cells[falunevCell].getElementsByTagName("a")[0].textContent.match(/[0-9]{1,3}\|[0-9]{1,3}/g);
				TABS[refindex].param.faluCoord = faluCoord[faluCoord.length-1];
				console.info('Megnyitott falu:', TABS[refindex].param.faluCoord);
				TABS[refindex].munka = 2;
				break;
			}
		}
		/* FEAUTURE-description: legyen egy fg., amit meghívok egy sor-számmal, és visszaadja hogy {expected: [fa,vas,agyag] -- elvárt nyersanyagszint, need: [fa, vas, agyag] -- ennyi kell még oda (mínusz-plusz)} */
		
	}
	return hit;
	
	function isKereskedo(faluId) {
		var th = Math.round(THRESHOLD / 1000);
		var isSzabad = MERCH[faluId][0];
		var isHit = false;
		var now = new Date();
		var vizsga;
		for (var k=1;k<MERCH[faluId].length;k++) {
			if (MERCH[faluId][k] instanceof Date) {
				if (now > MERCH[faluId][k]) {
					isHit = true;
					MERCH[faluId].splice(k, 1);
				}
			} else MERCH[faluId].splice(k, 1);
		}
		MERCH[faluId][0] = isHit || isSzabad;
		return MERCH[faluId][0];
	}
}catch(e){console.error('Hiba:getOpenedVillage', e)}}

function kellEz(nyers, szektor) {
	var x=document.getElementById("production_table").rows;
	var szektorCell=getOszlopNo('dealer_szektor');
	var nyersCell=getOszlopNo('nyers');
	var actReq;
	
	for (var i=1;i<x.length;i++) {
		if (x[i].cells[szektorCell].textContent.toUpperCase() == szektor) {
			actReq = szumNyersSzint(i);
			if ((nyers[0] < -THRESHOLD && actReq.need[0] > THRESHOLD) ||
				(nyers[1] < -THRESHOLD && actReq.need[1] > THRESHOLD) ||
				(nyers[2] < -THRESHOLD && actReq.need[2] > THRESHOLD)) {
				return true;
			}
		}
	}
	console.info('Nem kell: ', nyers, szektor);
	return false;
}
function sendNyersWhereItNeeds(refindex){try{
	var sortedVillages = createDistanceArray(); /*Format: [[Koord, távolság, sorIndex],...]*/
	var debugInfo = {};
	/* Nyersegyeztetés */
	var nyerstoUpdate = getNyersFromVillage(TABS[refindex].ref);
	var nyersOriginal = document.getElementById("production_table").rows[getRowIndex(TABS[refindex].param.faluCoord)].cells[getOszlopNo("nyers")];
	if (Math.abs(nyersOriginal.innerHTML.split(",")[0] - nyerstoUpdate[0]) > TABS[refindex].ref.game_data.village.wood_prod * 3600 * 3 ||
	    Math.abs(nyersOriginal.innerHTML.split(",")[1] - nyerstoUpdate[1]) > TABS[refindex].ref.game_data.village.stone_prod * 3600 * 3 ||
		Math.abs(nyersOriginal.innerHTML.split(",")[2] - nyerstoUpdate[2]) > TABS[refindex].ref.game_data.village.iron_prod * 3600 * 3) {
			console.info('Túl nagy nyerskülönbség, refreshing',TABS[refindex].param.faluCoord);
			TABS[refindex].munka=1;
			TABS[refindex].param = {};
			nyersOriginal.innerHTML = nyerstoUpdate.join(",");
			return;
		}
	nyersOriginal.innerHTML = nyerstoUpdate.join(",");
	
	/* Iterálás & hiány keresése */
	var nyers, hit, kuldendoNyers, targetVillage;
	var elerhetoKereskedo = parseInt(TABS[refindex].ref.document.getElementById("market_merchant_available_count").textContent);
	if (elerhetoKereskedo < 1) { /* FIXME: Ilyenkor meg kéne nézni hogy mikorra lesznek kereskedők! Most 10p-et vár és újranézi */
		var d = new Date();
		d.setMinutes(d.getMinutes()+10);
		MERCH[TABS[refindex].param.faluId][0] = false;
		MERCH[TABS[refindex].param.faluId].push(d);
		TABS[refindex].munka = 1;
		return;
	}
	for (var i=0;i<sortedVillages.length;i++) {
		kuldendoNyers = [0,0,0];
		hit = false;
		targetVillage = sortedVillages[i];
		nyers = szumNyersSzint(targetVillage[2]);
		debugInfo.targetVillInfo = [targetVillage[0], targetVillage[2], nyers];
		nyers = nyers.need;
		// FIXME: A legnagyobb fölöslegű nyerset küldje ki
		for (var j=0;j<3;j++) {
			if (nyers[j] > THRESHOLD && TABS[refindex].param.need[j] < -1000) {
				//Van nyersem ebből a fajtából felesleges, neki meg kell!
				console.log(targetVillage,'-nek kell ennyi:',nyers,'. Nekem van:', TABS[refindex].param.need);
				hit = true;
				if (nyers[j] > Math.abs(TABS[refindex].param.need[j])) {
					kuldendoNyers[j] = Math.abs(TABS[refindex].param.need[j]);
				} else {
					kuldendoNyers[j] = nyers[j];
				}
				kuldendoNyers[j] = Math.round(kuldendoNyers[j]/1000)*1000;
				console.info(j, 'ok, megy belőle', kuldendoNyers[j], 'all:', kuldendoNyers);
			}
		}
		if (hit) break;
	}
	if (!hit) {
		displayMessage('INFO, END', "INFO::A "+TABS[refindex].szektor+" szektor rendezett!");
	}
	
	/* Küldendő nyers csonkítása, elérhető kereskedők limitációja miatt */
	var szumKereskedo = 0;
	var helper;
	var tilt = false;
	for (var i=0;i<3;i++) {
		if (tilt) {kuldendoNyers[i]=0; continue;}
		helper = kuldendoNyers[i]/1000;
		if (szumKereskedo + helper > elerhetoKereskedo) {
			tilt = true;
			MERCH[TABS[refindex].param.faluId][0] = false; /*Nincs több kereskedő*/
			kuldendoNyers[i] = (elerhetoKereskedo-szumKereskedo) * 1000;
		}
		szumKereskedo += helper;
	}
	
	/* Beillesztés, küldés */
	console.info('Ide küldök, ennyit: ', targetVillage[0], kuldendoNyers);
	TABS[refindex].ref.document.forms['market'].wood.value = kuldendoNyers[0];
	TABS[refindex].ref.document.forms['market'].stone.value = kuldendoNyers[1];
	TABS[refindex].ref.document.forms['market'].iron.value = kuldendoNyers[2];
	TABS[refindex].ref.document.forms['market'].x.value = targetVillage[0].split("|")[0];
	TABS[refindex].ref.document.forms['market'].y.value = targetVillage[0].split("|")[1];
	TABS[refindex].ref.document.forms['market'].input.value = targetVillage[0];
	TABS[refindex].ref.$('#delivery_target input[type=submit]')[0].click();
	TABS[refindex].munka = 3;
	TABS[refindex].param.kuldottNyers = [kuldendoNyers[0], kuldendoNyers[1], kuldendoNyers[2]];
	TABS[refindex].param.targetVillage = targetVillage[0];
	
	debugInfo.sourceVillinfo = [TABS[refindex].param.faluCoord, szumNyersSzint(getRowIndex(TABS[refindex].param.faluCoord))];
	console.info(debugInfo);
	if ((kuldendoNyers[0] !== 0 && Math.round(debugInfo.targetVillInfo[2].need[0]/1000)*1000 < kuldendoNyers[0]) ||
		(kuldendoNyers[1] !== 0 && Math.round(debugInfo.targetVillInfo[2].need[1]/1000)*1000 < kuldendoNyers[1]) ||
		(kuldendoNyers[2] !== 0 && Math.round(debugInfo.targetVillInfo[2].need[2]/1000)*1000 < kuldendoNyers[2]) ||
		(kuldendoNyers[0] !== 0 && Math.round(debugInfo.sourceVillinfo[1].need[0]/1000)*1000 > (kuldendoNyers[0]*-1)) ||
		(kuldendoNyers[1] !== 0 && Math.round(debugInfo.sourceVillinfo[1].need[1]/1000)*1000 > (kuldendoNyers[1]*-1)) ||
		(kuldendoNyers[2] !== 0 && Math.round(debugInfo.sourceVillinfo[1].need[2]/1000)*1000 > (kuldendoNyers[2]*-1))) {
			
			if (kuldendoNyers[0] !== 0 && debugInfo.targetVillInfo[2].need[0] < kuldendoNyers[0]) console.info('fa_T');
			if (kuldendoNyers[1] !== 0 && debugInfo.targetVillInfo[2].need[1] < kuldendoNyers[1]) console.info('a_T');
			if (kuldendoNyers[2] !== 0 && debugInfo.targetVillInfo[2].need[2] < kuldendoNyers[2]) console.info('v_T');
			if (kuldendoNyers[0] !== 0 && debugInfo.sourceVillinfo[1].need[0] > (kuldendoNyers[0]*-1)) console.info('fa_S');
			if (kuldendoNyers[1] !== 0 && debugInfo.sourceVillinfo[1].need[1] > (kuldendoNyers[1]*-1)) console.info('a_S');
			if (kuldendoNyers[2] !== 0 && debugInfo.sourceVillinfo[1].need[2] > (kuldendoNyers[2]*-1)) console.info('v_S');
			console.info('ERROR HAPPENED', debugInfo.targetVillInfo[2].need, debugInfo.sourceVillinfo[1].need, kuldendoNyers);
			alert('ERROR HAPPENED');
			startStop();
	}
	
	function createDistanceArray() {
		var result = [];
		var x=document.getElementById("production_table").rows;
		var szektorCell = getOszlopNo("dealer_szektor");
		var falunevCell = getOszlopNo("falunev");
		var currentCoord = TABS[refindex].ref.game_data.village.coord;
		var koord;
		for (var i=1;i<x.length;i++) {
			if (x[i].cells[szektorCell].textContent.toUpperCase() != TABS[refindex].szektor.toUpperCase()) continue;
			var koord = x[i].cells[falunevCell].textContent.match(/[0-9]{1,3}\|[0-9]{1,3}/g);
			koord = koord[koord.length-1];
			if (koord == currentCoord) continue;
			result.push([
				koord,
				distCalc(currentCoord.split("|"), koord.split("|")),
				i
			]);
		}
		result.sort(function(a, b) {
			return a[1] - b[1];
		});
		return result;
	}
}catch(e){console.error('Hiba:sendNyersWhereItNeeds', e)}}

function sendAndUpdateNyers(refindex) {try{
	/* Update MERCH array */
	var utIdo = TABS[refindex].ref.document.getElementById("market-confirm-form").getElementsByTagName("table")[0].rows[5].cells[1].textContent.split(":");
	utIdo = parseInt(parseInt(utIdo[0],10)*3600 + parseInt(utIdo[1],10)*60 + parseInt(utIdo[2],10),10);
	var date = new Date();
	date.setSeconds(date.getSeconds() + (utIdo*2) + 10);
	MERCH[TABS[refindex].param.faluId].push(date);
	
	/* Update table, param.kuldottNyers és targetVillage alapján */
	var rowIndex = getRowIndex(TABS[refindex].param.targetVillage);
	var actualNyers = document.getElementById("production_table").rows[rowIndex].cells[getOszlopNo('nyers')].textContent.replace(/\./g,'').match(/[0-9]+/g);
	actualNyers[0] = parseInt(actualNyers[0],10) + TABS[refindex].param.kuldottNyers[0];
	actualNyers[1] = parseInt(actualNyers[1],10) + TABS[refindex].param.kuldottNyers[1];
	actualNyers[2] = parseInt(actualNyers[2],10) + TABS[refindex].param.kuldottNyers[2];
	document.getElementById("production_table").rows[rowIndex].cells[getOszlopNo('nyers')].innerHTML = actualNyers.join(",");
	szumNyersSzint(rowIndex);
	
	rowIndex = getRowIndex(TABS[refindex].ref.game_data.village.coord);
	actualNyers = document.getElementById("production_table").rows[rowIndex].cells[getOszlopNo('nyers')].textContent.replace(/\./g,'').match(/[0-9]+/g);
	console.info('UpdateNyers:', TABS[refindex].ref.game_data.village.coord, actualNyers);
	actualNyers[0] = parseInt(actualNyers[0],10) - TABS[refindex].param.kuldottNyers[0];
	actualNyers[1] = parseInt(actualNyers[1],10) - TABS[refindex].param.kuldottNyers[1];
	actualNyers[2] = parseInt(actualNyers[2],10) - TABS[refindex].param.kuldottNyers[2];
	document.getElementById("production_table").rows[rowIndex].cells[getOszlopNo('nyers')].innerHTML = actualNyers.join(",");
	szumNyersSzint(rowIndex);
	console.info('UpdateNyers Kész, új érték:', document.getElementById("production_table").rows[rowIndex].cells[getOszlopNo('nyers')].innerHTML);
	
	TABS[refindex].ref.$("#market-confirm-form input[type=submit]").click();
	updateStatics(TABS[refindex].param.kuldottNyers);
	TABS[refindex].param = {};
	TABS[refindex].munka = 1;
}catch(e){console.error('Hiba:sendAndUpdateNyers', e)}}

function updateStatics(nyersPlusz) {
	var hely = document.getElementById("dealer_statics");
	var nyers = hely.textContent.replace(/\./g,"").match(/[0-9]+/g);
	if (nyers) {
		nyers[0] = parseInt(nyers[0],10) + nyersPlusz[0];
		nyers[1] = parseInt(nyers[1],10) + nyersPlusz[1];
		nyers[2] = parseInt(nyers[2],10) + nyersPlusz[2];
	} else nyers = nyersPlusz;
	hely.innerHTML = 'Küldött nyers összesen: \
		 <span class="res wood" style="width:20px; height:15px;display: inline-block"></span>'+prettyNumberPrint(nyers[0])+
		' <span class="res stone" style="width:20px; height:15px;display: inline-block"></span>'+prettyNumberPrint(nyers[1])+
		' <span class="res iron" style="width:20px; height:15px;display: inline-block"></span>'+prettyNumberPrint(nyers[2]);
}
function getRowIndex(coord) {
	var x = document.getElementById("production_table").rows;
	var coordi;
	var faluCell = getOszlopNo("falunev");
	for (var i=1;i<x.length;i++) {
		coordi = x[i].cells[faluCell].textContent.match(/[0-9]{1,3}\|[0-9]{1,3}/g);
		
		coordi = coordi[coordi.length-1];
		if (coordi == coord) return i;
	}
}

function dealer_main(refindex) {
	var nextTime = 500; try{
	var inga=100/((Math.random()*40)+80);
	nextTime = Math.round((250*TABS.length)+nextTime * inga); //FIXME: nem TABS.length-el kéne szorozni, hanem annyival, ahány AKTÍV lap van, azaz dolgozik...
	if (ISPLAY && !BOT) {
		console.info(refindex, ' Start to work - ', TABS[refindex]);
		if (TABS[refindex].closed || TABS[refindex].hiba > 7) TABS[refindex].munka = 1;
		switch (TABS[refindex].munka) {
			case 1: TABS[refindex].hiba = 0; if (!getOpenedVillage(refindex)) {nextTime*=60; console.info('Nincs melóm, pihenek', TABS[refindex].szektor)} break;
			case 2: if (isPageLoaded(TABS[refindex].ref, TABS[refindex].param.faluId, 'screen=market&mode=send')) {
				TABS[refindex].hiba = 0;
				sendNyersWhereItNeeds(refindex);
			} else TABS[refindex].hiba++; break;
			case 3: if (isPageLoaded(TABS[refindex].ref, TABS[refindex].param.faluId, 'try=confirm_send')) {
				TABS[refindex].hiba = 0;
				sendAndUpdateNyers(refindex);
			} else TABS[refindex].hiba++; break;
			case 10: break;
		}
	}
	}catch(e){console.error('Unknow error, catched in main:', e);}
	if (typeof TABS[refindex] == 'object') TABS[refindex].timer = setTimeout(function(){dealer_main(refindex)},nextTime);
}

dealer_convertView();
//FIXME: Nem nézi az auto szektor ha ugyanazok a falunevek, nincs elválasztás
//FIXME: Ha ugyanazt a lapot kéne megnyitni, ahol eddig voltam, ne töltse már újra... Ezt úgy kéne elérni hogy "...ha volt még kereskedő akkor..." - lehet új state is kéne. VIGYÁZZ: miután a legtöbb nyersfölöslegű nyitja, már mást akarna nyitni - ezt ne engedjük!
//FIXME: A catch ágakba vhogy resettelni kéne a dolgokat + logolni ha van az oldalon ilyen piros üzenet.
//FIXME: Túl gyors, időzítés állító logika kéne
//NOTE: NEM IGAZ: LEHET ILYEN! ÉS VAN IS MÁR LEKEZELÉS!? (80k feles, máshol 1-1k hiány 80 faluba) Megnyitja a falut, mert hogy van felesleg. Olyan nincs hogy nem tudja hova küldeni! Erre valami lekezelést tegyünk bele.
//FIXME: Csak a bent lévő resource-okkal kereskedjen
//Fixme: Update-kor az X szektort hagyja, legyen 0
//FIXME: Hiány > Threshold-500 (!! -500)
//ADDME: Egy kereskedő ikon a lehetőségeknél, megnyomva bejön egy 5 állapotú csúszka: 0/25/50/75/100 - avagy a kereskedőd hány %-át használja piacolásra. MAX. Alatta elérni kívánt arány, relatíve, alatta mutatja hogy az mennyi lesz a mostani állapotba 1 falura tekintve. Még alatta az árakat lehet megadni. pl. fa->vas [0.5] - mellé nyíllal: vas->fa [2] (1/arány, readonly). Külön ablakba menne párhuzamosan a piacolgatás.
//ADDME: Szektor kijelző, hogy hogy áll.
//FIXME: "Érvénytelen nyersnézet, vélhetőleg átalakított" <-- Miért nem számokat keres? Igen, gazdasági nézetbe x,x,x alakú, de... 
//CRITICAL-FIXME: Van olyan hogy KURVA sok vasat beküld, majd azt küldené tovább. WTF? Javaslat: Ne küldje át paramba a NEED nyerset, hanem számolja ki újra
//FIXME: Ismerje fel ha "blokkolt kérés" van az oldalon, ekkor refresh-elje az oldalt
//FIXME: Bot védelem KI esetén a munka-t állítsd át 1-re.
//ADDME: Gazdasági nézettel legyen teljesen kompatibilis! Legyen új mód, ahol a szükséges, ill elvárt nyersszintet látni
//ADDME: Szűrés szektorra lehetőség