/*Exp/imp: BE;faluID;faluID;KI;...;ÉRME;... - vizsgálatkor meg "ha =BE, akkor ez a be, addig amíg "KI" nem lesz.


IF PF, OPEN: https://hu80.klanhaboru.hu/game.php?village=12538&screen=overview_villages  >> &mode=prod&group=0 <<
Online/updated field delete, Object alapú*/
try { /*PF-Area*/
	if (typeof cURL=='undefined') setOszlopIds();
} catch (e) {
	alert(e);
}
var curr_width = $('#main_layout').width();
var oz = document.getElementById("production_table").getElementsByTagName("a");
for (var o = 0; o < oz.length; o++) {
	try {
		if (oz[o].href.indexOf("javascript") == -1) oz[o].setAttribute("target", "_BLANK");
	} catch (e) {}
}

var worker = createWorker(function(self){
	self.addEventListener("message", function(e) {
		setTimeout(() => { postMessage(e.data); }, e.data.time);
	}, false);
});
worker.onmessage = function(worker_message) {
	eloszto();
};
function createWorker(main){
	var blob = new Blob(
		["(" + main.toString() + ")(self)"],
		{type: "text/javascript"}
	);
	return new Worker(window.URL.createObjectURL(blob));
}

$("#contentContainer").prependTo("body");
$("body").children(":not(#contentContainer)").remove();
$("#ds_body").width((curr_width + 200) + 'px').css('margin','auto').css('background', '#363');
var ELEM=document.createElement("div");
ELEM.setAttribute('id', 'kotrogep-header');
ELEM.innerHTML = `<p align="center">
	<audio id="audio1" controls="controls" autoplay="autoplay"><source id="wavhang" src="" type="audio/wav"></audio><br>
	<img src="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/kotrogep/excavator.gif" height="221px"></p>
	<h1 align="center">KOTRÓGÉP</h1>
	<h4 align="center"><i>...és érmeverő</i></h4><br>
	<p style="padding-left:25px">
		Minimum nyers/falu:
		<img alt="Fa" title="Fa" src="graphic/holz.png"> <input type="text" id="fa_" size="5" value="50000">
		<img alt="Agyag" title="Agyag" src="graphic/lehm.png"> <input type="text" id="agyag_" size="5" value="50000">
		<img alt="Vas" title="Vas" src="graphic/eisen.png"> <input type="text" id="vas_" size="5" value="50000">
		&nbsp;&nbsp;&nbsp;Feltöltési mód? <input type="checkbox" onclick=set_balance()> <a onclick="javascript: alert(\'Az opció bepipálása után a BE oszlopba megjelölt falukat a script továbbra is feltölti nyersanyaggal, de ügyel arra, hogy ne léphesse túl a raktár kapacitását. Megfelelő pipálással egy jó balance hozható létre.\')">Mi ez?</a>
		&nbsp;&nbsp;&nbsp; Feltöltés a raktár kapacitásának <input type="text" size="2" id="maxup" value="80">%-áig.
		Max szállítási távolság: <input type="text" value="30" size="2" id="maxtav"> mező.
		<input id="rapid_value" size="2" value="10"> perc múlva nézem újra a falut, ha nem volt munkája.
	</p>
	<p id="newrowarea">
		<b>Új külső falu megadása:</b>
		Koordináta <input type="text" size="7">
		Kezdeti nyers
		<img alt="Fa" title="Fa" src="graphic/holz.png"> <input type="text" size="5" value="0">
		<img alt="Agyag" title="Agyag" src="graphic/lehm.png"> <input type="text" size="5" value="0">
		<img alt="Vas" title="Vas" src="graphic/eisen.png"> <input type="text" size="5" value="0">
		<input type="button" onclick=addNewRow() value="Felvisz">
		<input type="button" onclick=addMoreRow() value="Tömeges felvitel">
	</p>
	<p id="kot_uzi">
		<b>Üzenetek:</b>
	</p>`;
document.body.insertBefore(ELEM, document.body.firstChild);
ELEM = document.createElement("div");
ELEM.innerHTML += '<a href="https://github.com/cncDAni2/klanhaboru" target="_BLANK">c&cDAni2 GITHub</a><p id="db"></p>';
document.body.appendChild(ELEM);
ELEM = document.createElement("style");
ELEM.type = "text/css";
ELEM.innerHTML = `
	#kotrogep-header {
		background-image: linear-gradient(#FFF 0, #FFF 300px, #363);
		padding: 10px;
		border-radius: 10px;
	}
	#db {
		color: wheat;
	}
`;
document.head.appendChild(ELEM);
document.title = "A KOTRÓGÉP";
var tabla = document.getElementById("production_table");
for (i = 0; i < tabla.rows.length; i++) {
	cell = tabla.rows[i].insertCell(0);
	cell.setAttribute("width", "110px");
	if (i == 0) {
		cell.innerHTML = '<b>ÉRME</b> <img onclick=pipa(\'auto\',2); title="Azon faluk bepipálása, melyek tanyaszintje max, és betelt." src="' + pic("auto") + '"><img onclick=pipa(\'all\',2); title="Összes falu bepipálása." src="' + pic("all") + '"><img onclick=pipa(\'none\',2); title="Kiszedi a pipákat." src="' + pic("none") + '"><img onclick=pipa(\'clone\',2); title="Azok falukat pipálja be, amik a BE oszlopnál már be vannak." src="' + pic("clone") + '">';
		cell.style.backgroundColor = "#FF0";
	} else cell.innerHTML = '<input type="checkbox">';
	cell = tabla.rows[i].insertCell(0);
	cell.setAttribute("width", "70px");
	if (i == 0) {
		cell.innerHTML = '<b>KI</b> <img onclick=pipa(\'auto\',1); title="Azon faluk bepipálása, melyek tanyaszintje max, és betelt." src="' + pic("auto") + '"><img onclick=pipa(\'all\',1); title="Összes falu bepipálása." src="' + pic("all") + '"><img onclick=pipa(\'none\',1); title="Kiszedi a pipákat." src="' + pic("none") + '">';
		cell.style.backgroundColor = "#AAF";
	} else cell.innerHTML = '<input type="checkbox">';
	cell = tabla.rows[i].insertCell(0);
	cell.setAttribute("width", "90px");
	if (i == 0) {
		cell.innerHTML = '<b>BE</b> <img onclick=pipa(\'auto\',0); title="Azon faluk bepipálása, melyek tanyaszintje max, és betelt." src="' + pic("auto") + '"><img onclick=pipa(\'all\',0); title="Összes falu bepipálása." src="' + pic("all") + '"><img onclick=pipa(\'none\',0); title="Kiszedi a pipákat." src="' + pic("none") + '"><img onclick=pipa(\'clone\',0); title="Azok falukat pipálja be, amik az ÉRME oszlopnál már be vannak." src="' + pic("clone") + '">';
		cell.style.backgroundColor = "#AAF";
	} else cell.innerHTML = '<input type="checkbox">';
	cell = tabla.rows[i].insertCell(0);
	cell.setAttribute("width", "180px");
	if (i == 0) {
		cell.innerHTML = "<b>Online</b>";
		cell.style.backgroundColor = "#AAF";
	} else cell.innerHTML = 'Ismeretlen';
}

function getRapidValue() {
	console.info("RAPID:", Math.round(parseInt(document.getElementById("rapid_value").value.replace(/[^0-9]/g, "")) / 2));
	return Math.round(parseInt(document.getElementById("rapid_value").value.replace(/[^0-9]/g, "")) / 2);
}
function setOszlopIds(ref) {
	var X;
	if (ref)
		X = ref.document.getElementById("production_table").rows;
	else
		X = document.getElementById("production_table").rows;
	var regexpBase = {
		falunev: 'order=name',
		pont: 'order=points',
		nyers: /(wood)(.)*(stone)(.)*(iron)/g,
		raktar: 'order=storage',
		tanya: 'order=pop',
		kereskedo: 'order=trader_available'
	};
	var oszlop2Remove = [];
	
	for (var i=0;i<X[1].cells.length;i++) {
		var type = '';
		if (X[0].cells[i].getElementsByTagName('a').length > 0) {
			if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.falunev) > -1) type="falunev";
			else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.pont) > -1) type="pont";
			else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.raktar) > -1) type="raktar";
			else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.tanya) > -1) type="tanya";
			else if (X[0].cells[i].getElementsByTagName('a')[0].href.indexOf(regexpBase.kereskedo) > -1) type="kereskedo";
		}
		else if (X[1].cells[i].innerHTML.match(regexpBase.nyers)) type="nyers";
		
		if (type==='') oszlop2Remove.push(i); else X[0].cells[i].setAttribute('id', type);
	}
	toNonPF(oszlop2Remove);
	
	function toNonPF(oszlop2Remove) {try{
		for (var i=0;i<X.length;i++){
			for (var j=oszlop2Remove.length-1;j>-1;j--) {
				X[i].deleteCell(oszlop2Remove[j]);
			}
		}
	}catch(e){db('Hiba referencia oldal nézetének átalakítása során: ' + e)}}
}
function getOszlopNo(ezt, ref){ /*megkeresi hanyadik oszlopba van a keresett érték*/
	var tabla;
	if (ref) tabla=ref.document.getElementById("production_table").rows[0];
	else tabla=document.getElementById("production_table").rows[0];
	for (var i=0;i<tabla.cells.length;i++){
		if (tabla.cells[i].getAttribute("id")==ezt) return i;
	}
	return 0;
}
function db(str) {
	var cdate = new Date();
	document.getElementById("db").innerHTML += "<br>" + cdate.getHours() + ":" + cdate.getMinutes() + ":" + cdate.getSeconds() + " - " + ALLAPOT + " - " + A.document.readyState + ": " + str;
	return;
}
function addNewRow() {
	try {
		var Fshort = document.getElementById("newrowarea").getElementsByTagName("input");
		var koord = Fshort[0].value;
		Fshort[0].value = "";
		if (koord.search(/[0-9]+(\|)[0-9]+/) == -1) throw "Nincs megadva koordináta";
		Fshort[1].value = Fshort[1].value.replace(/[^0-9]/g, "");
		Fshort[2].value = Fshort[2].value.replace(/[^0-9]/g, "");
		Fshort[3].value = Fshort[3].value.replace(/[^0-9]/g, "");
		addNewRow2(koord, Fshort[1].value + "," + Fshort[2].value + "," + Fshort[3].value);
	} catch (e) {
		alert("Hiba felvitelkor:\n" + e);
	}
}
function addNewRow2(koord, ertek) {
	var newTable = document.getElementById("production_table");
	var newRow = newTable.insertRow(-1);
	var cell = newRow.insertCell(0);
	cell.innerHTML = 'Ismeretlen';
	var cell = newRow.insertCell(1);
	cell.innerHTML = '<input type="checkbox">';
	var cell = newRow.insertCell(2);
	cell.innerHTML = '<input type="checkbox" disabled>';
	var cell = newRow.insertCell(3);
	cell.innerHTML = '<input type="checkbox" disabled>';
	var cell = newRow.insertCell(4);
	cell.innerHTML = koord;
	var cell = newRow.insertCell(5);
	cell.innerHTML = '0';
	var cell = newRow.insertCell(6);
	cell.innerHTML = ertek;
	var cell = newRow.insertCell(7);
	cell.innerHTML = '400000';
	var cell = newRow.insertCell(8);
	cell.innerHTML = '100/100';
	return;
}
function addMoreRow() {
	try {
		var Fshort = document.getElementById("newrowarea").getElementsByTagName("input");
		var koord = Fshort[0].value;
		Fshort[0].value = "";
		if (koord.search(/[0-9]+(\|)[0-9]+/) == -1) throw "Nincs megadva koordináta";
		Fshort[1].value = Fshort[1].value.replace(/[^0-9]/g, "");
		Fshort[2].value = Fshort[2].value.replace(/[^0-9]/g, "");
		Fshort[3].value = Fshort[3].value.replace(/[^0-9]/g, "");
		var koordik = koord.match(/[0-9]+(\|)[0-9]+/g);
		for (var i = 0; i < koordik.length; i++) {
			addNewRow2(koordik[i], Fshort[1].value + "," + Fshort[2].value + "," + Fshort[3].value);
		}
	} catch (e) {
		alert(e)
	}
}
function wopen(webpage) {
	A = window.open(webpage, KOTROID);
	return;
}
function set_balance() { /*BE Auto: <20k nép; KI Auto: szokásos_full; ÉRME Diff: szokásos_full, de nem KI*/
	BALANCE = !BALANCE;
	if (BALANCE) {
		tabla.rows[0].cells[0].innerHTML = "<b>Options</b>";
		tabla.rows[0].cells[1].innerHTML = '<b>BE</b> <img onclick=pipa(\'auto\',0); title="Azon faluk bepipálása, melyek népességszáma 21500 alatti." src="' + pic("auto") + '"><img onclick=pipa(\'all\',0); title="Összes falu bepipálása." src="' + pic("all") + '"><img onclick=pipa(\'none\',0); title="Kiszedi a pipákat." src="' + pic("none") + '">';
		tabla.rows[0].cells[1].setAttribute("width", "73px");
		tabla.rows[0].cells[3].setAttribute("width", "83px");
		document.getElementsByTagName("img")[0].setAttribute("src", "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/kotrogep/excavator2.gif");
	} else {
		tabla.rows[0].cells[0].innerHTML = "<b>Options</b>";
		tabla.rows[0].cells[1].innerHTML = '<b>BE</b> <img onclick=pipa("auto",0); title="Azon faluk bepipálása, melyek tanyaszintje max, és betelt." src="' + pic("auto") + '"><img onclick=pipa("all",0);	title="Összes falu bepipálása." src="' + pic("all") + '"><img onclick=pipa("none",0); title="Kiszedi a pipákat." src="' + pic("none") + '"><img onclick=pipa(\'clone\',0); title="Azok falukat pipálja be, amik az ÉRME oszlopnál már be vannak." src="' + pic("clone") + '">';
		tabla.rows[0].cells[1].setAttribute("width", "84px");
		tabla.rows[0].cells[3].setAttribute("width", "115px");
		document.getElementsByTagName("img")[0].setAttribute("src", "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/kotrogep/excavator.gif");
	}
	return;
}
function pic(tipus) { /*all, auto, clone, none*/
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/kotrogep/kotro_" + tipus + ".png";
}
function pipa(tipus, oszlop) {
	try { /**/
		oszlop++;
		for (i = 1; i < tabla.rows.length; i++) {
			if (tabla.rows[i].style.display == "none") continue;
			if (tipus == "all") { tabla.rows[i].cells[oszlop].getElementsByTagName("input")[0].checked = true; continue;}
			if (tipus == "none") { tabla.rows[i].cells[oszlop].getElementsByTagName("input")[0].checked = false; continue;}
			tanya = tabla.rows[i].cells[getOszlopNo("tanya")].innerHTML.match(/[0-9]+/g);
			if (tipus == "auto") {
				if (BALANCE && oszlop == 1) {
					if (parseInt(tanya[0]) < 21000) {
						tabla.rows[i].cells[oszlop].getElementsByTagName("input")[0].checked = true;
					}
				} else {
					if (parseInt(tanya[0]) > 23500) {
						if (parseInt(tanya[1]) - parseInt(tanya[0]) <= 500) {
							if (oszlop == 1 && tabla.rows[i].cells[2].getElementsByTagName("input")[0].checked == true) continue;
							if (oszlop == 2 && tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked == true) continue;
							tabla.rows[i].cells[oszlop].getElementsByTagName("input")[0].checked = true;
						}
					}
				}
			}
			if (tipus == "clone") {
				if (oszlop == 1) {
					if (tabla.rows[i].cells[3].getElementsByTagName("input")[0].checked == true) tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked = true;
				}
				if (oszlop == 3) {
					if (tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked == true) tabla.rows[i].cells[3].getElementsByTagName("input")[0].checked = true;
				}
			}
		}
		return;
	} catch (e) {
		alert("Hiba pipáláskor: \n" + e);
	}
}
function botriado(bool) {
	if (!bool) {
		document.getElementsByTagName("h1")[0].innerHTML = '<a href="javascript:botriado(true);">---&gt; BOT VÉDELEM AKTÍV &lt;---</a>';
		document.getElementById("wavhang").src = "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/bot.wav";
		document.getElementById("audio1").load();
		document.getElementById("audio1").play();
		if (document.getElementById("audio1").volume < 0.2) document.getElementById("audio1").volume = 0.9;
		alma = setTimeout("botriado(false)", 10000);
	} else {
		clearTimeout(alma);
		document.getElementsByTagName("h1")[0].innerHTML = 'A KOTRÓGÉP';
		ALLAPOT = 0;
		PM1 = 0;
		PM2 = 0;
		PM3 = 0;
		PM4 = false;
		wopen(document.location.href);
		document.getElementById("audio1").pause();
		setTimeout(() => eloszto(), 2000);
	}
}
function nfrissit(sorsz, ures) {
	try {
		if (ures) extraido = new Array(0, 5, 0);
		else extraido = A.document.getElementById("content_value").getElementsByTagName("table")[0].rows[5].cells[1].innerHTML.match(/[0-9]+/g);
		if (extraido[1] != 0) {
			extraido[1] = (extraido[1] + "").replace(/^0*/g, "");
		}
		if (extraido[2] != 0) extraido[2] = (extraido[2] + "").replace(/^0*/g, "");
		var newdate = new Date();
		newdate.setHours(newdate.getHours() + (parseInt(extraido[0]) * 2));
		newdate.setMinutes(parseInt(newdate.getMinutes()) + (parseInt(extraido[1]) * 2) + 1);
		newdate.setSeconds(parseInt(newdate.getSeconds()) + (parseInt(extraido[2]) * 2));
		//tabla.rows[sorsz].cells[0].innerHTML = newdate.toLocaleString();
		let tenMin = new Date();
		tenMin.setMinutes(tenMin.getMinutes() + 10);
		tabla.rows[PM1].cells[0].innerHTML = tenMin;
		if (!ures) A.document.getElementById("content_value").getElementsByTagName("input")[0].click();
	} catch (e) {
		db("nFrissít hiba: " + e);
		ALLAPOT = 0;
	}
	ALLAPOT = 0;
	return;
}
function illeszt(X, Y) { /*Adott a weboldal, ahova be kell illeszteni. Adott hogy MIT. Feladat: mennyit, melyik FORM-ra és OK*/
	if (SIMULATION > 10) {
		db("illeszt() - Szimuláció általi hibamegállapítás - " + SIMULATION);
		SIMULATION = 0;
		ALLAPOT = 0;
		return;
	}
	try {
		var simulate = A.document.getElementById("content_value").getElementsByTagName("table")[1].rows[0].cells[1].getElementsByTagName("table")[0].innerHTML;
	} catch (e) {
		SIMULATION++;
		return;
	}
	SIMULATION = 0;
	try { /*Beírt minimum nyers érvényességének ellemőrzése*/
		JAV = document.getElementById("fa_");
		JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
		if (JAV.value == "") JAV.value = "0";
		JAV = document.getElementById("agyag_");
		JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
		if (JAV.value == "") JAV.value = "0";
		JAV = document.getElementById("vas_");
		JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
		if (JAV.value == "") JAV.value = "0";
		JAV = document.getElementById("maxtav");
		JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
		if (JAV.value == "") JAV.value = "30";
		kereskedok = A.document.getElementById("content_value").getElementsByTagName("table")[1].rows[0].cells[1].getElementsByTagName("table")[0].rows[0].cells[0];
		kereskedok = parseInt(kereskedok.innerHTML.match(/[0-9]+/g)[0]) * 1000;
		if (kereskedok < 3000) {
			ALLAPOT = 3;
			PM4 = true;
			return;
		}
		Fa = parseInt(A.document.getElementById("wood").innerHTML);
		Agyag = parseInt(A.document.getElementById("stone").innerHTML);
		Vas = parseInt(A.document.getElementById("iron").innerHTML);
		Fa = Fa - parseInt(document.getElementById("fa_").value);
		Agyag = Agyag - parseInt(document.getElementById("agyag_").value);
		Vas = Vas - parseInt(document.getElementById("vas_").value);
		if (Fa < 0) Fa = 0;
		if (Agyag < 0) Agyag = 0;
		if (Vas < 0) Vas = 0;
		if ((Fa + Agyag + Vas) < 3000) {
			ALLAPOT = 3;
			PM4 = true;
			return;
		}
		oszto = 3;
		AVG = Math.round(kereskedok / 3);
		Vari = new Array(false, false, false);
		Be = new Array(AVG, AVG, AVG);
		var maradek = 0;
		do {
			if (maradek > 0) {
				for (i = 0; i < 3; i++) {
					if (Vari[i] == false) Be[i] += Math.round(maradek / oszto);
				}
				maradek = 0;
			}
			if (Be[0] > Fa) {
				Vari[0] = true;
				maradek += Be[0] - Fa;
				Be[0] = Fa;
				oszto--;
			}
			if (Be[1] > Agyag) {
				Vari[1] = true;
				maradek += Be[1] - Agyag;
				Be[1] = Agyag;
				oszto--;
			}
			if (Be[2] > Vas) {
				Vari[2] = true;
				maradek += Be[2] - Vas;
				Be[2] = Vas;
				oszto--;
			}
		} while (maradek != 0);
		for (y = 0; y < Be.length; y++) {
			if (Be[y] == 0) Be[y] = 1;
		}
		A.document.forms["market"].wood.value = Be[0] - 1;
		A.document.forms["market"].stone.value = Be[1] - 1;
		A.document.forms["market"].iron.value = Be[2] - 1;
		A.document.forms["market"].x.value = X;
		A.document.forms["market"].y.value = Y;
		A.document.getElementById("delivery_target").getElementsByTagName("table")[0].rows[0].cells[1].getElementsByTagName("input")[0].click();
		ALLAPOT = 3;
		PM4 = false;
	} catch (e) {
		db("Illesztési hiba " + e);
		ALLAPOT = 0;
	}
}
function kuld(koord, TID) {
	try { /*Megkeresem a minE(rteket) és minK(oordinátáját) a BE (cells[1]) checked sorból koord távolságokat a koord-hez képest.*/
		var minE = 999;
		var minK = "0";
		var tabla = document.getElementById("production_table");
		Tkoord = koord.match(/[0-9]+/g);
		for (i = 1; i < tabla.rows.length; i++) {
			if (tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked == true) {
				AkoordS = tabla.rows[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
				Akoord = AkoordS[AkoordS.length - 1].match(/[0-9]+/g);
				tavolsag = Math.abs(Math.sqrt(Math.pow(Tkoord[0] - Akoord[0], 2) + Math.pow(Tkoord[1] - Akoord[1], 2)));
				if (tavolsag !== 0 && tavolsag < minE) {
					minE = tavolsag;
					minK = Akoord;
				}
			}
		}
		if (minK == "0") return; /*Megnyitom a PM-be kapott ID-jű falut, majd meghívom a beillesztő eljárást a minK[0] és [1] PM-el egy kis késleltetéssel*/
		URL = tabla.rows[1].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].href.replace("screen=overview", "screen=market&mode=send");
		URL = URL.replace(/village=[0-9]+/g, 'village='+TID);
		wopen(URL);
		PM1 = minK[0];
		PM2 = minK[1];
		ALLAPOT = 2;
	} catch (e) {
		db('küld() - ' + e);
		ALLAPOT = 0;
	}
	return;
}
function munka() {
	try {
		var CURRTIME = new Date();
		var tabla = document.getElementById("production_table");
		for (i = 1; i < tabla.rows.length; i++) {
			if (tabla.rows[i].cells[2].getElementsByTagName("input")[0].checked == true) {
				ID = tabla.rows[i].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=','');
				koordS = tabla.rows[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
				koord = koordS[koordS.length - 1];
				if (tabla.rows[i].cells[0].innerHTML == "Ismeretlen") {
					ALLAPOT = 1;
					PM1 = koord;
					PM2 = ID;
					PM3 = i;
					return;
				}
				online = new Date(tabla.rows[i].cells[0].innerHTML);
				if (online - CURRTIME < 0) {
					ALLAPOT = 1;
					PM1 = koord;
					PM2 = ID;
					PM3 = i;
					return;
				}
			}
		}
		if (ALLAPOT == 0) ERME = true;
	} catch (e) {
		db("munka() - " + e);
		ALLAPOT = 0;
	}
	return;
}
function open_attek() {
	try {
		if (A.document.location.href != document.location.href) wopen(document.location.href);
		ALLAPOT = 1;
		return;
	} catch (e) {
		db("áttekintés megnyitása - " + e);
	}
}
function open_academy() {
	try {
		setOszlopIds(A);
		ERME = false;
		ALLAPOT = 0;
		var table = A.document.getElementById("production_table");
		for (let i=1; i<tabla.rows.length; i++) {
			if (tabla.rows[i].cells[3].getElementsByTagName("input")[0].checked == true) {
				faluID = tabla.rows[i].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=','');
				for (var j = 1; j < table.rows.length; j++) {
					if (table.rows[j].cells[getOszlopNo("falunev", A)].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=','') == faluID) {
						M = table.rows[j].cells[getOszlopNo("nyers", A)].childNodes;
						fa = parseInt(M[0].innerHTML.replace(/[^0-9]+/g, ""));
						agyag = parseInt(M[2].innerHTML.replace(/[^0-9]+/g, ""));
						vas = parseInt(M[4].innerHTML.replace(/[^0-9]+/g, "")); /*db("Érme verésének vizsgálata itt: "+faluID+" - "+table.rows[j].cells[0].innerText+". Nyersszint: "+fa+", "+agyag+", "+vas);*/
						if ((fa > 28000) && (agyag > 30000) && (vas > 25000)) { /*db("Rendben van, itt verni kell");*/
							ALLAPOT = 2;
							ERME = true;
							PM1 = i;
							wopen(table.rows[j].cells[getOszlopNo("falunev", A)].getElementsByTagName("a")[0].getAttribute("href").replace("screen=overview", "screen=snob"));
						}
					}
				}
			}
		}
		return;
	} catch (e) {
		db("Akademy - " + e);
		wopen(document.location.href);
	}
}
function erme_veres() {
	if (SIMULATION > 10) {
		db("erme_veres() - Szimuláció által felderített hiba.");
		SIMULATION = 0;
		ALLAPOT = 0;
		return;
	}
	try {
		var simulate = A.document.getElementById("content_value").innerHTML;
	} catch (e) {
		SIMULATION++;
		return;
	}
	SIMULATION = 0;
	var VV = document.getElementById("production_table").rows[PM1].cells[3];
	if (A.document.readyState != "complete") {
		return;
	}
	try {
		if (A.document.location.href.indexOf('snob') == -1) {
			ALLAPOT = 0;
			return;
		}
		ALLAPOT = 0;
		var vane = false;
		var a = A.document.getElementById("content_value").getElementsByTagName("table");
		if (A.document.getElementById("content_value").innerHTML.length > 3000) {
			vane = true;
			if (parseInt(A.document.getElementById("stone").textContent) > 30000 && parseInt(A.document.getElementById("wood").textContent) > 28000 && parseInt(A.document.getElementById("iron").textContent) > 25000) {
				if (A.document.getElementById("coin_mint_fill_max")) {
					A.document.getElementById("coin_mint_fill_max").click();
				}
				if (A.$('input:submit').length>0) {
					A.$("input:submit")[0].click();
					document.getElementById("production_table").rows[PM1].cells[0].innerHTML = "Ismeretlen";
				}
				 else {/*a[a.length - 1].getElementsByTagName("a")[0].click();*/
					var b=A.$("a.btn"); b[b.length-1].click();
				 }
				if (VV.innerText != "")(elem = VV.getElementsByTagName("b")[0]).parentNode.removeChild(elem);
			} else {
				ALLAPOT = 0;
				return;
			}
			ALLAPOT = 2;
		}
		if (!vane) {
			if (VV.innerText == "") {
				newB = document.createElement("b");
				newB.innerHTML = "1";
				VV.appendChild(newB);
			} else VV.getElementsByTagName("b")[0].innerHTML = parseInt(VV.getElementsByTagName("b")[0].innerHTML) + 1;
			if (VV.innerText == "4") {
				VV.getElementsByTagName("input")[0].checked = false;
				(elem = VV.getElementsByTagName("b")[0]).parentNode.removeChild(elem);
				pmkoord = document.getElementById("production_table").rows[PM1].cells[getOszlopNo("falunev")].innerHTML;
				document.getElementById("kot_uzi").innerHTML += "<br>Egyik érmeverésre jelölt faluban (" + pmkoord + ") nem lehet érmét verni akadémia hiánya miatt, ezért a továbbiakban nem nézem.";
				document.getElementById("wavhang").src = "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/kotrogep/SokNyers.wav";
				document.getElementById("audio1").load();
				document.getElementById("audio1").play();
			}
		} else {
			if (VV.innerText != "")(elem = VV.getElementsByTagName("b")[0]).parentNode.removeChild(elem);
		}
	} catch (e) {
		ALLAPOT = 0;
		db("Érmeverés - " + e);
	}
}
function balance_munka() {
	try {
		var CURRTIME = new Date();
		var vanebe = false;
		for (i = 1; i < tabla.rows.length; i++) { /*PM4=true ---> PM1=sor;megnyitja a piacot*/
			if (tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked == true) {
				tabla.rows[i].cells[2].getElementsByTagName("input")[0].checked = false;
				vanebe = true;
				if (tabla.rows[i].cells[2].getElementsByTagName("input")[0].disabled) {
					tabla.rows[i].cells[0].innerHTML = CURRTIME;
					continue;
				}
				koordS = tabla.rows[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
				koord = koordS[koordS.length - 1];
				URL = tabla.rows[i].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].href.replace("screen=overview", "screen=market&mode=transports");
				if (tabla.rows[i].cells[0].innerHTML == "Ismeretlen") {
					ALLAPOT = 1;
					PM1 = i;
					PM4 = true;
					wopen(URL);
					return;
				}
				online = new Date(tabla.rows[i].cells[0].innerHTML);
				if (online - CURRTIME < 0) {
					ALLAPOT = 1;
					PM1 = i;
					PM4 = true;
					wopen(URL);
					return;
				}
			}
		}
		if (!vanebe) {
			if (ALLAPOT == 0) ERME = true;
			return;
		}
		for (i = 1; i < tabla.rows.length; i++) { /*PM4=false esete ---> PM1=sor;PM2=koord;megnyitja a KI piacát*/
			if (tabla.rows[i].cells[2].getElementsByTagName("input")[0].checked == true) {
				tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked = false;
				ID = tabla.rows[i].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace('village=','');
				koordS = tabla.rows[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
				koord = koordS[koordS.length - 1];
				URL = tabla.rows[i].cells[getOszlopNo("falunev")].getElementsByTagName("a")[0].href.replace("screen=overview", "screen=market&mode=send");
				if (tabla.rows[i].cells[0].innerHTML == "Ismeretlen") {
					ALLAPOT = 1;
					PM1 = i;
					PM2 = koord;
					PM4 = false;
					wopen(URL);
					return;
				}
				online = new Date(tabla.rows[i].cells[0].innerHTML);
				if (online - CURRTIME < 0) {
					ALLAPOT = 1;
					PM1 = i;
					PM2 = koord;
					PM4 = false;
					wopen(URL);
					return;
				}
			}
		}
		if (ALLAPOT == 0) ERME = true;
	} catch (e) {
		db("balance_munka() - " + e);
	}
}
function balance_adatszedo() {
	try {
		debugger;
		if (PM4) { /*BE frissítése*/
			var allTable = A.document.getElementById("content_value").getElementsByTagName("table")[1].getElementsByTagName("table");
			var dok = allTable[allTable.length-1];
			if (dok.rows[0].cells.length !== 4) dok = allTable[allTable.length-2];
			console.info(dok);
			var vnyers = new Array(0, 0, 0);
			try{
				if (dok.rows[0].cells.length == 4) {
					dok = dok.rows;
					for (var i = 1; i < dok.length; i++) {
						var nyers = dok[i].cells[1].textContent.replace(/\./g, "");
						nyers = $.trim(nyers);
						nyers = nyers.match(/[0-9]+/g);
						var tipus = new Array(false, false, false);
						var t = 0;
						if (dok[i].cells[1].innerHTML.indexOf("wood") > 0) {
							tipus[0] = true;
							vnyers[0] += parseInt(nyers[t]);
							t++;
						}
						if (dok[i].cells[1].innerHTML.indexOf("stone") > 0) {
							tipus[1] = true;
							vnyers[1] += parseInt(nyers[t]);
							t++;
						}
						if (dok[i].cells[1].innerHTML.indexOf("iron") > 0) {
							tipus[2] = true;
							vnyers[2] += parseInt(nyers[t]);
							t++;
						} /*alert("Fa: "+vnyers[0]+"\nAgyag: "+vnyers[1]+"\nVas: "+vnyers[2]);*/
					}
				}
			}catch(e){vnyers = [0,0,0];} /*Ha nincs kereskedőmozgás*/
			vnyers[0] += parseInt(A.document.getElementById("wood").textContent);
			vnyers[1] += parseInt(A.document.getElementById("stone").textContent);
			vnyers[2] += parseInt(A.document.getElementById("iron").textContent);
			document.getElementById("production_table").rows[PM1].cells[getOszlopNo("nyers")].innerHTML = vnyers;
			var online = new Date();
			online.setMinutes(online.getMinutes() + 10); /*BALANCE: Felderítés után ennyi perccel nézi újra.*/
			document.getElementById("production_table").rows[PM1].cells[0].innerHTML = online;
			ALLAPOT = 0;
		} else { /*2-es állapotra léphet. PM3=online++ ideje (0, ha keresni kell) PM1=KI-érintett sor; (öröklött) PM2=BE-érintett sor, PM4=küldött nyers*/
			PM3 = 0;
			PM4 = new Array(0, 0, 0); /*Beírt minimum nyers érvényességének ellemőrzése*/
			JAV = document.getElementById("fa_");
			JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
			if (JAV.value == "") JAV.value = "0";
			JAV = document.getElementById("agyag_");
			JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
			if (JAV.value == "") JAV.value = "0";
			JAV = document.getElementById("vas_");
			JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
			if (JAV.value == "") JAV.value = "0";
			JAV = document.getElementById("maxtav");
			JAV.value = parseInt(JAV.value.replace(/[^0-9]/g, ""), 10);
			if (JAV.value == "") JAV.value = "30";
			kereskedok = A.document.getElementById("content_value").getElementsByTagName("table")[1].rows[0].cells[1].getElementsByTagName("table")[0].rows[0].cells[0];
			kereskedok = parseInt(kereskedok.innerHTML.match(/[0-9]+/g)[0]) * 1000;
			if (kereskedok < 8000) {
				ALLAPOT = 2;
				PM3 = 30;
				PM2 = 0;
				return;
			}
			Fa = parseInt(A.document.getElementById("wood").innerHTML);
			Agyag = parseInt(A.document.getElementById("stone").innerHTML);
			Vas = parseInt(A.document.getElementById("iron").innerHTML);
			Fa = Fa - parseInt(document.getElementById("fa_").value);
			Agyag = Agyag - parseInt(document.getElementById("agyag_").value);
			Vas = Vas - parseInt(document.getElementById("vas_").value);
			if (Fa < 0) Fa = 0;
			if (Agyag < 0) Agyag = 0;
			if (Vas < 0) Vas = 0;
			if ((Fa + Agyag + Vas) < 8000) {
				ALLAPOT = 2;
				PM3 = 45;
				PM2 = 0;
				return;
			}
			var elerheto = new Array(Fa, Agyag, Vas);
			for (var i = 0; i < 3; i++) elerheto[i] = parseInt(elerheto[i]); /*Rendezendő két tömb feltöltése: koordi és távolság*/
			var Rkordik = new Array();
			var Rtavok = new Array();
			var Rsorok = new Array();
			var tabla = document.getElementById("production_table");
			for (var i = 1; i < tabla.rows.length; i++) {
				if (tabla.rows[i].cells[1].getElementsByTagName("input")[0].checked == true) {
					koordS = tabla.rows[i].cells[getOszlopNo("falunev")].innerText.match(/[0-9]+(\|)[0-9]+/g);
					koord = koordS[koordS.length - 1];
					Rkordik.push(koord);
					Rsorok.push(i);
					Akoord = koord.split("|");
					Tkoord = PM2.split("|");
					var tav = Math.abs(Math.sqrt(Math.pow(Tkoord[0] - Akoord[0], 2) + Math.pow(Tkoord[1] - Akoord[1], 2)));
					Rtavok.push(tav);
				}
			} /*Rendezés, és közben szükségesség-vizsgálat*/
			/*db("--------------------------------");  		db("<b>"+PM2+"</b> Kereskedők: "+kereskedok+"; nyersanyag: "+elerheto);*/
			for (var C = 0; C < Rkordik.length; C++) {
				var min = C;
				for (var B = C; B < Rkordik.length; B++) { /*Legrövidebb megtalálása -> ha jó, küld; amúgy következő a sorba.*/
					if (Rtavok[min] > Rtavok[B]) min = B;
				}
				if (Rtavok[min] > parseInt(document.getElementById("maxtav").value)) break;
				seged = Rtavok[C];
				Rtavok[C] = Rtavok[min];
				Rtavok[min] = seged;
				seged = Rkordik[C];
				Rkordik[C] = Rkordik[min];
				Rkordik[min] = seged;
				seged = Rsorok[C];
				Rsorok[C] = Rsorok[min];
				Rsorok[min] = seged; /*HOVA: Rkordik[C]. Vizsgálat: Kell e neki?*/
				/*db("Vizsgál: "+Rkordik[C]);*/
				var szukseges = document.getElementById("production_table").rows[Rsorok[C]].cells[getOszlopNo("nyers")].innerHTML.split(",");
				for (var i = 0; i < 3; i++) szukseges[i] = parseInt(szukseges[i]);
				try {
					var maxup = parseInt(document.getElementById("maxup").value.match(/[0-9]+/g)[0]);
					document.getElementById("maxup").value = maxup;
				} catch (e) {
					document.getElementById("maxup").value = "80";
					var maxup = 80;
				}
				maxup = maxup / 100;
				var raktar = parseInt(document.getElementById("production_table").rows[Rsorok[C]].cells[getOszlopNo("raktar")].innerHTML);
				for (var i = 0; i < 3; i++) {
					szukseges[i] = Math.round(raktar * maxup) - szukseges[i];
					if (szukseges[i] < 0) szukseges[i] = 0;
				}
				var szum = Math.round(szukseges[0] + szukseges[1] + szukseges[2]);
				if ((szum < 5000) || (szum < Math.round(kereskedok * 0.25))) { /*db("-> Első bukás, mert a szükség "+szukseges);*/
					continue;
				} /*szukseges: ennyi nyers kéne, de tudok e küldeni, és mennyit?*/
				var segedT = new Array(true, true, true);
				var csere = 0;
				var maradek = 0;
				var maradek2 = 3;
				var kuldendo = new Array(Math.round(kereskedok / 3) - 1, Math.round(kereskedok / 3) - 1, Math.round(kereskedok / 3) - 1);
				for (var m = 0; m < 3; m++) {
					maradek = 0;
					for (var i = 0; i < 3; i++) {
						if ((segedT[i]) && ((szukseges[i] < kuldendo[i]) || (elerheto[i] < kuldendo[i]))) {
							segedT[i] = false;
							maradek2--;
							if (szukseges[i] < elerheto[i]) csere = szukseges[i];
							else csere = elerheto[i];
							maradek += kuldendo[i] - csere;
							kuldendo[i] = csere;
						}
					}
					if (maradek2 == 0) break;
					for (var i = 0; i < 3; i++) {
						if (segedT[i]) kuldendo[i] += Math.floor(maradek / maradek2);
					}
				}
				var szum = kuldendo[0] + kuldendo[1] + kuldendo[2];
				if ((szum < 5000) || (szum > kereskedok)) { /*db("-> Második bukás, mert a küldendő az "+kuldendo);*/
					continue;
				}
				A.document.forms["market"].wood.value = kuldendo[0];
				A.document.forms["market"].stone.value = kuldendo[1];
				A.document.forms["market"].iron.value = kuldendo[2];
				A.document.forms["market"].x.value = Rkordik[C].split("|")[0];
				A.document.forms["market"].y.value = Rkordik[C].split("|")[1];
				A.document.getElementById("delivery_target").getElementsByTagName("table")[0].rows[0].cells[1].getElementsByTagName("input")[0].click();
				/*A.document.forms["market"].getElementsByTagName("table")[0].rows[0].cells[1].getElementsByTagName("input")[2].click(); /*VAGY: 6. input*/
				PM2 = Rsorok[C];
				PM4 = kuldendo;
				ALLAPOT = 2;
				return;
			} /*db("Erre a falura nincs további szükség");*/
			/*Online: +30perc, és csak aztán lép ki (nincs hova küldenie)*/
			PM3 = getRapidValue(); /*WARN! x2 lesz, mert "oda-vissza"*/
			PM2 = 0;
			ALLAPOT = 2;
			return;
		}
		return;
	} catch (e) {
		db("balance_adatszedo() - " + e);
		ALLAPOT = 0;
	}
}
function balance_frissit() {
	try { /*PM1=KI érintett sora, PM2=BE érintett sora, PM3=idoplusz, PM4=nyers mennyiség*/
		if (A.document.getElementById("error")) {
			document.getElementById("kot_uzi").innerHTML += "<br><b>(!)</b>Hibaüzenet jött fel nyersküldéskor - " + PM2;
			PM3 = 30;
		}
		if (!A.document.getElementById("content_value")) {
			if (PROBA > 2) {
				ALLAPOT = 0;
				return;
			}
			PROBA++;
			return;
		}
		PROBA = 0;
		if (PM3 > 0) extraido = new Array(0, PM3, 0);
		else extraido = A.document.getElementById("content_value").getElementsByTagName("table")[0].rows[5].cells[1].innerHTML.match(/[0-9]+/g);
		if (extraido[1] != 0) {
			extraido[1] = (extraido[1] + "").replace(/^0*/g, "");
		}
		if (extraido[2] != 0) extraido[2] = (extraido[2] + "").replace(/^0*/g, "");
		var newdate = new Date();
		/* x2, mert oda-vissza idő*/
		newdate.setHours(newdate.getHours() + (parseInt(extraido[0]) * 2));
		newdate.setMinutes(parseInt(newdate.getMinutes()) + (parseInt(extraido[1]) * 2) + 1);
		newdate.setSeconds(parseInt(newdate.getSeconds()) + (parseInt(extraido[2]) * 2));
		//tabla.rows[PM1].cells[0].innerHTML = newdate;
		let tenMin = new Date();
		tenMin.setMinutes(tenMin.getMinutes() + 10);
		tabla.rows[PM1].cells[0].innerHTML = tenMin;
		if (PM2 == 0) {
			ALLAPOT = 0;
			return;
		}
		var addnyers = tabla.rows[PM2].cells[getOszlopNo("nyers")].innerHTML.split(",");
		for (var i = 0; i < 3; i++) {
			addnyers[i] = parseInt(addnyers[i]);
			addnyers[i] += PM4[i];
		}
		tabla.rows[PM2].cells[getOszlopNo("nyers")].innerHTML = addnyers;
		if (PM3 == 0) A.document.getElementById("content_value").getElementsByTagName("input")[0].click();
	} catch (e) {
		db("Frissít hiba: " + e);
		ALLAPOT = 0;
	}
	ALLAPOT = 0;
	return;
}
function eloszto() { /*Az elosztó figyeli a bot védelmet és a lap betöltődését is. Ha minden rendben, meghívja az aktiális intézkező fg.-t a paraméterekkel.*/
	try {
		AUTOUPDATE++;
		if (AUTOUPDATE > 300) {
			AUTOUPDATE = 0;
			wopen(document.location.href);
			worker.postMessage({'id': 'kotro', 'time': 500});
			return;
		}
		if (A.closed) {
			wopen(document.location.href);
			ALLAPOT = 0;
			worker.postMessage({'id': 'kotro', 'time': 500});
			return;
		}
		if (A.document.readyState != "complete") {
			worker.postMessage({'id': 'kotro', 'time': 500});
			return;
		}
		if (A.document.getElementById('bot_check') || A.document.getElementById('popup_box_bot_protection') || A.document.title == "Bot védelem") {
			var date = new Date();
			botriado(false);
			document.getElementById("kot_uzi").innerHTML += "<br>BOT RIADÓ! " + date;
			wopen(document.location.href);
			worker.postMessage({'id': 'kotro', 'time': 10000});
			return;
		}
		tabla = document.getElementById("production_table");
		if (!ERME) {
			if (BALANCE) {
				switch (ALLAPOT) {
				case 0:
					balance_munka();
					break; /*PM4 -> TRUE: a BE oszlop vizsgálata során frissítési szükséglet lépett fel; FALSE: KI-be megérkeztek a kereskedők; PM1->Melyik az érintett sor*/
				case 1:
					balance_adatszedo(PM1, PM4);
					break; /* TRUE: frissíti a falu nyersanyagszintjét a piaci oldalról;online: +2 óra;ALLAPOT=0; FALSE: Küldendő hely&mennyiség számítása, frissítése faluoldalt, illesztése, OKéz;PM2=true ha nem lehet küldeni, false ha lehet.*/
				case 2:
					balance_frissit(PM1, PM2);
					break; /*PM1. sor Online adatának frissítése. PM2=true esetén 20p-et adni rá, ellenben vizsgálni*/
				default:
					ALLAPOT = 0;
				}
			} else {
				switch (ALLAPOT) {
				case 0:
					munka();
					break; /*megnézi van e aktuális munka, azaz KI-hez online kereskedők vannak e?*/
				case 1:
					kuld(PM1, PM2);
					break; /*BE: KI koord,id-je. megkeresi az első Online KI-hez a legközelebbi BE falut, és megnyitja a KI piacát*/
				case 2:
					illeszt(PM1, PM2);
					break; /*BE: BE koord.-ja (x,y). Kiszámolja mennyi nyersanyagot tud elküldeni, amit beír a piacra és küld.*/
				case 3:
					nfrissit(PM3, PM4);
					break; /*be: KI sora a dok.-ban. A dokumentum Online sorát frissíti */
				default:
					ALLAPOT = 0;
				}
			}
		} else {
			switch (ALLAPOT) {
			case 0:
				open_attek();
				break; /*Áttekintés megnyitása*/
			case 1:
				open_academy();
				break; /*Vizsgálat, hol lehet érmét verni a pipált faluknál és megnyitja annak akadémiáját*/
			case 2:
				erme_veres();
				break; /*Érmét ver, ha van rá link (amíg el nem fogy a nyersanyag) --> ALLAPOT=0;ERME=false;*/
			default:
				ALLAPOT = 0;
				ERME = false;
			}
		}
	} catch (e) {
		try {
			db("eloszto -- " + e);
			wopen(document.location.href);
		} catch (e) {}
	}
	rand = (Math.floor(Math.random() * 500) + 500);
	worker.postMessage({'id': 'kotro', 'time': rand});
	//setTimeout(() => eloszto(), rand);
}
var ALLAPOT = 0;
var PM1 = 0;
var PM2 = 0;
var PM3 = 0;
var PM4 = false;
var ERME = false;
var AUTOUPDATE = 0;
var BALANCE = false;
var PROBA = 0;
var SIMULATION = 0;
var KOTROID = 'kotrogep' + new Date().getTime();
wopen(document.location.href);
document.getElementById("wavhang").src = "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/bot.wav";
document.getElementById("audio1").load();
document.getElementById("audio1").pause();
eloszto();
$("#production_table tbody tr td:first-child").dblclick(function () {
	this.innerHTML = "Ismeretlen";
});
void(0);