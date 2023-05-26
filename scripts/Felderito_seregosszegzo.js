javascript: var N = 5; /*Lapok száma*/
if (document.location.href.indexOf("screen=overview_villages") == -1) {
	alert("Ez a script az áttekintésben fut le csak.\n\nPrémiumosoknak először áttekintés átalakító futtatására van szükség a Termelői nézetbe!");
	exit(0);
}
try {
	RefArray = new Array(); /*Window pointers*/
	WAIT = new Array(); /*Mennyiszer próbáltuk sikertelenül elemezni (lapID~dbszám)*/
	FELDOLG = new Array(); /*Miket dolgozunk fel épp (lapID~FALUK tömb elemei)*/
	FALUK = new Array(); /*Munkalista*/
	init();
	var LAP = 0; /*Aktuális lapmunka*/
	var BASE_URL = document.location.href.split("game.php")[0] + "game.php";
	if (document.location.href.indexOf("t=") > 0) BASE_URL += "?" + document.location.href.match(/t=[0-9]+/g)[0] + "&";
	else BASE_URL += "?";
	var egysegnevek = new Array();
	var BOT = false;
	eloszto();
} catch (e) {
	alert("Indítási hiba:\n" + e);
}
function init() {
	try { /*tömb nullázások, N-ig*/
		try {
			for (var i = 0; i < N; i++) {
				WAIT[i] = 0;
				FELDOLG[i] = 0;
			}
			document.title = "Felderítő robot | Kiképzés: Seregek"; /*PF-átalakítás*/
			var PFA = document.getElementById("production_table");
			if (PFA.rows[0].cells.length > 6) {
				for (i = 0; i < PFA.rows.length; i++) {
					PFA.rows[i].deleteCell(9);
					PFA.rows[i].deleteCell(8);
					PFA.rows[i].deleteCell(7);
					PFA.rows[i].deleteCell(5);
					PFA.rows[i].deleteCell(0);
				}
			}
		} catch (e) {
			alert("PF -> Nem-PF konverziós hiba:\n" + e);
		} /*Faluk felvétele munkatömbbe*/
		for (var i = 1; i < PFA.rows.length; i++) {
			FALUK[i - 1] = parseInt(PFA.rows[i].cells[0].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0]);
		} /*Weboldal szerkezeti kialakítása*/
		document.getElementById("header_info").innerHTML = '<a href="javascript: BOT=false; void(0);">Klikk, ha bejött a bot védelem, de már beírtad a kódot ÉS BEZÁRTAD A LAPOKAT.</a><p id="sereg"></p>';
		var X = document.getElementById("production_table").rows;
		hossz = X[0].cells[0].offsetWidth;
		hosszT = X[0].cells[4].offsetWidth;
		for (var i = 0; i < X.length; i++) {
			X[i].cells[0].width = hossz;
			X[i].cells[4].width = "100px";
			if (document.getElementById("tav")) {
				X[i].deleteCell(4);
				X[i].deleteCell(3);
				X[i].deleteCell(2);
				var fix = 1;
			} else {
				X[i].deleteCell(3);
				X[i].deleteCell(2);
				X[i].deleteCell(1);
				var fix = 0;
			}
			for (var j = 0; j < 2; j++) {
				if (j == 0) var str = "Itthoni";
				else var str = "Összes";
				newcell = X[i].insertCell((j * 10) + 1 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_spear.png" title="' + str + ' lándzsások. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 2 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_sword.png" title="' + str + ' kardosok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 3 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_axe.png" title="' + str + ' bárdosok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 4 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_archer.png" title="' + str + ' íjászok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 5 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_spy.png" title="' + str + ' kémek. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 6 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_light.png" title="' + str + ' könnyűlovasok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 7 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_marcher.png" title="' + str + ' lovasíjászok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 8 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_heavy.png" title="' + str + ' nehézlovasok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 9 + fix);
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_ram.png" title="' + str + ' kosok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
				newcell = X[i].insertCell((j * 10) + 10 + fix);
				newcell.setAttribute("style", "border-right:  2px solid black;");
				if (i == 0) newcell.innerHTML = '<img src="/graphic/unit/unit_catapult.png" title="' + str + ' katapultok. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
			}
			newcell = X[i].insertCell(X[i].cells.length - 1);
			newcell.style.backgroundColor = "#49F";
			if (i == 0) newcell.innerHTML = '<img src="/graphic/buildings/mid/barracks3.png" title="Képzési idő percben. Klikk a szűréshez." onclick=Egyseg_szuro(this)>';
		}
		document.getElementsByTagName("body")[0].innerHTML += '<p id="DEBUG"></p>';
		$("body").append('<div style="display: none; background-color: white; width:600px; color: #006; background-position:left top; background-repeat:no-repeat; position: absolute; right:0px; top:260px; border:3px solid blue; padding: 5px; z-index:200; margin-bottom: 50px;" id="feld_divbox"><div id="feld_boxhead"><h2><a onclick="bezar()" style="cursor: pointer; cursor: hand;">[X]</a> Export</h2><br><br></div>\  	<textarea id="feld_export" rows="10" cols="75"></textarea><br>\  	C&amp;C Műhely ~ cncDAni2<div style="height: 50px; margin: 0 0 -50px 0; background:transparent;"></div>');
	} catch (e) {
		alert(e);
	}
}
function bezar(box){try{
	$("#feld_divbox").hide();
}catch(e){alert(e)}}
function debug(str) {
	return;
	document.getElementById("DEBUG").innerHTML += "<br>" + str;
	return;
}
function feld_save(ezt) {
	try {
		$("#feld_divbox").show();
		var U = new Array("spear", "sword", "axe", "archer", "spy", "light", "marcher", "heavy", "ram", "catapult");
		var sorok = ezt.innerHTML.split("<br>");
		var out = "[table][**]Játékos:[|] [player]" + game_data.player.name + "[/player] (" + game_data.player.villages + " falu, " + game_data.player.points_formatted.replace(/[^0-9\.]+/g, "") + " pont)[/**]\n";
		var fej = out;
		out += "[**]Falucsoport:[|] [b]" + ezt.getElementsByTagName("b")[0].innerHTML + "[/b] (" + sorok[0].match(/[0-9]+/g)[sorok[0].match(/[0-9]+/g).length - 1] + " falu)[/**]\n";
		out += "[**]Itthon lévő sereg:[|] ";
		for (var i = 0; i < sorok[1].match(/[0-9]+/g).length; i++) {
			if (parseInt(sorok[1].match(/[0-9]+/g)[i], 10) == 0) continue;
			out += SzamFormat(parseInt(sorok[1].match(/[0-9]+/g)[i], 10)) + "[unit]" + U[i] + "[/unit] ";
		}
		out += "[/**]\n";
		out += "[**]Összes sereg a csoportban:[|]";
		for (var i = 0; i < sorok[2].match(/[0-9]+/g).length; i++) {
			if (parseInt(sorok[2].match(/[0-9]+/g)[i], 10) == 0) continue;
			out += SzamFormat(parseInt(sorok[2].match(/[0-9]+/g)[i], 10)) + "[unit]" + U[i] + "[/unit] ";
		}
		out += "[/**]\n";
		out += "\n[*]1 falura jutó sereg:[|]" + SzamFormat(sorok[3].match(/[0-9]+/g)[2]) + " fő.[/*]\n[*]Katapult és kémek nélkül:[|]" + SzamFormat(sorok[4].match(/[0-9]+/g)[0]) + " fő[/*]\n";
		out += "[*]Seregek aránya:[|]" + SzamFormat(sorok[5].match(/[0-9]+/g)[0]) + "/" + SzamFormat(sorok[5].match(/[0-9]+/g)[1]) + " (" + sorok[5].match(/[0-9]+/g)[2] + "%)[/*][/table]";
		document.getElementById("feld_export").value = out;
		document.getElementById("feld_export").select();;
		return out.replace(fej, "[table]");
	} catch (e) {
		alert(e);
	}
}
function save_all() {
	try {
		var X = document.getElementById("sereg").getElementsByTagName("p");
		var out = "[u][b]Játékos:[/b][/u] [player]" + game_data.player.name + "[/player] (" + game_data.player.villages + " falu, " + game_data.player.points_formatted.replace(/[^0-9\.]+/g, "") + " pont)\n\n";
		for (var i = 0; i < X.length; i++) {
			out += feld_save(X[i]) + "\n\n";
		}
		document.getElementById("feld_export").value = out;
		document.getElementById("feld_export").select();
	} catch (e) {
		alert(e);
	}
}
function szektorkiir(a) {
	try {
		var Z = document.getElementById("sereg");
		if (document.getElementById("tav")) var fix = 1;
		else var fix = 0;
		Z.innerHTML += "<p></p>";
		Z = Z.getElementsByTagName("p")[Z.getElementsByTagName("p").length - 1];
		Z.innerHTML = "<b>" + a + " szektor</b> (";
		var falu = 0;
		var X = document.getElementById("production_table").rows;
		var sereg = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		var sereg2 = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		for (var i = 1; i < X.length; i++) {
			if ($.trim(X[i].cells[0].textContent.split(/\([0-9]+(\|)[0-9]+\)/g)[0]) != a) continue;
			falu++;
			for (var j = 0 + fix; j < 10 + fix; j++) {
				sereg[j - fix] += parseInt(X[i].cells[j + 1].innerHTML);
			}
			for (var j = 0 + fix; j < 10 + fix; j++) {
				sereg2[j - fix] += parseInt(X[i].cells[j + 11].innerHTML);
			}
		}
		Z.innerHTML += falu + ' falu) <a onclick="feld_save(this.parentNode);">Mentés</a><br>Itthon: ' + sereg + "<br>Össz: " + sereg2 + "<br>1 faluja jutó sereg (nl=6,...): ";
		var power = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 2 * sereg[4] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8] + 8 * sereg[9];
		Z.innerHTML += Math.round(parseInt(power) / falu) + "<br>...kém/kata nélkül: ";
		var power2 = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8];
		Z.innerHTML += Math.round(parseInt(power2) / falu) + "<br>Sereg tanyaszámban: ";
		power2 = sereg2[0] + sereg2[1] + sereg2[2] + sereg2[3] + 2 * sereg2[4] + 4 * sereg2[5] + 5 * sereg2[6] + 6 * sereg2[7] + 5 * sereg2[8] + 8 * sereg2[9];
		Z.innerHTML += power + "/" + power2 + " (" + (Math.round((power / power2).toFixed(2) * 100)) + "%)";
	} catch (e) {
		alert("Auto szektorlétrehozó kiírói hiba:\n" + e);
	}
}
function szektorkereso() {
	try {
		var falunevek = new Array();
		var X = document.getElementById("production_table").rows;
		for (var i = 1; i < X.length; i++) {
			falunevek[i - 1] = $.trim(X[i].cells[0].textContent.split(/\([0-9]+(\|)[0-9]+\)/g)[0]);
		}
		for (var i = 0; i < falunevek.length; i++) {
			if (falunevek[i] == "") continue;
			var db = 0;
			var nez = falunevek[i];
			for (var j = i; j < falunevek.length; j++) {
				if (nez == falunevek[j]) {
					falunevek[j] = "";
					db++;
				}
			}
			if (db > 7) szektorkiir(nez);
		}
		return;
	} catch (e) {
		alert("Auto szektorlétrehozó hiba:\n" + e);
	}
}
function SzamFormat(szami) {
	var szam = szami + "";
	var conv = "";
	var j = 1;
	for (var i = szam.length - 1; i >= 0; i--) {
		if ((j % 3) == 0) conv += szam[i] + " ";
		else conv += szam[i];
		j++;
	}
	var bconv = "";
	for (var i = conv.length - 1; i >= 0; i--) bconv += conv[i];
	return bconv;
}
function details(mode) {try{
	$("#feld_divbox").show();
	var U = new Array("spear", "sword", "axe", "archer", "spy", "light", "marcher", "heavy", "ram", "catapult");
	var out="[table][**][player]" + game_data.player.name + "[/player]";
	for (var i=0;i<U.length;i++) out+="[||][unit]"+U[i]+"[/unit]";
	out+="[/**]";
	var d=document.getElementById("production_table").rows;
	for (i=1;i<d.length;i++){
		if (d[i].style.display==="none") continue;
		var s = d[i].cells[0].textContent.match(/[0-9]+\|[0-9]+/g);
		out+="[*] "+s[s.length-1]+" ";
		for (var j=1;j<11;j++){
			out+="[|]"+d[i].cells[j].textContent+"/"+d[i].cells[j+10].textContent;
		}
		out+="[/*]";
	}
	
	out+="[/table]"; document.getElementById("feld_export").value = out;
	document.getElementById("feld_export").select();
}catch(e){alert("HIBA:\n"+e);}}
function recalc() {
	try { /*Végeredménnyel való művelet*/
		var Z = document.getElementById("sereg");
		if (document.getElementById("tav")) var fix = 1;
		else var fix = 0;
		if (Z.innerHTML == "") {
			for (var i = 0; i < RefArray.length; i++) {
				RefArray[i].window.close();
			}
			Z.innerHTML = '<a href="javascript:recalc()">Frissítés a jelenleg kiválaszott csoportra</a> | <a href="javascript:save_all()">Összes csoport exportálása</a> | <a href="javascript: details(\'bent\')">Falunkénti exportálás</a>';
			Z.innerHTML += "<p></p>";
			Z = Z.getElementsByTagName("p")[0];
			Z.innerHTML = '<b>Összes elemzett</b> (';
			var X = document.getElementById("production_table").rows;
			Z.innerHTML += X.length - 1 + ' falu) <a onclick="feld_save(this.parentNode);">Mentés</a><br>Itthon: ';
			var sereg = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			var sereg2 = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			for (var i = 1; i < X.length; i++) {
				for (var j = 0 + fix; j < 10 + fix; j++) {
					sereg[j - fix] += parseInt(X[i].cells[j + 1].innerHTML);
				}
				for (var j = 0 + fix; j < 10 + fix; j++) {
					sereg2[j - fix] += parseInt(X[i].cells[j + 11].innerHTML);
				}
			}
			Z.innerHTML += sereg + "<br>Össz: " + sereg2 + "<br>1 faluja jutó sereg (nl=6,...): ";
			var power = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 2 * sereg[4] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8] + 8 * sereg[9];
			Z.innerHTML += Math.round(parseInt(power) / X.length) + "<br>...kém/kata nélkül: ";
			var power2 = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8];
			Z.innerHTML += Math.round(parseInt(power2) / X.length) + "<br>Sereg tanyaszámban: ";
			power2 = sereg2[0] + sereg2[1] + sereg2[2] + sereg2[3] + 2 * sereg2[4] + 4 * sereg2[5] + 5 * sereg2[6] + 6 * sereg2[7] + 5 * sereg2[8] + 8 * sereg2[9];
			Z.innerHTML += power + "/" + power2 + " (" + (Math.round((power / power2).toFixed(2) * 100)) + "%)";
			var newNode = document.createElement("div");
			newNode.setAttribute("align", "center");
			var x2 = document.getElementById("content_value");
			newNode.innerHTML = '<br>Seregszűrés: <a href="javascript: Auto_csop(\'all\');">Mind</a>|<a href="javascript: Auto_csop(\'ures\');">Üres</a>|<a href="javascript: Auto_csop(\'tamad\');">Támadók</a>|<a href="javascript: Auto_csop(\'vedo\');">Védők</a>|<a href="javascript: Auto_csop(\'kem\');">2000+ kém</a>|<a href="javascript: Auto_csop(\'kata\');">1000+ katapult</a>|<a href="javascript: Auto_csop(\'vegyes\');">Vegyes</a>|<a href="javascript: Auto_csop(\'itthon\');">Itthon lévők</a>|<a href="javascript: Auto_csop(\'fok\');">Több, mint ?? egység</a>';
			x2.insertBefore(newNode, x2.childNodes[1]);
			szektorkereso();
		} else {
			a = prompt("Ezen csoport neve?", "új");
			if (a == null) return;
			Z.innerHTML += "<p></p>";
			Z = Z.getElementsByTagName("p")[Z.getElementsByTagName("p").length - 1];
			Z.innerHTML = "<b>" + a + "</b> (";
			var falu = 0;
			var X = document.getElementById("production_table").rows;
			var sereg = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			var sereg2 = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			for (var i = 1; i < X.length; i++) {
				if (X[i].style.display == "none") continue;
				falu++;
				for (var j = 0 + fix; j < 10 + fix; j++) {
					sereg[j - fix] += parseInt(X[i].cells[j + 1].innerHTML);
				}
				for (var j = 0 + fix; j < 10 + fix; j++) {
					sereg2[j - fix] += parseInt(X[i].cells[j + 11].innerHTML);
				}
			}
			Z.innerHTML += falu + ' falu) <a onclick="feld_save(this.parentNode);">Mentés</a><br>Itthon: ' + sereg + "<br>Össz: " + sereg2 + "<br>1 faluja jutó sereg (nl=6,...): ";
			var power = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 2 * sereg[4] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8] + 8 * sereg[9];
			Z.innerHTML += Math.round(parseInt(power) / falu) + "<br>...kém/kata nélkül: ";
			var power2 = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8];
			Z.innerHTML += Math.round(parseInt(power2) / falu) + "<br>Sereg tanyaszámban: ";
			power2 = sereg2[0] + sereg2[1] + sereg2[2] + sereg2[3] + 2 * sereg2[4] + 4 * sereg2[5] + 5 * sereg2[6] + 6 * sereg2[7] + 5 * sereg2[8] + 8 * sereg2[9];
			Z.innerHTML += power + "/" + power2 + " (" + (Math.round((power / power2).toFixed(2) * 100)) + "%)";
		}
	} catch (e) {
		alert("Hiba újraszámításkor:\n" + e);
	}
}
function kovetkezo() { /*Visszaadja melyik a következő faluazonosító amit nézni kell. -1 ha nincs már több feldolgozandó falu*/
	var nx = -1;
	for (var i = 0; i < FALUK.length; i++) {
		if (FALUK[i] != 0 && FELDOLG.indexOf(FALUK[i]) == -1) {
			nx = i;
			break;
		}
	} /*feldolg-ba betenni faluk[i]-t*/
	return nx;
}
function Egyseg_szuro(ez) {
	try {
		if (typeof cURL == 'undefined') varazskalap = false;
		else varazskalap = true;
		if (ez.title.split(".")[0].indexOf("Képzési") == -1) var kerdes = prompt(ez.title.split(".")[0] + " alapján való szűrés.\n\nAdja meg minimum mennyi egység legyen ebből a fajtából a falukban?");
		else var kerdes = prompt(ez.title.split(".")[0] + " való szűrés.\n\nAdja meg minimum hány perc képzési idő legyen a kiválasztandó csoportba?");
		if (kerdes == null || kerdes == "") return;
		kerdes = kerdes.replace(/[^0-9]/g, "");
		if (kerdes == "") {
			alert("Számot kell megadni");
			return;
		}
		kerdes = parseInt(kerdes, 10);
		var X = document.getElementById("production_table").rows;
		var sor = ez.parentNode.cellIndex;
		var itelet = false;
		for (var i = 1; i < X.length; i++) {
			CHECK2 = X[i];
			if (CHECK2.style.display != "none") regi = true;
			else regi = false;
			var egyseg = parseInt(X[i].cells[sor].innerHTML, 10);
			if (varazskalap) {
				if (egyseg < kerdes) {
					if (halmaz(regi, false)) CHECK2.setAttribute("style", "display:line");
					else CHECK2.setAttribute("style", "display:none");
				} else {
					if (halmaz(regi, true)) CHECK2.setAttribute("style", "display:line");
					else CHECK2.setAttribute("style", "display:none");
				}
			} else {
				if (egyseg < kerdes) {
					X[i].setAttribute("style", "display: none");
				} else {
					X[i].setAttribute("style", "display: line");
				}
			}
		}
		if (varazskalap) {
			sethalmaz("");
			szamlal();
		}
		return;
	} catch (e) {
		alert("Hiba keletkezett:\n" + e);
	}
}
function Auto_csop(mit) {
	try {
		var X = document.getElementById("production_table").rows;
		var itelet = false;
		if (mit == "fok") {
			var fok = prompt("Szűrés itthon lévő egységek száma szerint (tanyahely szerint, pl. nl=6).\n\nAdja meg, hány egységnél több lakosú falukat szeretne kilistáztatni.");
			fok = parseInt(fok);
		}
		if (typeof cURL == 'undefined') varazskalap = false;
		else varazskalap = true;
		for (var i = 1; i < X.length; i++) {
			var sereg = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			var osszI = 0;
			var sereg2 = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
			var osszO = 0;
			for (var j = 0; j < 10; j++) {
				sereg[j] += parseInt(X[i].cells[j + 1].innerHTML);
				osszI += sereg[j];
			}
			for (var j = 0; j < 10; j++) {
				sereg2[j] += parseInt(X[i].cells[j + 11].innerHTML);
				osszO += sereg2[j];
			}
			var tamado = sereg2[2] + sereg2[5] + sereg2[6] + sereg2[8];
			var vedo = sereg2[0] + sereg2[1] + sereg2[7];
			itelet = false;
			switch (mit) {
			case "ures":
				if (osszO < 100) itelet = true;
				break;
			case "tamad":
				if (tamado > 10 * vedo) itelet = true;
				break;
			case "vedo":
				if (vedo > 10 * tamado) itelet = true;
				break;
			case "kem":
				if (sereg2[4] > 2000) itelet = true;
				break;
			case "kata":
				if (sereg2[9] > 1000) itelet = true;
				break;
			case "vegyes":
				if (tamado < 10 * vedo && vedo < 10 * tamado) itelet = true;
				break;
			case "itthon":
				if (osszI > osszO * 0.9) itelet = true;
				break;
			case "fok":
				var power = sereg[0] + sereg[1] + sereg[2] + sereg[3] + 2 * sereg[4] + 4 * sereg[5] + 5 * sereg[6] + 6 * sereg[7] + 5 * sereg[8] + 8 * sereg[9];
				if (power >= fok) itelet = true;
				break;
			case "all":
				itelet = true;
			}
			if (varazskalap) {
				CHECK2 = X[i];
				if (CHECK2.style.display != "none") regi = true;
				else regi = false;
				if (halmaz(regi, itelet)) CHECK2.setAttribute("style", "display:line");
				else CHECK2.setAttribute("style", "display:none");
			} else {
				if (!itelet) {
					X[i].setAttribute("style", "display: none");
				} else {
					X[i].setAttribute("style", "display: line");
				}
			}
		}
		if (varazskalap) {
			sethalmaz("");
			szamlal();
		}
		return;
	} catch (e) {
		alert("Hiba :(\n" + e);
	}
}
function szamol(P_IND) {
	try { /*Aktuális lapon való feladatvégzés. False: sikertelen;True: sikeres*/
		/*Hibák/betöltődés*/
		if (!RefArray[P_IND].document.getElementById("serverTime")) {
			return false;
		}
		if ((WAIT[P_IND] == 10)) {
			FELDOLG[P_IND] = 0;
			return false;
		}
		if (RefArray[P_IND].document.getElementById('bot_check') || RefArray[P_IND].document.title == "Bot védelem") {
			BOT = true;
			return false;
		} /*ID egyezés keresés*/
		if (RefArray[P_IND].game_data.village.id != FELDOLG[P_IND]) {
			return false;
		}
		var X = document.getElementById("production_table").rows;
		var sereg = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		var sereg2 = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0); /*alert(HashTable[P_IND]+". sorban kész a seregszámítás.");*/
		var Z = RefArray[P_IND].document.getElementById("train_form").getElementsByTagName("table")[0].rows;
		for (var i = 1; i < Z.length - 1; i++) {
			var egyseg = Z[i].cells[0].getElementsByTagName("img")[0].src.match(/[a-z]+\.png/g)[0].replace(".png", "");
			switch (egyseg) {
			case "spear":
				sereg[0] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[0] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "sword":
				sereg[1] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[1] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "axe":
				sereg[2] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[2] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "archer":
				sereg[3] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[3] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "spy":
				sereg[4] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[4] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "light":
				sereg[5] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[5] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "marcher":
				sereg[6] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[6] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "heavy":
				sereg[7] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[7] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "ram":
				sereg[8] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[8] = Z[i].cells[2].innerText.split("/")[1];
				break;
			case "catapult":
				sereg[9] = Z[i].cells[2].innerText.split("/")[0];
				sereg2[9] = Z[i].cells[2].innerText.split("/")[1];
				break;
			default:
				alert(egyseg + " - nincs ilyen");
			}
		} /*Képzési idő számítása*/
		var maxtime = 0;
		var temptime = 0;
		try {
			var IDO_b = RefArray[P_IND].document.getElementById("trainqueue_wrap_barracks").getElementsByTagName("table")[0].rows;
			if (IDO_b.length == 2) var hossz = 2;
			else hossz = IDO_b.length - 1;
			for (var i = 1; i < hossz; i++) {
				maxtime += parseInt(IDO_b[i].cells[1].innerText.split(":")[0], 10) * 60 + parseInt(IDO_b[i].cells[1].innerText.split(":")[1], 10);
			}
		} catch (e) {}
		try {
			IDO_b = RefArray[P_IND].document.getElementById("trainqueue_wrap_stable").getElementsByTagName("table")[0].rows;
			if (IDO_b.length == 2) var hossz = 2;
			else hossz = IDO_b.length - 1;
			for (var i = 1; i < hossz; i++) {
				temptime += parseInt(IDO_b[i].cells[1].innerText.split(":")[0], 10) * 60 + parseInt(IDO_b[i].cells[1].innerText.split(":")[1], 10);
			}
			if (maxtime < temptime) maxtime = temptime;
			temptime = 0;
		} catch (e) {}
		try {
			IDO_b = RefArray[P_IND].document.getElementById("trainqueue_wrap_garage").getElementsByTagName("table")[0].rows;
			if (IDO_b.length == 2) var hossz = 2;
			else hossz = IDO_b.length - 1;
			for (var i = 1; i < hossz; i++) {
				temptime += parseInt(IDO_b[i].cells[1].innerText.split(":")[0], 10) * 60 + parseInt(IDO_b[i].cells[1].innerText.split(":")[1], 10);
			}
			if (maxtime < temptime) maxtime = temptime;
		} catch (e) {} /*ID -> sor konvertálás*/
		var check = false;
		var fix = 0;
		if (document.getElementById("tav")) fix = 1;
		for (var i = 1; i < X.length; i++) {
			if (X[i].cells[0].getElementsByTagName("a")[0].href.match(/village=[0-9]+/g)[0].replace("village=", "") == RefArray[P_IND].game_data.village.id) {
				for (var j = 0; j < 10; j++) {
					X[i].cells[j + 1 + fix].innerHTML = sereg[j];
					X[i].cells[j + 11 + fix].innerHTML = sereg2[j];
				}
				X[i].cells[X[i].cells.length - 2].innerHTML = maxtime;
				check = true;
				break;
			}
		} /*FALUK munkatömb módosítása: --> 0 = kész*/
		FALUK[FALUK.indexOf(RefArray[P_IND].game_data.village.id)] = 0;
		return true;
	} catch (e) {
		alert("Számol: " + e);
	}
	return false;
}
function eloszto() {
	try { /*A Motor*/
		if (!BOT) {
			var nexttime = 200;
			var nextindex = kovetkezo();
			var end = false;
			if (nextindex == -1) {
				var kilep = true;
				for (var i = 0; i < FELDOLG.length; i++) {
					if (FELDOLG[i] != 0 && FELDOLG[i] != "" && FELDOLG[i] != undefined) {
						kilep = false;
						break;
					}
				}
				if (kilep) {
					recalc();
					return;
				}
				if (FELDOLG[LAP] != 0 && FELDOLG[LAP] != "" && FELDOLG[LAP] != undefined) end = true;
			} /*Lapmegnyitás!*/
			if (end && (RefArray[LAP].closed || RefArray[LAP] == undefined)) { /*(!)*/
				RefArray[LAP] = window.open(BASE_URL + "village=" + FALUK[nextindex] + "&screen=train", "sereg_" + LAP);
				FELDOLG[LAP] = FALUK[nextindex];
			} else if (((RefArray[LAP] == undefined) || (RefArray[LAP].closed) || (RefArray[LAP].location.href.indexOf("&screen=train") == -1) || (WAIT[LAP] == 0)) && (nextindex != -1)) { /*(!)*/
				RefArray[LAP] = window.open(BASE_URL + "village=" + FALUK[nextindex] + "&screen=train", "sereg_" + LAP);
				FELDOLG[LAP] = FALUK[nextindex];
			} /*debug(LAP+": Feldolg: "+FELDOLG+" - FALUK: "+FALUK);*/
			if (szamol(LAP, nextindex)) {
				FELDOLG[LAP] = 0;
				nextindex = kovetkezo(); /*(!)*/
				if (nextindex != -1) {
					RefArray[LAP] = window.open(BASE_URL + "village=" + FALUK[nextindex] + "&screen=train", "sereg_" + LAP);
					FELDOLG[LAP] = FALUK[nextindex];
				}
				WAIT[LAP] = 0;
			} else {
				WAIT[LAP]++;
				if (WAIT[LAP] > 10) {
					RefArray[LAP].window.close();
					WAIT[LAP] = 0;
				}
			}
		} else var nexttime = 5000;
	} catch (e) {
		alert(e);
	}
	LAP++;
	if (LAP > N) LAP = 0;
	nexttime = Math.round(nexttime * ((Math.random() * 0.5) + 0.5));
	setTimeout("eloszto()", 200);
	return;
}
$(document).ready(function () {
	$(function () {
		$("#feld_divbox").draggable({
			handle: $('#feld_boxhead')
		});
	});
});
void(0);