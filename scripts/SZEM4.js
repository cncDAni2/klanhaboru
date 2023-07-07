function stop(){
	var x = setTimeout('',100); for (var i = 0 ; i < x ; i++) clearTimeout(i);
}
stop(); /*Időstop*/
document.getElementsByTagName("html")[0].setAttribute("class","");

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

if (typeof(AZON)!="undefined") { alert("Itt már fut SZEM. \n Ha ez nem igaz, nyitsd meg új lapon a játékot, és próbáld meg ott futtatni"); exit();}
var VERZIO = 'v4.5 Build 23.07.07';
try{ /*Rendszeradatok*/
	var AZON="S0";
	if (window.name.indexOf(AZON)>-1) AZON="S1";
	var BASE_URL=document.location.href.split("game.php")[0];
	var CONFIG=loadXMLDoc(BASE_URL+"interface.php?func=get_config");
	var SPEED=parseFloat(CONFIG.getElementsByTagName("speed")[0].textContent);
	var UNIT_S=parseFloat(CONFIG.getElementsByTagName("unit_speed")[0].textContent);
	var MOBILE_MODE = false;

	var KTID=[], /*Koord-ID párosok*/
	TERMELES=[5,30,35,41,47,55,64,74,86,100,117,136,158,184,214,249,289,337,391,455,530,616,717,833,969,1127,1311,1525,1774,2063,2400],
	UNITS=["spear","sword","axe","archer","spy","light","marcher","heavy"],
	TEHERARR=[25,15,10,10,0,80,50,50],
	TEHER = {
		spear: 25,
		sword: 15,
		axe: 10,
		archer: 10,
		spy: 0,
		light: 80,
		marcher: 50,
		heavy: 50
	},
	TANYAARR=[1,1,1,1,2,4,5,6],
	TANYA = {
		spear: 1,
		sword: 1,
		axe: 1,
		archer: 1,
		spy: 2,
		light: 4,
		marcher: 5,
		heavy: 6
	},
	E_SEB_ARR=[18,22,18,18,9,10,10,11],
	E_SEB = {
		spear: 18,
		sword: 22,
		axe: 18,
		archer: 18,
		spy: 9,
		light: 10,
		marcher: 10,
		heavy: 11
	};

	var VILL1ST="";
	var ALTBOT=true;
	var MAX_IDO_PERC = 20; // shorttest-be van felülírva!!!
	AZON=game_data.player.id+"_"+game_data.world+AZON;
	var CLOUD_AUTHS = localStorage.getItem('szem_firebase');
	var USER_ACTIVITY = false;
	var USER_ACTIVITY_TIMEOUT;
	var worker = createWorker(function(self){
		self.TIMERS = {};
		self.addEventListener("message", function(e) {
			if (e.data.id == 'stopTimer') {
				clearTimeout(self.TIMERS[e.data.value]);
			} else {
				self.TIMERS[e.data.id] = setTimeout(() => { postMessage(e.data); }, e.data.time);
			}
		}, false);
	});
	worker.onmessage = function(worker_message) {
		worker_message = worker_message.data;
		switch(worker_message.id) {
			case 'farm': szem4_farmolo_motor(); break;
			case 'vije': szem4_VIJE_motor(); break;
			case 'epit': szem4_EPITO_motor(); break;
			case 'adatok': szem4_ADAT_motor(); break;
			default: debug('worker','Ismeretlen ID', JSON.stringify(worker_message))
		}
	};
	function createWorker(main){
		var blob = new Blob(
			["(" + main.toString() + ")(self)"],
			{type: "text/javascript"}
		);
		return new Worker(window.URL.createObjectURL(blob));
	}
}catch(e){alert('SZEM Nem tud elindulni/n' + e); exit(0);}

function vercheck(){try{
	naplo('Globál','Verzió ['+VERZIO+'] legfrissebb állapotban, GIT-ről szedve. ');
}catch(e){alert2(e);}}

function init(){try{
	if (document.getElementById("production_table")) var PFA=document.getElementById("production_table"); else 
	if (document.getElementById("combined_table")) var PFA=document.getElementById("combined_table"); else 
	if (document.getElementById("buildings_table")) var PFA=document.getElementById("buildings_table"); else 
	if (document.getElementById("techs_table")) var PFA=document.getElementById("techs_table");
	else {
		alert("Ilyen nézetbe való futtatás nem támogatott. Kísérlet az áttekintés betöltésére...\n\nLaunching from this view is not supported. Trying to load overview...");
		document.location.href=document.location.href.replace(/screen=[a-zA-Z]+/g,"screen=overview_villages");
		return false;
	}
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (patt.test(PFA.rows[1].cells[0].textContent)) var oszl=0; else
	if (patt.test(PFA.rows[1].cells[1].textContent)) var oszl=1; else
	if (patt.test(PFA.rows[1].cells[2].textContent)) var oszl=2; else
	{alert("Nem találok koordinátákat ebbe a listába.\n\nI can not find coordinates in this view."); return false;}
	VILL1ST=PFA.rows[1].cells[oszl].getElementsByTagName("a")[0].href;
	for (var i=1;i<PFA.rows.length;i++) {
		var kord=PFA.rows[i].cells[oszl].textContent.match(/[0-9]+(\|)[0-9]+/g);
		kord=kord[kord.length-1];
		KTID[i-1]=kord+";"+PFA.rows[i].cells[oszl].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0];
	}
	document.getElementsByTagName("head")[0].innerHTML += `
	<style type="text/css">
		body { background: #111; }
		#side-notification-container {
			pointer-events: none;
			display: none;
		}
		#alert2 {
			width: 300px;
			background-color: #0d47a1;
    		color: #FFF;
			position: fixed;
			left:40%;
			top:40%;
			font-size: 11pt;
			padding: 5px;
			z-index: 200;
			border-radius: 5px;
			box-shadow: black 0 0 7px;
			display: none;
			animation: blinkingalert 0.5s infinite;
		}
		@keyframes blinkingalert {
			0% {
				box-shadow: #0d47a1 0 0 0px;
			}
			100% {
				box-shadow: #0d47a1 0 0 20px;
			}
		}
		#alert2head {
			display: flex;
			justify-content: space-between;
			width: 100%;
			cursor: all-scroll;
			background: rgba(255,255,255,0.1);
			margin: -5px;
			padding: 5px;
			font-weight: bold;
			height: 20px;
		}
		#alert2head a {
			padding: 10px 0 10px 10px;
		}
		#kiegs img {
			cursor: pointer;
		}
		.fej {
			width: 1024px;
			margin:auto;
			color: white;
			position: relative;
		}
		.fej > table {
			padding:1px;
			border: 1px solid yellow;
		}
		#global_notifications {
			position: absolute;
			top: 0;
			left: -22px;
			width: 18px;
		}
		#global_notifications img { width: 18px; }
		#global_notifications img.rotate { animation: rotation 2s infinite linear; }
		@keyframes rotation {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}
		table.menuitem {
			vertical-align:top;
			text-align: top;
			padding: 20px;
			margin:auto;
			color: white;
			border: 1px solid yellow;
		}
		table.menuitem td {
			padding: 0px;
			vertical-align:top;
		}
		table {
			padding: 0px;
			margin: auto;
			color: white;
		}
		table.vis { color:black; }
		table.vis td, table.vis th { padding: 3px 6px 3px 6px; }
		#farm_honnan tr td:last-child {
			font-size: 60%;
			width: 130px;
		}
		#farm_hova tr td:last-child {
			width: 135px;
		}
		textarea {
			background-color: #020;
			color:white;
		}
		.divrow { display: flex; align-items: center; }
		.divcell {
			display: table-cell;
			text-align: center;
			vertical-align:top;
		}
		a { color: white; }
		img{
			border-color: grey;
			padding:1px;
		}
		#naploka a { color:blue; }
		input[type="button"] {
			font-size:13px;
			font-family: Century Gothic, sans-serif;
			color:#FFFF77;
			background-color:#3366CC;
			border-style: ridge;
			border-color:#000000;
			border-width:3px;
		}
		.szem4_vije_optsTable {
			margin: initial;
			border-collapse: separate;
			border-spacing: 0px 7px;
		}
		.szem4_vije_optsTable input {
			font-size: 10pt;
		}
		#vije_opts input[type="checkbox"] { width: 17px; height: 17px; }

		.tooltip-wrapper { display: flex; flex-wrap: wrap; gap: 10px 0; }
		.tooltip-wrapper img { padding-left: 2px; padding-right: 0; display: table-cell; }
		.tooltip_hover { position: relative; display: table; border-collapse: collapse; }
		.tooltip_text {
			position: absolute; z-index: 1; left: 50%; bottom: 100%; transform: translateX(-50%); white-space: nowrap; font-style: normal; background: gray; padding: 5px 8px; border-radius: 3px; margin-bottom: 5px; color: white; display: none; border: 1px solid black;
		}
		.bottom-tooltip .tooltip_text { top: 100%; bottom: auto; }
		.tooltip_text:after { content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-top: 5px solid gray; border-left: 5px solid transparent; border-right: 5px solid transparent }
		.bottom-tooltip .tooltip_text:after { top: auto; bottom: 100%; border-bottom: 5px solid gray; border-top: 5px solid transparent; }
		table.no-bg-table td {
			vertical-align: middle;
			background: transparent;
		}
		table.no-bg-table td .flex_middle {
			display: flex;
			align-items: center;
		}
		.szem4_unitbox {
			display: inline-block;
			position: relative;
			border-radius: 5px;
		}
		.szem4_unitbox.szem4_unitbox_not_available::before {
			content: "";
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			border-top: 2px solid rgba(255,0,0,0.5);
			pointer-events: none;
			transform: rotate(20deg);
		}
		.szem4_unitbox label {
			cursor: pointer;
			display: block;
		}
		.szem4_unitbox label:hover {
			background: rgba(0,0,0,0.2);
		}
		.szem4_unitbox input {
			cursor: pointer;
			margin-left: -2px;
			margin-right: 3px;
		}
		.szem4_farmolo_datatable_wrapper {
			display: flex;
			justify-content: space-between;
		}
		.szem4_farmolo_datatable_wrapper table {
			margin: 0;
		}
		.nopadding_td {
			padding: 0 !important;
		}
		.heartbeat_wrapper {
			height: 18px;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.heartbeat_icon {
			height: 15px;
			padding: 0 2px;
			margin-right: 5px;
			animation: heartbeatanimation 1.0s infinite;
		}
		@keyframes heartbeatanimation {
			0% {
				height: 15px;
				padding: 0 2px;
			}
			33% {
				height: 15px;
				padding: 0 2px;
			}
			50% {
				height: 19px;
				padding: 0;
			}
			66% {
				height: 15px;
				padding: 0 2px;
			}
		}
		</style>`;
	document.getElementsByTagName("body")[0].innerHTML=`
		<div id="alert2">
			<div id="alert2head">
				<div>Üzenet</div>
				<div><a href='javascript: alert2("close");'>❌</a></div>
			</div>
			<p id="alert2szov"></p>
		</div>
		<div class="fej">
			<div id="global_notifications"></div>
			<table width="100%" align="center" style="background: #111; background-image:url('${pic("wallp.jpg")}'); background-size:1024px;">
				<tr>
					<td width="70%" id="fejresz" style="vertical-align:middle; margin:auto;">
						<h1><i></i></h1>
					</td>
					<td id="sugo" height="110px"></td>
				</tr>
				<tr><td colspan="2" id="menuk" style="">
					<div class="divrow" style="width: 1016px">
						<span class="divcell" id="kiegs" style="text-align:left; padding-top: 9px;width:870px;">
							<img src="${pic("muhely_logo.png")}" alt="GIT" title="GIT C&amp;C Műhely megnyitása" onclick="window.open('https://github.com/cncDAni2/klanhaboru')">
							<img src="${pic("kh_logo.png")}" alt="Game" title="Klánháború megnyitása" onclick="window.open(document.location.href)">
							|
						</span>
						<span class="divcell" style="text-align:right; width:250px">
							<a href=\'javascript: nyit("naplo");\' onmouseover="sugo(this,\'Események naplója\')">Napló</a>
							<a href=\'javascript: nyit("debug");\' onmouseover="sugo(this,\'Hibanapló\')">Debug</a>
							<a href=\'javascript: nyit("hang");\'><img src="${pic("hang.png")}" onmouseover="sugo(this,\'Hangbeállítások\')" alt="hangok"></a>
						</span>
					</div>
				</td></tr>
			</table>
		</div>
		<p id="content" style="display: inline"></p>`;
	document.getElementById("content").innerHTML='<table class="menuitem" width="1024px" align="center" id="naplo" style="display: none"> <tr><td> <h1 align="center">Napló</h1><br> <br> <table align="center" class="vis" id="naploka"><tr><th onclick=\'rendez("datum2",false,this,"naploka",0)\' style="cursor: pointer;">Dátum</th><th onclick=\'rendez("szoveg",false,this,"naploka",1)\' style="cursor: pointer;">Script</th><th onclick=\'rendez("szoveg",false,this,"naploka",2)\' style="cursor: pointer;">Esemény</th></tr></table> </td></tr> </table> <table class="menuitem" width="1024px" align="center" id="debug" style="display: none"> <tr><td> <h1 align="center">DeBugger</h1><br> <br><button type="button" onclick="debug_urit()">Ürít</button><button type="button" onclick="switchMobileMode()">Mobile_mode</button> <table align="center" class="vis" id="debugger"><tr><th onclick=\'rendez("datum2",false,this,"debugger",0)\' style="cursor: pointer;">Dátum</th><th onclick=\'rendez("szoveg",false,this,"debugger",1)\' style="cursor: pointer;">Script</th><th onclick=\'rendez("szoveg",false,this,"debugger",2)\' style="cursor: pointer;">Esemény</th></tr></table> </td></tr> </table> <table class="menuitem" width="1024px" align="center" id="hang" style="display: none"> <tr><td> <p align="center"><audio id="audio1" controls="controls" autoplay="autoplay"><source id="wavhang" src="" type="audio/wav"></audio></p> <h1 align="center">Hangbeállítás</h1><br> <div id="hangok" style="display:table;"> 	<div style="display:table-row;"><div style="display:table-cell; padding:10px;" onmouseover=\'sugo(this,"Ha be van kapcsolva, bot védelem esetén ez a link is megnyitódik, mint figyelmeztetés.")\'><b>Alternatív botriadó? <a href="javascript: altbot()">BEKAPCSOLVA</a><br>Megnyitott URL (egyszer)<br><input type="text" id="altbotURL" size="42" value="http://www.youtube.com/watch?v=k2a30--j37Q"></div> </div> </div> </td></tr> </table>';
	document.title="SZEM IV";
	
	debug("SZEM 4","Verzió: GIT_"+new Date().toLocaleDateString());
	debug("SZEM 4","Prog.azon: "+AZON);
	debug("SZEM 4","W-Speed: "+SPEED);
	debug("SZEM 4","U-Speed: "+UNIT_S);
	return true;
}catch(e){alert("Hiba indításkor:\n\nError at starting:\n"+e); return false;}}

function pic(file){
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+file;
}

function altbot(){try{
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

function playSound(hang, ext='wav'){try{
	let hang2 = hang;
	if (hang.includes('farmolas')) hang2 ='farmolas';
	var isOn=document.getElementsByName(hang2)[0];
	if (isOn==undefined) {debug("hanghiba","Nem definiált hang: "+hang2); return}
	if (isOn.checked==false) return;
	var play = `https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/${hang}.${ext}`;
	document.getElementById("wavhang").src=play;
	document.getElementById("audio1").load();
	document.getElementById("audio1").play();
	//setTimeout(function() { if (document.getElementById("audio1").paused) document.getElementById("audio1").play()}, 500);
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

function shorttest() {
	try {
		var hiba = ''; var warn = '';
		let optsForm = document.getElementById('farmolo_options');

		if (optsForm.termeles.value == '') hiba += 'Termelés/óra értéke üres. Legalább egy 0 szerepeljen!\n';
		if (parseInt(optsForm.termeles.value, 10) < 50) warn += "Termelés/óra értéke nagyon alacsony. Min 50\n";

		if (optsForm.maxtav_ora.value == '') hiba += 'Max táv/óra: Üres érték. \n';
		if (optsForm.maxtav_p.value == '') hiba += 'Max táv/perc: Üres érték. \n';
		if (parseInt(optsForm.maxtav_ora.value, 10) == 0 && parseInt(optsForm.maxtav_p.value, 10) < 1) hiba += 'A jelenleg megadott max távolság 0!\n';
		if (parseInt(optsForm.maxtav_ora.value, 10) == 0 && parseInt(optsForm.maxtav_p.value, 10) < 40) warn += 'A jelenleg megadott max távolság nagyon rövid!\n';

		if (optsForm.kemdb.value == '') hiba += 'Ha nem szeretnél kémet küldeni, írj be 0-t.\n';
		if (parseInt(optsForm.kemdb.value, 10) > 3) warn += '3-nál több kém egyik szerveren sem szükséges. Javasolt: 1 vagy 3.\n';
		if (optsForm.isforced.checked && parseInt(optsForm.kemdb.value, 10) == 0) warn += 'Kényszeríted a kémek küldését, de a küldendő kém értékére 0 van megadva!\n';

		if (optsForm.kemperc.value == '') hiba += 'Kém/perc üres. Ha mindig küldenél kémet, legyen 0, bár ilyenre semmi szükség';

		if (optsForm.minsereg.value == '') hiba += 'Ha minimum limit nélkül szeretnéd egységeid küldeni, írj be 0-t.\n';

		if (optsForm.sebesseg_p.value == '') hiba += 'A legkevesebb pihenő idő: 1 perc, ne hagyd üresen.\n';
		if (parseInt(optsForm.sebesseg_p.value, 10) < 1) hiba += 'A legkevesebb pihenő idő: 1 perc.\n';
		if (parseInt(optsForm.sebesseg_p.value, 10) > 30) warn += '30 percnél több pihenő időt adtál meg. Biztos?\n';
		if (parseInt(optsForm.sebesseg_p.value, 10) > 150) hiba += '150 percnél több pihenő időt nem lehet megadni.\n';
		if (optsForm.sebesseg_m.value == '') hiba += 'A leggyorsabb ciklusidő: 200 ms, ne hagyd üresen.\n';
		if (parseInt(optsForm.sebesseg_m.value, 10) < 200) hiba += 'A leggyorsabb ciklusidő: 200 ms\n';
		if (parseInt(optsForm.sebesseg_m.value, 10) > 5000) hiba += '5000 ms-nél több ciklusidő felesleges, és feltűnő. Írj be 5000 alatti értéket.\n';

		if (optsForm.raktar.value == '' || parseInt(optsForm.raktar.value, 10) < 20) hiba += 'Raktár telítettségi értéke túl alacsony, így vélhetőleg sehonnan se fog fosztani. Min 20%';

		if (optsForm.megbizhatosag.value == '' || parseInt(optsForm.megbizhatosag.value, 10) < 5 || parseInt(optsForm.megbizhatosag.value, 10) > 120) hiba += 'Megbízhatósági szint 5-120 perc között legyen';
		else MAX_IDO_PERC = parseInt(optsForm.megbizhatosag.value, 10);

		if (hiba != '' && !FARM_PAUSE) szunet('farm', document.getElementById('kiegs').getElementsByName('farm')[0]);
		if (FARM_PAUSE) warn += 'A farmoló jelenleg meg van állítva!';
		if (hiba != '') {
			alert2('<b>Egy vagy több beállítási hiba miatt nem indítható a farmoló!</b><br><br>' + hiba);
			return false;
		} else {
			if (warn == '')
				alert2('close');
			else
				alert2('Javaslatok:\n' + warn);
		}
		return true;
	} catch (e) { alert2('Hiba:\n' + e); }
}

var SUGOORA;
function sugo(el, str) {
	if (str == '') {
		document.getElementById("sugo").innerHTML=str;
		return;
	}
	if (!el.hasAttribute("data-hossz")) {
		el.addEventListener("mouseout", (event) => {
			SUGOORA = setTimeout(() => sugo(event.fromElement, ""), parseInt(event.fromElement.getAttribute('data-hossz'), 10));
		});
	}
	var hossz=str.length;
	hossz=Math.round((hossz*1000)/40);
	if (SUGOORA!="undefined") clearTimeout(SUGOORA);
	document.getElementById("sugo").innerHTML=str;
	el.setAttribute('data-hossz', hossz);
}

function prettyDatePrint(m) {
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
	for (var i=0;i<temp.length;i++) {
		if (temp[i].nodeName.toUpperCase()=="TABLE") {cid=temp[i].getAttribute("id");
		$("#"+cid).fadeOut(300);}
	} var patt=new RegExp("\""+ezt+"\"");
	temp=document.getElementById("menuk").getElementsByTagName("a");
	for (i=0;i<temp.length;i++) {
		temp[i].style.padding="3px";
		if (patt.test(temp[i].getAttribute("href"))) temp[i].style.backgroundColor="#000000"; else temp[i].style.backgroundColor="transparent";
	}
	setTimeout(function(){$("#"+ezt).fadeIn(300)},300);
	//addFlyingOptions(ezt);
}catch(e){alert(e);}}

function alert2(szov){
	szov=szov+"";
	if (szov=="close") {$("#alert2").hide(); return;}
	szov=szov.replace("\n","<br>");
	document.getElementById("alert2szov").innerHTML=szov;
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
	if (table.rows.length > 300) {
		$("#debugger").find('tr:gt(150)').remove();
	}
	if (table.rows.length > 10 && d - new Date(`${d.getFullYear()} ${table.rows[10].cells[0].textContent}`) < 180000) {
		naplo('Auto-error', 'Túl sok hiba valahol?');
		playSound('kritikus_hiba');
	}
}
function debug_urit() {
	$("#debugger").find('tr:gt(0)').remove();
}

function ujkieg(id,nev,tartalom){
	if (document.getElementById(nev)) return false;
	document.getElementById("kiegs").innerHTML+='<img onclick=\'szunet("'+id+'",this)\' name="'+id+'" onmouseover=\'sugo(this,"Az érintett scriptet tudod megállítani/elindítani.")\' src="'+pic(((id=='farm'||id=='vije')?'pause':'play')+ ".png")+'" alt="Stop" title="Klikk a szüneteltetéshez"> <a href=\'javascript: nyit("'+id+'");\'>'+nev.toUpperCase()+'</a> ';
	document.getElementById("content").innerHTML+='<table class="menuitem" width="1024px" align="center" id="'+id+'" style="display: none">'+tartalom+'</table>';
	return true;
}
function ujkieg_hang(nev,hangok){
	try{var files=hangok.split(";");}catch(e){var files=hangok;}
	var hely=document.getElementById("hangok").getElementsByTagName("div")[0];
	var kieg=document.createElement("div"); kieg.setAttribute("style","display:table-cell; padding:10px;");
	var str="<h3>"+nev+"</h3>";
	for (var i=0;i<files.length;i++) {
		str+='<input type="checkbox" name="'+files[i]+'" checked> <a href="javascript: playSound(\''+files[i]+'\');">'+files[i]+'</a><br>';
	}
	kieg.innerHTML=str;
	hely.appendChild(kieg);
	return;
}

function szunet(script,kep){try{
	switch (script) {
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
	
	for (var i=1;i<prodtable.length;i++) {
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
	
	for (var i=0;i<tavok.length;i++) {
		var min=i;
		for (var j=i;j<tavok.length;j++) {
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
	
	for (var i=prodtable.length-1;i>0;i--) {
		OBJ.deleteRow(i);
	}
	
	for (var i=0;i<tavok.length;i++) {
		OBJ.appendChild(sorok[indexek[i]]);
	}
	
	thislink.setAttribute("onclick","rendez(\""+tipus+"\","+!bool+",this,\""+table_azon+"\","+oszlop+")");
	return;
}catch(e){alert2("Hiba rendezéskor:\n"+e);}}

function koordTOid(koord){
	for (var i=0;i<KTID.length;i++) {
		if (KTID[i].split(";")[0]==koord) return KTID[i].split(";")[1];
	}
	return 0;
}

function rovidit(tipus){
	var ret="";
	switch (tipus) {
		case "egysegek": 
			for (var i=0;i<UNITS.length;i++)
			ret+=`<div class="szem4_unitbox" data-allunit="999" name="${UNITS[i]}"><label>
				<img src="/graphic/unit/unit_${UNITS[i]}.png">
				<input type="checkbox" onclick="szem4_farmolo_multiclick(${i},'honnan',this.checked)">
				</label></div>`;
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
	for (var i=x.length-1;i>0;i--) {
		if (x[i].style.display!="none") {
			switch(tip) {
				case "del": delete DOMINFO_FARMS[x[i].parentNode.cells[0].textContent]; x[i].parentNode.removeChild(x[i]); break;
				case "urit": if (ez=="honnan") x[i].cells[2].innerHTML=""; else x[i].cells[5].innerHTML=""; break;
				case "mod": DOMINFO_FARMS[x[i].parentNode.cells[0].textContent].nyers = parseInt(s1, 10); x[i].cells[3].innerHTML=s1; break;
				case "htor": DOMINFO_FARMS[x[i].parentNode.cells[0].textContent].color=''; x[i].cells[0].style.backgroundColor="#f4e4bc"; break;
				case "hcser": x[i].cells[2].style.backgroundColor=s1; break;
			}
		}
	}
}catch(e){}}

function sortorol(cella,ismulti) {
	var row = cella.parentNode;
	delete DOMINFO_FARMS[row.cells[0].textContent];
	row.parentNode.removeChild(row);
	multipricer(ismulti, "del");
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
	uj = parseInt(uj, 10);
	cella.innerHTML=uj;
	DOMINFO_FARMS[cella.parentNode.cells[0].textContent].nyers = uj;
	multipricer("hova","mod",uj);
}
function hattertolor(cella){
	cella.style.backgroundColor="#f4e4bc";
	DOMINFO_FARMS[cella.parentNode.cells[0].textContent].color = '';
	multipricer("hova","htor");
}
function hattercsere(cella){
	var szin="#00FF00";
	if (cella.style.backgroundColor=="rgb(0, 255, 0)" || cella.style.backgroundColor=="#00FF00") szin="#f4e4bc";
	cella.style.backgroundColor=szin;
	multipricer("hova","hcser",szin);
}
function addFreezeNotification() {
	if (!USER_ACTIVITY) document.getElementById('global_notifications').innerHTML = `<img src="${pic('freeze.png')}" class="rotate" onmouseover="sugo(this,'Amíg SZEM keretrendszert piszkálod, SZEM pihen hogy fókuszálni tudj (automata)')">`;
	USER_ACTIVITY = true;
	clearTimeout(USER_ACTIVITY_TIMEOUT);
	USER_ACTIVITY_TIMEOUT = setTimeout(() => {
		USER_ACTIVITY = false;
		document.getElementById('global_notifications').innerHTML = '';
	}, 5000);
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

function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('bot_check') || ref.document.getElementById('popup_box_bot_protection') || ref.document.title=="Bot védelem") {
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1) {
		naplo("Globális","Kijelentkezett fiók. Jelentkezzen be újra, vagy állítsa le a programot.");
		BotvedelemBe();
		return false;
	}
	if (!address) return false;
	if (address.indexOf("not ")>-1) var neg=true; else var neg=false;
	if (faluid>-1) if (ref.game_data.village.id!=faluid) return false;
	if (ref.document.getElementById("serverTime").innerHTML.length>4) {
		if (neg) {
			if (ref.document.location.href.indexOf(address.split(" ")[1])==-1) return true;
		} else {
			if (ref.document.location.href.indexOf(address)>-1)	return true;
		}
	}
	return false;
}catch(e){return false;}}
function windowOpener(id, url, windowId) {
	return window.open(url, windowId);
}
function addTooltip(el, text) {
	removeTooltip(el.closest('.tooltip-wrapper'));
	$(el).children('.tooltip_text').css({"display": "block"})
	$(el).children('.tooltip_text').html(text);
}
function addTooltip_build(el, koord) {
	removeTooltip(el.closest('.tooltip-wrapper'));
	$(el).children('.tooltip_text').css({"display": "block"})
	$(el).children('.tooltip_text').html(JSON.stringify(DOMINFO_FARMS[koord].buildings).trim());
}
function removeTooltip(el) {
	$(el).find('.tooltip_hover').each(function(i, el) {
		var thisText = $(el).children('.tooltip_text').html();
		if (thisText == "") return;
		$(el).children('.tooltip_text').html("");
		$(el).children('.tooltip_text').css({"display": "none"});
	});
}
function switchMobileMode() {
	MOBILE_MODE = !MOBILE_MODE;
	alert(`Mobile Mode = ${MOBILE_MODE}`);
}

/* ------------------- FARMOLÓ ----------------------- */
function drawWagons(koord) {
	let farms = document.getElementById('farm_hova').rows;
	if (!koord) {
		for (var i=1;i<farms.length;i++) {
			addWagons(farms[i]);
		}
	} else {
		for (var i=1;i<farms.length;i++) {
			if (farms[i].cells[0].textContent == koord) {
				addWagons(farms[i]);
				break;
			}
		}
	}
}
function addWagons(farmRow) {
	let koord = farmRow.cells[0].textContent;
	let attacks = ALL_UNIT_MOVEMENT[koord];
	
	farmRow.cells[5].innerHTML = ''; //Fixme: Nem csak ez van itt, ne töröld az egészet
	if (!attacks) return;
	attacks.sort((a, b) => a[1] - b[1]);
	const tmp = document.createElement('div');
	tmp.setAttribute('class', 'tooltip-wrapper');
	let tmp_content = '';
	let prodHour = DOMINFO_FARMS[koord].prodHour;
	attacks.forEach((attack, index) => {
		let wagonType = 'wagon_normal.png';
		if (attack[2] > (prodHour * 5)) wagonType = 'wagon_nuclear.png';
		else if (attack[2] > (prodHour * 2)) wagonType = 'wagon_coal.png';
		else if (attack[2] < 5 && attack[0] < 5) wagonType = 'wagon_empty.png';
		tmp_content += `
		<span onmouseenter="setTooltip(this, ${index})" class="tooltip_hover">
			<img src="${pic(wagonType)}?v=4" title="" width="40px">
			<span class="tooltip_text"></span>
		</span>`
	});
	tmp.innerHTML = tmp_content;
	farmRow.cells[5].appendChild(tmp);
}
function setTooltip(el, index) {
	let farmRow = el.closest('tr');
	let farmCoord = farmRow.cells[0].textContent;
	let attack = [...ALL_UNIT_MOVEMENT[farmCoord][index]];
	let min = convertTbToTime(farmRow.cells[1].textContent, attack[0]);
	let kezdet = new Date(attack[1]);
	kezdet.setSeconds(kezdet.getSeconds() - (min * 60));
	min = min.toFixed(2);

	let content = `<table class="no-bg-table">
		<tr><td>Szerelvény hossza</td><td><div class="flex_middle">${min} perc (<img src="${pic('resource.png')}"> ${attack[0]})</div></td></tr>
		<tr><td>Szerelvény kezdete</td><td>${kezdet.toLocaleString()}</td></tr>
		<tr><td>Érkezés</td><td>${new Date(attack[1]).toLocaleString()}</td></tr>
		<tr><td>Extra nyers</td><td><div class="flex_middle"><img src="${pic('resource.png')}"> ${attack[2]}</div></td></tr>
		<tr><td>Nyerstermelés/óra</td><td>${getProdHour(farmRow.cells[1].textContent)}</td></tr>
	</table>
	<i>Utolsó jelentés: ${ALL_VIJE_SAVED[farmCoord] ? new Date(ALL_VIJE_SAVED[farmCoord]).toLocaleString() : 'Nincs'}</i>`;
	addTooltip(el, content);
}
function add_farmolo(){ try{
	let addFaluk = document.getElementById('add_farmolo_faluk');
	let addUnits = document.getElementById('add_farmolo_egysegek').getElementsByTagName("input");
	var faluk = addFaluk.value;
	if (faluk == '') return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk = faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	let istarget=false;
	for (let j=0; j<addUnits.length; j++) {
		if (addUnits[j].checked==true) {
			istarget=true;
			break;
		}
	}
	if (!istarget) {
		if (!confirm('Nincs semmilyen egység megadva, amit küldhetnék. Folytatod?\n(később ez a megadás módosítható)')) return;
	}
	
	var dupla = '';
	for (var i=0;i<faluk.length;i++) {
		var a=document.getElementById("farm_honnan");
		var b=document.getElementById("farm_hova");
		for (var j=1;j<a.rows.length;j++) {
			if (a.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		for (var j=1;j<b.rows.length;j++) {
			if (b.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		if (koordTOid(faluk[i])==0) {dupla+=faluk[i]+", "; faluk[i]=""; continue;}
		
		var b=a.insertRow(-1);
		var c=b.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick",'sortorol(this,"honnan")');
		var c=b.insertCell(1); c.innerHTML=rovidit("egysegek");
		for (var j=0;j<c.getElementsByTagName("input").length;j++) {
			if (addUnits[j].checked == true) c.getElementsByTagName("input")[j].checked = true;
		}
		var c=b.insertCell(2); c.innerHTML=""; c.setAttribute("ondblclick",'urit(this,"honnan")');
	}
	addFaluk.value="";
	if (dupla!="") alert2("Dupla falumegadások, esetleg nem lévő saját faluk kiszűrve:\n" + dupla);
	return;	
}catch(e){alert(e);}}

function add_farmolando(){try{
	let addFarmolandoFaluk = document.getElementById('add_farmolando_faluk');
	var faluk = addFarmolandoFaluk.value;
	if (faluk == '') return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk = faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	var dupla='';
	let defaultProdHour = parseInt(document.getElementById('farmolo_options').termeles.value,10);
	for (var i=0;i<faluk.length;i++) {
		var a=document.getElementById("farm_hova");
		var b=document.getElementById("farm_honnan");
		for (var j=1;j<a.rows.length;j++) {
			if (a.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i] == '') continue;
		for (var j=1;j<b.rows.length;j++) {
			if (b.rows[j].cells[0].textContent==faluk[i]) {dupla+=faluk[i]+", "; faluk[i]=""; break;}
		}
		if (faluk[i]=="") continue;
		var a_row=a.insertRow(-1); 
		var c=a_row.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick","hattertolor(this)"); c.setAttribute("data-age","0");
		var c=a_row.insertCell(1); c.innerHTML=""; c.setAttribute("ondblclick",'sortorol(this,"hova")');
		var c=a_row.insertCell(2); c.innerHTML="0"; c.setAttribute("ondblclick","hattercsere(this)"); c.setAttribute("onmouseleave",'removeTooltip(this)');
		var c=a_row.insertCell(3); c.innerHTML="0"; c.setAttribute("ondblclick",'modosit_szam(this)');
		var c=a_row.insertCell(4); c.innerHTML='<input type="checkbox" onclick="szem4_farmolo_multiclick(0,\'hova\',this.checked)">';
		var c=a_row.insertCell(5); c.innerHTML=""; c.setAttribute("onmouseleave",'removeTooltip(this)');
		DOMINFO_FARMS[faluk[i]] = {
			prodHour: defaultProdHour,
			buildings: {},
			nyers: 0,
			isJatekos: false
		};
	}
		
	addFarmolandoFaluk.value="";
	if (dupla!="") alert2("Dupla falumegadások kiszűrve:\n"+dupla);
	return;	
}catch(e){alert(e);}}
function szem4_farmolo_multiclick(no,t,mire){try{
	if (!(document.getElementById("farm_multi_"+t).checked)) return;
	var x=document.getElementById("farm_"+t).rows;
	if (t=="honnan") t=1; else t=4;
	for (var i=1;i<x.length;i++) {
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
	for (var i=1;i<x.length;i++) {
		uj=false; jel=x[i].cells[0].textContent;
		switch(type) {
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
function getAllResFromVIJE(coord) {
	var allAttack = ALL_UNIT_MOVEMENT[coord];
	if (!allAttack) return 0;
	var allRes = 0;
	for (let att in allAttack) {
		allRes+=allAttack[att][2];
	}

	if (isNaN(allRes)) {debug('getAllResFromVIJE', 'allRes is NaN at ' + coord + ': ' + JSON.stringify(allAttack)); return 0;}
	return allRes;
}
function subtractNyersValue(coord, val) {
	var nyersTable = document.getElementById('farm_hova').rows;
	var cells;
	for (var i=1;i<nyersTable.length;i++) {
		cells = nyersTable[i].cells;
		if (cells[0].textContent == coord) {
			var oldValue = parseInt(cells[3].innerText,10);
			oldValue-=val;
			if (oldValue<0) oldValue=0;
			cells[3].innerHTML = oldValue;
			DOMINFO_FARMS[coord].nyers = oldValue;
			break;
		}
	}
}
function clearAttacks() {try{
	const currentTime = new Date().getTime();
	for (let item in ALL_UNIT_MOVEMENT) {
		// Current utáni érkezések kivágása
		var outdatedArrays = [];
		for (var i=ALL_UNIT_MOVEMENT[item].length-1;i>=0;i--) {
			// Ha VIJE nyersért ment csak, töröljük
			if (ALL_UNIT_MOVEMENT[item][i][1] <= currentTime && ALL_UNIT_MOVEMENT[item][i][0] < 30) {
				subtractNyersValue(item, ALL_UNIT_MOVEMENT[item][i][2]);
				ALL_UNIT_MOVEMENT[item].splice(i, 1);
				drawWagons(item);
				continue;
			}
			if (ALL_UNIT_MOVEMENT[item][i][1] <= currentTime - (MAX_IDO_PERC * 60000 * 2)) { // Kuka, ha nagyon régi
				ALL_UNIT_MOVEMENT[item].splice(i, 1);
				drawWagons(item);
				continue;
			}
			if (ALL_UNIT_MOVEMENT[item][i][1] <= currentTime) outdatedArrays.push(ALL_UNIT_MOVEMENT[item][i]);
		}
		// Beérkezett támadások nyerstörlése
		if (!outdatedArrays) continue;
		for (let movement of outdatedArrays) {
			if (movement.length != 3) {
				debug('clearAttacks', 'Anomaly, nem szabályszerű mozgás ('+item+'):'+JSON.stringify(movement)+' -- össz:'+JSON.stringify(outdatedArrays));
			}
			if (movement[2] > 0) {
				subtractNyersValue(item, movement[2]);
				movement[2] = 0;
			}
		}

		if (outdatedArrays.length < 2) continue;
		// Leghamarábbi keresése
		var closestArray = outdatedArrays.reduce(function(prev, current) {
			return (current[1] > prev[1]) ? current : prev;
		}, outdatedArrays[0]);

		ALL_UNIT_MOVEMENT[item] = ALL_UNIT_MOVEMENT[item].filter(function(array) {
			return array[1] >= closestArray[1];
		});
		drawWagons(item);
	}
	for (let item in ALL_VIJE_SAVED) {
		if (ALL_VIJE_SAVED[item] < currentTime - (3 * 60 * 60000)) {
			subtractNyersValue(item, 400000);
			delete ALL_VIJE_SAVED[item];
		}
	}
}catch(e) {debug('clearAttacks', e);}}

function getProdHour(banyaszintek) {
	var prodHour = 0;
	if (banyaszintek.split(',').length < 3) {
		prodHour=document.getElementById("farmolo_options").termeles.value;
		if (prodHour!="") prodHour=parseInt(prodHour, 10); else prodHour=1000;
	} else {
		var r=banyaszintek.split(",").map(item => parseInt(item, 10));
		prodHour=(TERMELES[r[0]]+TERMELES[r[1]]+TERMELES[r[2]])*SPEED;
	}
	return prodHour;
}
function getResourceProduction(banyaszintek, idoPerc) {try{
	// idoPerc alatt termelt mennyiség. idoperc MAX=megbízhatósági idő, vagy amennyi idő megtermelni határszám-nyi nyerset
	// var corrigatedMaxIdoPerc = getCorrigatedMaxIdoPerc(banyaszintek);
	if (idoPerc == 'max') idoPerc = parseInt(document.getElementById('farmolo_options').megbizhatosag.value, 10);
	// if (idoPerc == 'max') idoPerc = corrigatedMaxIdoPerc;

	prodHour = getProdHour(banyaszintek);
	
	var idoOra = idoPerc/60;
	return Math.round(prodHour * idoOra);
}catch(e) {debug('getResourceProduction', e);}}
function convertTbToTime(banyaszintek, tb) {
	var termeles = getProdHour(banyaszintek); // 1000 
	var idoPerc = (tb / termeles) * 60;
	return idoPerc;
}
function calculateNyers(farmCoord, banyaszintek, travelTime) {try{
	// Kiszámolja a többi támadásokhoz képest, mennyi a lehetséges nyers, kivonva amiért már megy egység.
	// Az érkezési idő +-X perc közötti rablási lefedettséget néz
	var foszthatoNyers = 0;
	var arriveTime = new Date();
	arriveTime.setSeconds(arriveTime.getSeconds() + (travelTime *60));
	arriveTime = arriveTime.getTime();
	if (!ALL_UNIT_MOVEMENT[farmCoord]) {
		foszthatoNyers = getResourceProduction(banyaszintek, 'max');
		return foszthatoNyers;
	}
	allAttack = ALL_UNIT_MOVEMENT[farmCoord];
	// Vonat:   [ ---- lastBefore ----|]        [ ---- firstAfter ---- |]
	//                         [ ---- arriveTime ----|]
	var closests = findClosestTimes(allAttack, arriveTime);
	var lastBefore = closests[0],
		firstAfter = closests[1];
	if (lastBefore) {
		foszthatoNyers+=getResourceProduction(banyaszintek, (arriveTime - lastBefore[1]) / 60000);
	} else {
		foszthatoNyers+=getResourceProduction(banyaszintek, 'max');
	}

	if (firstAfter) {
		let prodHour = getProdHour(banyaszintek);
		let minimumFrom = 0;

		for (let i=0; i<allAttack.length; i++) {
			if (allAttack[i][1] > arriveTime) {
				let lefedesIdo = (allAttack[i][0] / prodHour) * 60 * 60000
				let from = allAttack[i][1] - lefedesIdo;
				if (minimumFrom == 0 || minimumFrom > from) minimumFrom = from;
			}
		}
		if (minimumFrom < arriveTime)
			foszthatoNyers -= getResourceProduction(banyaszintek, (arriveTime - minimumFrom) / 60000);
	}
	return foszthatoNyers;
}catch(e) {debug('calculateNyers', e);}}
function findClosestTimes(allAttack, arriveTime) {
	let lastBefore = null;
	let firstAfter = null;

	for (let i=0; i<allAttack.length; i++) {
		if (allAttack[i][0] < 50) continue;
		let d = allAttack[i][1];
		if (d < arriveTime) {
			if (!lastBefore || d > lastBefore[1]) lastBefore = allAttack[i];
		} else if (d > arriveTime) {
			if (!firstAfter || d < firstAfter[1]) firstAfter = allAttack[i];
		}
	}

	return [lastBefore, firstAfter];
}
function addCurrentMovementToList(formEl, farmCoord, farmHelyRow) {try{
	var patternOfIdo = /<td>[0-9]+:[0-9]+:[0-9]+<\/td>/g;
	var travelTime = formEl.innerHTML.match(patternOfIdo)[0].match(/[0-9]+/g);
	travelTime = parseInt(travelTime[0],10) * 3600 + parseInt(travelTime[1],10) * 60 + parseInt(travelTime[2],10);
	var arriveTime = new Date();
	arriveTime.setSeconds(arriveTime.getSeconds() + travelTime);
	if (arriveTime < new Date()) {debug('addCurrentMovementToList', 'CRITICAL ERROR: Negatív útidő'); debugger; return;}
	arriveTime = arriveTime.getTime();

	var teherbiras = parseInt(formEl.querySelector('.icon.header.ressources').parentElement.innerText.replaceAll('.',''), 10);
	var VIJE_teher = 0;
	var VIJE_nyers = parseInt(farmHelyRow.cells[3].textContent,10);
	if (VIJE_nyers > 0) {
		VIJE_nyers-=getAllResFromVIJE(farmCoord);
		if (VIJE_nyers > 0) {
			VIJE_teher = Math.min(teherbiras, VIJE_nyers);
			teherbiras-=VIJE_teher;
		}
	}

	if (teherbiras < 10 && VIJE_teher < 10) {
		debug('addCurrentMovementToList', `ERROR: ${formEl.querySelector('.icon.header.ressources').parentElement.innerText} -- teherbírás=0; Farm: ${farmCoord} | Innen: ${FARM_REF.game_data.village.display_name}`);
	}
	var allAttack = ALL_UNIT_MOVEMENT[farmCoord];
	if (!allAttack) {
		ALL_UNIT_MOVEMENT[farmCoord] = [[teherbiras, arriveTime, VIJE_teher]];
	} else {
		allAttack.push([teherbiras, arriveTime, VIJE_teher]);
	}
	drawWagons(farmCoord);
	// KÉM?
	if (!FARM_REF.document.getElementById('place_confirm_units').querySelector('[data-unit="spy"]').getElementsByTagName('img')[0].classList.contains('faded')) {
		if (!ALL_SPY_MOVEMENTS[farmCoord] || ALL_SPY_MOVEMENTS[farmCoord] < arriveTime) ALL_SPY_MOVEMENTS[farmCoord] = arriveTime;
	}
}catch(e) {debug('addCurrentMovementToList', e); console.error(e);}}

function planAttack(farmRow, nyers_VIJE, bestSpeed) {try{
// Megtervezi, miből mennyit küldjön SZEM. Falu megnyitása után intelligensen még módosíthatja ezt (2. lépés) (nem változtatva a MAX_SPEED-et)
	const attackers = document.getElementById('farm_honnan').rows;
	let farmCoord = farmRow.cells[0].textContent;
	const allOptions = document.getElementById('farmolo_options');
	const targetIdo = parseInt(allOptions.targetIdo.value,10);
	const prodHour = DOMINFO_FARMS[farmCoord].prodHour;
	const hatarszam = prodHour * (targetIdo / 60);
	const minSereg = parseInt(allOptions.minsereg.value,10);
	const maxTavPerc = parseInt(allOptions.maxtav_ora.value,10) * 60 + parseInt(allOptions.maxtav_p.value,10);
	let plan = {};

	for (var i=1;i<attackers.length;i++) {
		let attacker = attackers[i];
		let unifiedTraverTime = (1/SPEED)*(1/UNIT_S);
		unifiedTraverTime = unifiedTraverTime*(distCalc(farmCoord.split("|"), attacker.cells[0].textContent.split("|"))); /*a[i]<->fromVillRow távkeresés*/
		
		// Távolásszűrő: MAX távon belüli, legjobb?
		let priority = getSlowestUnit(attacker);
		if (priority == '') continue;
		while(true) {
			if (unifiedTraverTime * E_SEB[priority] > maxTavPerc) {
				if (priority == 'heavy') {
					if (unifiedTraverTime * E_SEB.light > maxTavPerc) break;
					priority = 'light'; // Talán!
				} else if (priority == 'sword') {
					if (unifiedTraverTime * E_SEB.spear > maxTavPerc) break;
					priority = 'spear'; // Talán!
				} else break;
			}
			let myTime = unifiedTraverTime * E_SEB[priority];
			if (bestSpeed !== -1 && myTime > bestSpeed) break;

			// Mennyi nyerset tudnék hozni? Határszámon belül van?
			let nyers_termeles = calculateNyers(farmCoord, farmRow.cells[1].textContent, myTime);
			if (isNaN(nyers_termeles)) { nyers_termeles = 0; debug('planAttack', `nyers_termeles = NaN - ${farmCoord}`); }
			if (isNaN(nyers_VIJE)) { nyers_VIJE = 0; debug('planAttack', `nyers_VIJE = NaN - ${farmCoord}`); } 
			if (!(Number.isInteger(nyers_VIJE) && Number.isInteger(nyers_termeles))) debug('planAttack', `Nem is szám: nyers_VIJE=${nyers_VIJE} -- nyers_termeles=${nyers_termeles}`);
			let teher = nyers_VIJE + nyers_termeles;
			if (teher < hatarszam) {
				if (priority == 'heavy' || priority == 'light') {
					priority = 'sword';
					continue;
				}
				break;
			}

			// buildArmy - mivel getSlowestUnit kérés volt, így ebből az egységből biztos van, nem lehet 0
			let plannedArmy = buildArmy(attacker, priority, teher); // FIXME: Minsereg-et nem veszi figyelembe! Csak h határszámnyi termelődik, de.. az nem elég! A minSereg több
			if (plannedArmy.units.pop == 0) {
				break;
			}
			if (plannedArmy.units.pop < minSereg) break;
			bestSpeed = myTime;
			plan = {
				fromVill: attacker.cells[0].textContent,
				farmVill: farmCoord,
				units: {...plannedArmy.units},
				travelTime: myTime,
				slowestUnit: priority,
				nyersToFarm: teher
			};
			break;
		}
	}
	return plan;
	//	Megállapítani, mennyi nyersért kell menni , prió heavy > light > sword ...
	//		Megnézi pl. heavy-vel, ha nem 0 van belőle: erre számol egyet.
	//			Ha a távolság > min(eddigi_legjobb_terv, bestSpeed): újratervezés kl-ekkel (csak heavy/sword esetén!) (!! bestSpeed=0 -> nincs még legjobb)
	//			Ha ez határszám alatti: újratervezés gyalogosokkal
	//			Ha max táv-on túl van: újratervezés light/march-al (csak heavy esetén!)
	//			Ha TERV során nem tudtunk elég egységet megfogni, újratervezés gyalogosokkal
	//	Ha a végén üres az eddigi_legjobb_terv, akkor return "NO_PLAN"; -> ugrás a következő farmra
}catch(e) {console.error(e); debug('planAttack', e);}}
function buildArmy(attackerRow, priorityType, teher) {try{
	let originalTeher = teher;
	const unitEls = attackerRow.cells[1].querySelectorAll('.szem4_unitbox');
	const availableUnits = UNITS.reduce((obj, unit) => {
		obj[unit] = 0;
		return obj;
	}, {});
	let isOld = false;
	if (new Date() - new Date(attackerRow.cells[2].textContent) > 600000) isOld = true;
	unitEls.forEach(unitEl => {
		if (unitEl.querySelector('input').checked) {
			if (isOld) {
				unitEl.setAttribute('data-allunit', 999);
			}
			availableUnits[unitEl.getAttribute('name')] = parseInt(unitEl.getAttribute('data-allunit'), 10);
		}
	});

	const unitToSend = { pop: 0 };
	let temp_plan = {};
	switch (priorityType) {
		// ----------- LOVASSÁG -------------
		case 'heavy':
			temp_plan = useUpUnit('heavy', teher);
			if (temp_plan.pop == 0)
				return {
					units: unitToSend,
					teher: originalTeher - teher
				};
			teher -= temp_plan.teher;
			unitToSend.heavy = temp_plan.unit;
			unitToSend.pop += temp_plan.pop;
			if (teher < 40)	break;
		case 'light':
			temp_plan = useUpUnit('marcher', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.marcher = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			if (teher < 40)	break;

			temp_plan = useUpUnit('light', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.light = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			break;
		// ----------- GYALOGOS -------------
		case 'sword':
			temp_plan = useUpUnit('sword', teher);
			if (temp_plan.pop == 0)
				return {
					units: unitToSend,
					teher: originalTeher - teher
				};
			teher -= temp_plan.teher;
			unitToSend.sword = temp_plan.unit;
			unitToSend.pop += temp_plan.pop;
			if (teher < 40)	break;
		case 'spear':
			temp_plan = useUpUnit('spear', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.spear = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			if (teher < 20)	break;

			temp_plan = useUpUnit('axe', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.axe = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			if (teher < 20)	break;

			temp_plan = useUpUnit('archer', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.archer = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			break;
	}

	return {
		units: unitToSend,
		teher: originalTeher - teher
	};

	function useUpUnit(type, teher) {
		const usedUp = {
			pop: 0,
			unit: 0,
			teher: 0
		}
		if (availableUnits[type] < 1) return usedUp;
		if (availableUnits[type] * TEHER[type] > teher) {
			usedUp.unit = Math.round(teher / TEHER[type]);
		} else {
			usedUp.unit = availableUnits[type];
		}
		usedUp.pop = usedUp.unit * TANYA[type];
		usedUp.teher = usedUp.unit * TEHER[type];
		return usedUp;
	}
}catch(e) {console.error(e); debug('buildArmy', e);}}

function getSlowestUnit(faluRow) {try{
	// Get unit speed of the smallest available, but priorize horse
	// heavy > light,marcher > sword > spear,axe,archer
	let isOld = false; // FIXME: Ha isOld, akkor futtassunk egy CLEAR-t, ami leszedi a class-t, és 999-re teszi a unitokat. OLD az 15p * (1/világ_sebesség) legyen már!
	let lastChecked = faluRow.cells[2].textContent;
	if (lastChecked != '') {
		lastChecked = new Date(lastChecked);
		if (!(lastChecked instanceof Date && !isNaN(lastChecked.valueOf()))) lastChecked = '';
	}
	const resetMinute = parseInt(document.getElementById('farmolo_options').sebesseg_p.value,10);
	if (lastChecked == '' || new Date() - lastChecked > resetMinute * 60000) {
		isOld = true;
	}

	const units = faluRow.cells[1].querySelectorAll('.szem4_unitbox');
	const available_units = {};
	isUnit = false;
	units.forEach(el => {
		if (isOld && el.querySelector('input').checked) el.classList.remove('szem4_unitbox_not_available');
		if (el.getAttribute('name') !== 'spy' && el.querySelector('input').checked && !el.classList.contains('szem4_unitbox_not_available')) {
			available_units[el.getAttribute('name')] = true;
			isUnit = true;
		}
	});
	if (available_units.heavy) return 'heavy';
	if (available_units.light || available_units.marcher) return 'light';
	if (available_units.sword) return 'sword';
	if (isUnit) return 'spear';
	return '';
}catch(e) { debug('getSlowestUnit','Nem megállapítható egységsebesség, kl-t feltételezek ' + e); return E_SEB_ARR[5];}}
function updateAvailableUnits(faluRow, isError=false) {try{
	var units = faluRow.cells[1].querySelectorAll('.szem4_unitbox');
	units.forEach(el => {
		let unit = el.getAttribute('name');
		let allUnit = parseInt(FARM_REF.document.getElementById(`units_entry_all_${unit}`).textContent.match(/[0-9]+/g)[0],10);
		let unitToSendString = FARM_REF.document.getElementById(`unit_input_${unit}`).value;
		if (unitToSendString == '') unitToSendString = 0;
		let unitToSend = isError ? 0 : parseInt(unitToSendString,10);
		el.setAttribute('data-allunit', allUnit - unitToSend);
		if (allUnit == 0 || (allUnit - unitToSend) <= 0) {
			el.classList.add('szem4_unitbox_not_available');
		} else {
			el.classList.remove('szem4_unitbox_not_available');
		}
	});
	faluRow.cells[2].innerHTML = new Date().toLocaleString();
}catch(e) { console.error(e); debug('updateAvailableUnits', e);}}
function setNoUnits(faluRow, unitType) {try{
	var units = faluRow.cells[1].querySelectorAll('.szem4_unitbox');
	units.forEach(el => {
		let unit = el.getAttribute('name');
		//UNITS=new Array("spear","sword","axe","archer","spy","light","marcher","heavy"),
		if (unitType == 'troop' && (unit == 'spear' || unit == 'sword' || unit == 'axe' || unit == 'archer')) {
			el.classList.add('szem4_unitbox_not_available');
			el.setAttribute('data-allunit', 0);
		}
		if (unitType == 'horse' && (unit == 'light' || unit == 'marcher' || unit == 'heavy')) {
			el.classList.add('szem4_unitbox_not_available');
			el.setAttribute('data-allunit', 0);
		}
		if (unitType == 'all') {
			el.classList.add('szem4_unitbox_not_available');
			el.setAttribute('data-allunit', 0);
		}
	});
	faluRow.cells[2].innerHTML = new Date().toLocaleString();
}catch(e) { console.error(e); debug('updateAvailableUnits', e);}}

function szem4_farmolo_1kereso(){try{/*Farm keresi párját :)*/
	var farmList = document.getElementById("farm_hova").rows;
	var attackerList = document.getElementById("farm_honnan").rows;
	if (farmList.length == 1 || attackerList.length == 1) return "zero";
	// var 
	var verszem = false;
	const targetIdo = parseInt(document.getElementById("farmolo_options").targetIdo, 10);

	let bestPlan = { travelTime: -1 };
	for (var i=1;i<farmList.length;i++) {
		if (farmList[i].cells[0].style.backgroundColor=="red") continue;
		var farmCoord = farmList[i].cells[0].textContent;
		let prodHour = DOMINFO_FARMS[farmCoord].prodHour;
		let hatarszam = prodHour * (targetIdo / 60);
		var nyers_VIJE = parseInt(farmList[i].cells[3].textContent,10);
		if (nyers_VIJE > 0) nyers_VIJE -= getAllResFromVIJE(farmCoord);
		verszem = false;
		if (nyers_VIJE > (hatarszam * 4)) verszem = true;
		
		/*Farm vizsgálat (a[i]. sor), legközelebbi saját falu keresés hozzá (van e egyátalán (par.length==3?))*/
		let attackPlan = planAttack(farmList[i], nyers_VIJE, verszem ? -1 : bestPlan.travelTime);
		
		if (attackPlan.travelTime && (bestPlan.travelTime == -1 || attackPlan.travelTime < bestPlan.travelTime)) {
			bestPlan = JSON.parse(JSON.stringify(attackPlan));
		}
		if (verszem && attackPlan.travelTime) {
			bestPlan = JSON.parse(JSON.stringify(attackPlan));
			break;
		}
	}

	return bestPlan;
}catch(e){debug('szem4_farmolo_1kereso()',e); return 'ERROR';}}

function szem4_farmolo_2illeszto(bestPlan){try{/*FIXME: határszám alapján számolódjon a min. sereg*/
	/*adatok: [0:Becsült útidő; 1:Használandó egység alapsebessége; 2:koord-honnan; 3:koord-hova; 4:nyers]*/
	/*Lovat a gyalogossal együtt nem küld. Ha adatok[1]=="all" -->ló megy. Ha az nincs, majd return-ba rászámolunk*/
	try{TamadUpdt(FARM_REF);}catch(e){}
	const allOptions = document.getElementById('farmolo_options');
	const minSereg = parseInt(allOptions.minsereg.value,10);
	const kemPerMin = parseInt(allOptions.kemperc.value,10);
	const kemdb = parseInt(allOptions.kemdb.value,10);
	const raktarLimit = parseInt(allOptions.raktar.value,10);
	const targetIdo = parseInt(allOptions.targetIdo.value,10);
	const hatarszam = DOMINFO_FARMS[bestPlan.farmVill].prodHour * (targetIdo / 60);
	var C_form=FARM_REF.document.forms["units"];

	if (C_form["input"].value == undefined) {
		throw "Nem töltött be az oldal?"+C_form["input"].innerHTML;
	}
	
	var falu_helye=document.getElementById("farm_honnan").rows;
	var falu_row;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==bestPlan.fromVill) {
			falu_row = falu_helye[i];
			break;
		}
	}
	updateAvailableUnits(falu_row);
	//attackerRow, priorityType, teher
	const plannedArmy = buildArmy(falu_row, bestPlan.slowestUnit, bestPlan.nyersToFarm);
	if (!plannedArmy.units || plannedArmy.units.pop == 0 || plannedArmy.units.pop < minSereg || plannedArmy.teher < hatarszam) {
		return 'semmi'; // FIXME: Nem jó, újratervezés
	}
	bestPlan.nyersToFarm = plannedArmy.teher;

	Object.entries(plannedArmy.units).forEach(entry => {
		const [unit, unitToSend] = entry;
		if (unit !== 'pop') {
			C_form[unit].value = unitToSend;
		}
	});

	// KÉMEK
	C_form.spy.value=0;
	let kemToSend = 0;
	if (falu_row.cells[1].getElementsByTagName("input")[4].checked) {
		var ut_perc = distCalc(bestPlan.fromVill.split('|'), bestPlan.farmVill.split('|')) * E_SEB[bestPlan.slowestUnit] * (1/SPEED)*(1/UNIT_S);
		var erk = new Date(); erk=erk.setSeconds(erk.getSeconds() + (ut_perc *60));
		
		if (!ALL_SPY_MOVEMENTS[bestPlan.farmVill] || (erk - ALL_SPY_MOVEMENTS[bestPlan.farmVill]) > (kemPerMin * 60000)) {
			let kemElerheto = FARM_REF.document.getElementById("unit_input_spy").parentNode.children[2].textContent.match(/[0-9]+/g)[0]
			kemElerheto = parseInt(kemElerheto, 10);
			kemToSend = (kemElerheto >= kemdb ? kemdb : 0)
			C_form.spy.value= kemToSend;
		}
	}

	/*Raktár túltelített?*/
	var nyersarany=((FARM_REF.game_data.village.wood+FARM_REF.game_data.village.stone+FARM_REF.game_data.village.iron) / 3) / FARM_REF.game_data.village.storage_max;
	/*debug("Illeszt","Nyersarány: "+Math.round(nyersarany*100)+", limit: "+parseInt(raktarLimit));*/
	if (Math.round(nyersarany*100)>parseInt(raktarLimit)) {
		setNoUnits(falu_row, 'all');
		naplo('Farmoló', 'Raktár túltelített ebben a faluban: ' + bestPlan.fromVill + '. (' + Math.round(nyersarany*100) + '% > ' + raktarLimit + '%)');
		return "semmi";
	}

	C_form.x.value=bestPlan.farmVill.split("|")[0];
	C_form.y.value=bestPlan.farmVill.split("|")[1];
	
	updateAvailableUnits(falu_row);
	C_form.attack.click();

	bestPlan.units = JSON.parse(JSON.stringify(plannedArmy.units));
	return {
		plannedArmy: bestPlan,
		kem: kemToSend
	};
	//return [resultInfo.requiredNyers,ezt+'',adatok[2],adatok[3],slowestUnit,kek,resultInfo.debugzsak]; /*nyers_maradt;all/gyalog/semmi;honnan;hova;speed_slowest;kém ment e;teherbírás*/
}catch(e){debug("Illeszto()",e);FARM_LEPES=0;return "";}}

function szem4_farmolo_3egyeztet(adatok){try{
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==adatok.plannedArmy.fromVill) {falu_helye=falu_helye[i]; break;}
	}
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==adatok.plannedArmy.farmVill) {farm_helye=farm_helye[i]; break;}
	}
	
	/*Piros szöveg*/
	try {
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].getAttribute("class")=="error_box") {
			naplo("Farmoló", `Hiba  ${adatok.plannedArmy.farmVill} farmolásánál: ${FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].textContent}. Tovább nem támadom`);
			farm_helye.cells[0].style.backgroundColor="red";
			DOMINFO_FARMS[adatok.plannedArmy.farmVill].color = 'red';
			if (FARM_REF.document.querySelector('.village-item')) {
				FARM_REF.document.querySelector('.village-item').click();
			}
			updateAvailableUnits(falu_helye, true);
			return "ERROR";
		}
	}catch(e){ console.error('szem4_farmolo_3egyeztet - piros szöveg', e); }
	
	/*Játékos-e?*/	
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].getElementsByTagName("a")[0].href.indexOf("info_player")>-1) {
			if (!farm_helye.cells[4].getElementsByTagName("input")[0].checked) {
				naplo("Farmoló", `Játékos ${maplink(adatok.plannedArmy.farmVill)} helyen: ${FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].innerHTML.replace("href",'target="_BLANK" href')}. Tovább nem támadom`);
				FARM_REF = windowOpener('farm', VILL1ST.replace("screen=overview","screen=place"), AZON+"_Farmolo"); // Ki kell ütni a nézetből
				farm_helye.cells[0].style.backgroundColor="red";
				updateAvailableUnits(falu_helye, true);
				return "ERROR";
			}
		}
	}catch(e){ /* Nem az... */ }

	/* TravelTime egyezik? */
	let timeFormatted = FARM_REF.document.querySelector('#content_value .vis').rows[2].cells[1].textContent;
	let writedTime = timeFormatted.split(':').map((a) => parseInt(a, 10));
	writedTime = writedTime[0] * 60 + writedTime[1] + (writedTime[2] / 60);
	if (Math.abs(writedTime - adatok.plannedArmy.travelTime) > 0.05) {
		debug('szem4_farmolo_3egyeztet', `A tervezett idő (${adatok.plannedArmy.travelTime} perc) nem egyezik a küldendő idővel: ${timeFormatted}.`);
		debugger;
		return "ERROR";
	}

	/* Teherbírás egyezik? */
	// try{
	// 	var a = FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows;
	// 	a = parseInt(a[a.length-1].cells[0].textContent.replace(/[^0-9]+/g,""));
	// 	if (adatok.plannedArmy.nyersToFarm != a) debug("farm3","Valódi teherbírás nem egyezik a kiszámolttal. Hiba, ha nincs teherbírást módosító \"eszköz\".");
	// }catch(e){ console.error('szem4_farmolo_3egyeztet - teherbiras',e) }

	/* KÉK háttér bányára? */
	if (adatok.kem > 0 && farm_helye.cells[1].textContent == '') farm_helye.cells[1].style.backgroundColor="rgb(213, 188, 244)";

	addCurrentMovementToList(FARM_REF.document.getElementById('command-data-form'), adatok.plannedArmy.farmVill, farm_helye);
	FARM_REF.document.getElementById("troop_confirm_submit").click();
	document.getElementById('cnc_farm_heartbeat').innerHTML = new Date().toLocaleString();
	const megbizhatosag = parseInt(document.getElementById('farmolo_options').megbizhatosag, 10);
	const prodHour = DOMINFO_FARMS[adatok.plannedArmy.farmVill].prodHour
	if (adatok.plannedArmy.nyersToFarm > (prodHour * (megbizhatosag / 60) * 3)) {
		playSound(`farmolas_exp`, 'mp3');
	} else {
		playSound(`farmolas_${Math.floor(1 + Math.random() * (11 - 1 + 1))}`, 'mp3');
	}
	// return [nez,sarga,adatok[2],adatok[3]];
	/*Legyen e 3. lépés;sárga hátteres idő lesz?;honnan;---*/
}catch(e){debug("szem4_farmolo_3egyeztet()",e); FARM_LEPES=0;}}

function szem4_farmolo_4visszaell(adatok){try{
	/*
		true,sarga?,honnan,hova
		vagy
		nyers_maradt(db);all/gyalog + semmi;honnan;hova;speed_slowest
	*/
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i]; break;}
	}
	updateAvailableUnits(falu_helye, true);
	
	if (typeof adatok[1]=="boolean") var lehetEGyalog=adatok[1]; else {
		if (adatok[1].indexOf("all")>-1) var lehetEGyalog=true; else var lehetEGyalog=false;
	}

	if (lehetEGyalog) { /*Sárga; de ha nincs gyalog->fehér*/
		var backtest=false;
		for (var i=0;i<3;i++) {
			if (falu_helye.cells[1].getElementsByTagName("input")[i].checked) {
				if (FARM_REF.document.getElementById("unit_input_"+UNITS[i])) {
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
	for (var i=0;i<a.length;i++) {
		if (i==4) continue;
		if (a[i].checked && E_SEB_ARR[i]<fastest) fastest=E_SEB_ARR[i];
	}
	fastest = fastest*(1/SPEED)*(1/UNIT_S);
	
}catch(e){debug("szem4_farmolo_4visszaell()",e); return;}}

function szem4_farmolo_motor(){try{
	var nexttime=500;
	nexttime = parseInt(document.getElementById("farmolo_options").sebesseg_m.value,10);
	
	if (BOT||FARM_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	/*if (FARM_REF!="undefined" && FARM_REF.closed) FARM_LEPES=0;*/
	if (FARM_HIBA>10) {
		FARM_HIBA=0; FARM_GHIBA++; FARM_LEPES=0;
		if(FARM_GHIBA>3) {
			if (FARM_GHIBA>5) {
				naplo("Globál","Nincs internet? Folyamatos hiba farmolónál");
				nexttime = 60000;
				playSound("bot2");
			}
			FARM_REF.close();
		}
	}
	switch (FARM_LEPES) {
		case 0: /*Meg kell nézni mi lesz a célpont, +nyitni a HONNAN-t.*/
				PM1=szem4_farmolo_1kereso();
				if (PM1=="zero" || PM1=="ERROR") {nexttime=10000; break;} /* Ha nincs még tábla feltöltve */
				if (PM1.travelTime == -1) { // Nincs munka
						nexttime=parseInt(document.getElementById("farmolo_options").sebesseg_p.value,10);
						debug('Farmoló', `Farmoló pihenni megy ${nexttime} percre`);
						nexttime*=60000;
						try {
							if (MOBILE_MODE)
								FARM_REF.close();
							else
								FARM_REF.document.title = 'Szem4/farmoló';
						} catch(e) {}
						break;
				}
				if (!isPageLoaded(FARM_REF,koordTOid(PM1.fromVill),"screen=place") || FARM_REF.document.location.href.indexOf("try=confirm") > -1) {
					FARM_REF=windowOpener('farm', VILL1ST.replace(/village=[0-9]+/,"village="+koordTOid(PM1.fromVill)).replace("screen=overview","screen=place"), AZON+"_Farmolo");
				}
				/*debug("Farmoló_ToStep1",PM1);*/
				FARM_LEPES=1;
				break;
		case 1: /*Gyül.helyen vagyunk, be kell illeszteni a megfelelő sereget, -nyers.*/ 
				if (isPageLoaded(FARM_REF,koordTOid(PM1.fromVill),"screen=place")) {
					FARM_REF.document.title = 'Szem4/farmoló';
					FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_2illeszto(PM1);
					if (PM1 === 'semmi') 
						FARM_LEPES = 0;
					else
						FARM_LEPES = 2;
				} else {FARM_HIBA++;}
				break;
		case 2: /*Confirm: nem e jött piros szöveg, játékos e -> OK-ézás.*/ 
				if (!PM1.plannedArmy || !PM1.plannedArmy.fromVill) {
					FARM_LEPES = 0;
					debug('szem4_farmolo_motor', 'Érvénytelen állapot' + (typeof PM1 === 'object' ? JSON.parse(PM1) : PM1));
					break;
				}
				if (isPageLoaded(FARM_REF,koordTOid(PM1.plannedArmy.fromVill),"try=confirm")) {
					FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_3egyeztet(PM1);
					if (PM1 === 'ERROR') FARM_LEPES = 0;
					// if (typeof(PM1)=="object" && PM1.length>0 && PM1[0]==true) { FARM_LEPES=3; } else FARM_LEPES=0;
					FARM_LEPES = 0;
				} else {FARM_HIBA++;}
				break;
		case 3: /* SOSEM KELL? Jelenleg nem megyek ide */
				/*Támadás elküldve, időt és ID-t nézünk, ha kell.*/ 
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
try{
	worker.postMessage({'id': 'farm', 'time': nexttime});
}catch(e){debug('farm', 'Worker engine error: ' + e);setTimeout(function(){szem4_farmolo_motor();}, 3000);}}

init();
ujkieg_hang("Alaphangok","naplobejegyzes;bot2;farmolas");
ujkieg("farm","Farmoló",`<tr><td>
	<table class="vis" id="farm_opts" style="width:100%; margin-bottom: 50px;">
		<tr>
			<th colspan="2">Beállítások</th>
		</tr>
		<tr>
			<td colspan="2" style="text-align: center">
			<form id="farmolo_options">
			Menetrend: <input name="targetIdo" value="30" onkeypress="validate(event)" type="text" size="2" onmouseover="sugo(this, 'Elvárt vonathossz. Ennyi ideig létrejött termelésért indul')">p - 
			<input name="megbizhatosag" value="60" onkeypress="validate(event)" type="text" size="2" onmouseover="sugo(this, 'Megbízhatóság. MAX ennyi ideig létrejött termelésért indul')">p
			Max táv: <input name="maxtav_ora" type="text" size="2" value="4" onkeypress="validate(event)" onmouseover="sugo(this,'A max távolság, amin túl már nem küldök támadásokat')">óra <input name="maxtav_p" onkeypress="validate(event)" type="text" size="2" value="0" onmouseover="sugo(this,'A max távolság, amin túl már nem küldök támadásokat')">perc.
<br>
			Termelés/óra: <input name="termeles" onkeypress="validate(event)" type="text" size="5" value="800" onmouseover="sugo(this,'Ha nincs felderített bányaszint, úgy veszi ennyi nyers termelődik ott óránként')">				
			Min sereg/falu: <input name="minsereg" onkeypress="validate(event)" type="text" value="20" size="4" onmouseover="sugo(this,'Ennél kevesebb fő támadásonként nem indul. A szám tanyahely szerinti foglalásban értendő. Javasolt: Határszám 1/20-ad része')">
			Ha a raktár &gt;<input name="raktar" onkeypress="validate(event)" type="text" size="2" onmouseover="sugo(this,'Figyeli a raktár telítettségét, és ha a megadott % fölé emelkedik, nem indít támadást onnan. Telítettség össznyersanyag alapján számolva. Min: 20. Ne nézze: 100-nál több érték megadása esetén.')" value="90">%, nem foszt.
<br>
			Kém/falu: <input name="kemdb" onkeypress="validate(event)" type="text" value="1" size="2" onmouseover="sugo(this,'A kémes támadásokkal ennyi kém fog menni')">
			Kényszerített?<input name="isforced" type="checkbox" onmouseover="sugo(this,'Kémek nélkül nem indít támadást, ha kéne küldenie az időlimit esetén. Kémeket annak ellenére is fog vinni, ha nincs bepipálva a kém egység')">
			Kém/perc: <input name="kemperc" type="text" value="60" onkeypress="validate(event)" size="3" onmouseover="sugo(this,'Max ekkora időközönként küld kémet falunként')">
<br>
			Sebesség: <input name="sebesseg_p" onkeypress="validate(event)" type="text" size="2" value="10"  onmouseover="sugo(this,'Ha a farmoló nem talál több feladatot magának megáll, ennyi időre. Érték lehet: 1-300. Javasolt érték: 15 perc')">perc/
						<input name="sebesseg_m" onkeypress="validate(event)" type="text" size="3" value="900" onmouseover="sugo(this,'Egyes utasítások/lapbetöltődések ennyi időközönként hajtódnak végre. Érték lehet: 200-6000. Javasolt: gépi: 500ms, emberi: 3000.')">ms.
			</form>
			</td>
		</tr>
		<tr>
			<th>Farmoló falu hozzáadása</th>
			<th>Farmolandó falu hozzáadása</th>
		</tr><tr>
			<td style="width:48%;" onmouseover="sugo(this,'Adj meg koordinátákat, melyek a te faluid és farmolni szeretnél velük. A koordináták elválasztása bármivel történhet.')">
				Koordináták: <input type="text" size="45" id="add_farmolo_faluk" placeholder="111|111, 222|222, ...">
				<input type="button" value="Hozzáad" onclick="add_farmolo()">
			</td>
			<td style="width:52%;" onmouseover="sugo(this,'Adj meg koordinátákat, amelyek farmok, és farmolni szeretnéd. A koordináták elválasztása bármivel történhet.')">
				Koordináták: <input type="text" size="45" id="add_farmolando_faluk" placeholder="111|111, 222|222, ...">
				<input type="button" value="Hozzáad" onclick="add_farmolando()">
			</td>
		</tr><tr>
			<td onmouseover="sugo(this,'A felvivendő falukból ezeket az egységeket használhatja SZEM IV farmolás céljából. Később módosítható.')" id="add_farmolo_egysegek" style="vertical-align:middle;">
				Mivel? ${rovidit("egysegek")}
			</td>
			<td>
			</td>
		</tr><tr>
			<td colspan="2" class="nopadding_td">
				<div class="heartbeat_wrapper">
					<img src="${pic("heart.png")}" class="heartbeat_icon">
					<span id="cnc_farm_heartbeat">---</span>
				</div>
			</td>
		</tr>
	</table>
	<div class="szem4_farmolo_datatable_wrapper">
		<table class="vis" id="farm_honnan" style="vertical-align:top; display: inline-block;"><tr>
			<th width="55px" onmouseover="sugo(this,'Ezen falukból farmolsz. Dupla klikk az érintett sor koordinátájára=sor törlése.<br>Rendezhető')" style="cursor: pointer;" onclick='rendez("szoveg",false,this,"farm_honnan",0)'>Honnan</th>
			<th onmouseover="sugo(this,'Ezen egységeket használja fel SZEM a farmoláshoz. Bármikor módosítható. Áthúzott: jelenleg nincs a faluban ilyen egység')">Mivel?</th>
			<th onmouseover="sugo(this,'Ekkor néztem a falu állapotát utoljára. Dupla klikk=törlés=nézd újra.<br>Rendezhető.<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.')" onclick='rendez("datum",false,this,"farm_honnan",2)' style="cursor: pointer; vertical-align:middle; line-height: 18px;">
				Frissítve
				<span style="margin-left: 20x; margin-right: 0px;">
					<img src="${pic("search.png")}" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport('honnan')">
					<input type="checkbox" id="farm_multi_honnan" onmouseover="sugo(this,'Ha bepipálod, akkor egy cellán végzett dupla klikkes művelet minden sorra érvényes lesz az adott oszlopba (tehát minden falura), ami jelenleg látszik. Légy óvatos!')">
				</span>
			</th>
		</tr></table>\
		<table class="vis" id="farm_hova" style="vertical-align:top; display: inline-block;"><tr>
			<th onmouseover="sugo(this,'Ezen falukat farmolod. A háttérszín jelöli a jelentés színét: alapértelmezett=zöld jelik/nincs felderítve. Sárga=veszteség volt a falun. Piros: a támadás besült, nem megy rá több támadás.<br>Dupla klikk a koordira: a háttérszín alapértelmezettre állítása.<br>Rendezhető')" style="cursor: pointer;" onclick='rendez("szoveg",false,this,"farm_hova",0)'>Hova</th>
			<th onmouseover="sugo(this,'Felderített bányaszintek, ha van. Kék háttér: megy rá kémtámadás.<br>Dupla klikk=az érintett sor törlése')">Bányák</th>
			<th onmouseover="sugo(this,'Fal szintje. Dupla klikk=háttér csere (csak megjelölésként). <br>Rendezhető.')" onclick='rendez("szam",false,this,"farm_hova",2)' style="cursor: pointer;">Fal</th>
			<th onmouseover="sugo(this,'Számítások szerint ennyi nyers van az érintett faluba. Dupla klikk=érték módosítása.<br>Rendezhető.')" onclick='rendez("szam",false,this,"farm_hova",3)' style="cursor: pointer;">Nyers</th>
			<th onmouseover="sugo(this,'Játékos e? Ha játékost szeretnél támadni, pipáld be a falut mint játékos uralta, így támadni fogja. Ellenben piros hátteret kap a falu.')">J?</th>
			<th onmouseover="sugo(this,'Támadásokat tudod itt nyomon követni szerelvények formájában, melyek a támadási algoritmus alapjait képzik<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.')" style="cursor: pointer; vertical-align:middle;">
				---
				<span style="margin-left: 65px; margin-right: 0px;">
					<img src="${pic("search.png")}" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport('hova')">
					<input type="checkbox" id="farm_multi_hova">
				</span>
			</th>
		</tr></table>
</div></p></td></tr>`);

var FARM_LEPES=0, FARM_REF, FARM_HIBA=0, FARM_GHIBA=0,
	BOT=false,
	FARMOLO_TIMER,
	ALL_UNIT_MOVEMENT = {}, //{..., hova(koord): [[ mennyi_termelésből(teherbírás), mikorra(getTime()), mennyi_VIJE_miatt(teherbírás) ], ...], ...}
	ALL_SPY_MOVEMENTS = {}, // hova(koord): mikor
	DOMINFO_FARMS = {}, // village: {prodHour: <number>, buildings: {main: <number>, barracks: <number>, wall: <number>}, nyers: <number>, isJatekos: <boolean> }
	PM1, FARM_PAUSE=true;
szem4_farmolo_motor();

/* --------------------- JELENTÉS ELEMZŐ ----------------------- */
function VIJE_FarmElem(koord){try{
	var farm_helye=document.getElementById("farm_hova").rows;
	var isExists=false;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==koord) {
			isExists=true;
			farm_helye=farm_helye[i];
			break;
		}
	}
	if (!isExists) return [false,false,0];
	
	var banyaVanE=true;
	if (farm_helye.cells[1].textContent=="") banyaVanE=false;
	
	return [isExists, banyaVanE, farm_helye];
}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
function VIJE_elemzett(jid){try{
	var a=document.getElementById("VIJE_elemzett").textContent;
	if (a=="") return false;
	a=a.split(",");
	for (var i=0;i<a.length;i++) {
		if (a[i]==jid) return true;
	}
	if (a.length>130) document.getElementById("VIJE_elemzett").innerHTML=a.slice(a.length-100,a.length);
	return false;
}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
function VIJE_IntelliAnalyst_isRequired(koord, jelRow, jelDate, farmRow) {
	jelDate.setSeconds(59);
	if (ALL_VIJE_SAVED[koord] && ALL_VIJE_SAVED[koord] > jelDate) return false;
	
	const isSpy = !!jelRow.querySelector('img[src*="spy"]');
	if (isSpy) return true;

	let nyers_VIJE = parseInt(farmRow.cells[3].textContent,10);
	if (nyers_VIJE > 0) nyers_VIJE -= getAllResFromVIJE(koord);
	if (nyers_VIJE > 100) return true;
	return false;
}
function szem4_VIJE_1kivalaszt(){try{
	/*Eredménye: jelentés azon;célpont koord;jelentés SZÍNe;volt e checkbox-olt jeli*/
	try{TamadUpdt(VIJE_REF1);}catch(e){}
	VT=VIJE_REF1.document.getElementById("report_list").rows;
	if (VT.length<3) return [0,0,"",false];
	var vane=false;
	let szin = '';
	for (var i=VT.length-2;i>0;i--) {
		var jid=VT[i].cells[1].getElementsByTagName("span")[0].getAttribute("data-id").replace("label_","");
		if (VIJE_elemzett(jid)) continue;

		try {
			var koord=VT[i].cells[1].textContent.match(/[0-9]+(\|)[0-9]+/g);
			koord=koord[koord.length-1];
		} catch(e){ continue; }
		var eredm=VIJE_FarmElem(koord); /*0:BenneVanE,1:VanEBanyaSzint,2:farm_helye*/
		if (eredm[0]==false) continue;

		/*+++IDŐ*/
		var d=getServerTime(VIJE_REF1); var d2=getServerTime(VIJE_REF1);
		(function convertDate() {
			var ido = VT[i].cells[2].textContent;
			var oraperc=ido.match(/[0-9]+:[0-9]+/g)[0];
			var nap=ido.replace(oraperc,"").match(/[0-9]+/g)[0];
			d.setMinutes(parseInt(oraperc.split(":")[1],10));
			d.setHours(parseInt(oraperc.split(":")[0],10));
			d.setDate(parseInt(nap,10));
		})();

		/* Régi jelentés? */
		if ((d2-d) > 10800000 || (d2-d) < 0) var regi=true; else var regi=false; /*3 óra*/
		if (eredm[1]==false) { vane=true; break;}
		if (regi) continue;

		/* Szín lekezelése */
		const farm_helye = eredm[2];
		szin = VT[i].cells[1].childNodes;
		for (var s=0;s<szin.length;s++) {
			if (szin[s].nodeName=="IMG") {
				szin=szin[s].src.split(".png")[0].split("/");
				szin=szin[szin.length-1];
				break;
			}
		}
		if (szin.includes("green")) {
			VT[i].cells[0].getElementsByTagName("input")[0].checked = true;
			farm_helye.cells[0].style.backgroundColor="#f4e4bc";
		}
		else if (szin==="yellow") farm_helye.cells[0].style.backgroundColor="yellow";
		else if (szin!="blue" && farm_helye.cells[0].style.backgroundColor !== 'red') {
			farm_helye.cells[0].style.backgroundColor="red";
			naplo("Jelentés Elemző", koord+" farm veszélyesnek ítélve. Jelentésének színe "+szin+".");
		}

		/* Van értelme elemezni? */
		if (!VIJE_IntelliAnalyst_isRequired(koord, VT[i].cells[1], d, eredm[2])) continue;

		if (eredm[1]==true) { /*bányaszint ismert, de elemezni kell*/
			vane=true;
			break;
		}
	}
	/*Ha nincs talált jeli --> nézd meg volt e checkboxolt, és ha igen, akkor a 4. PM=true;*/
	if (!vane) {
		for (var i=VT.length-2;i>0;i--) {
			if (VT[i].cells[0].getElementsByTagName("input")[0].checked) return [0,0,"",true];
		}
		return [0,0,"",false];
	}
	
	/*debug("VIJE_1()","Megvan a jeli amit nézni kell majd! Koord: "+koord+" ID="+jid);*/
	return [jid,koord,szin,false,regi];
}catch(e){debug("VIJE1","Hiba: "+e);return [0,0,"",false];}}

function VIJE_adatbeir(koord,nyers,banya,fal,szin, hungarianDate){try{
	// célpont, 0, '', '', szín, jelidate
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==koord) {farm_helye=farm_helye[i]; break;}
	}
	farm_helye.cells[0].setAttribute("data-age",0);
	if (banya!=="") {
		farm_helye.cells[1].innerHTML=banya;
		DOMINFO_FARMS[koord].prodHour = getProdHour(banya.join(','));
		farm_helye.cells[1].backgroundColor="#f4e4bc";
		if (fal=="") fal=0;
	}
	if (szin == 'SEREG') {
		farm_helye.cells[0].style.backgroundColor = 'red';
		DOMINFO_FARMS[koord].color = 'red';
		naplo('VIJE', `${koord} -- Sereg a faluban!`);
	}
	if (fal!=="") {
		if (parseInt(farm_helye.cells[2].innerHTML)!==parseInt(fal, 10))
			farm_helye.cells[2].backgroundColor="#f4e4bc";
		farm_helye.cells[2].innerHTML = `
		<span onmouseenter="addTooltip_build(this, '${koord}')" class="tooltip_hover">
			${fal}
			<span class="tooltip_text"></span>
		</span>`;
		DOMINFO_FARMS[koord].buildings.wall = fal;
	}
	if (nyers !== '') { // Ha van adatunk a nyersanyagról...
		farm_helye.cells[3].innerHTML = nyers;
		DOMINFO_FARMS[koord].nyers = nyers;
		if (!ALL_VIJE_SAVED[koord] || ALL_VIJE_SAVED[koord] < hungarianDate)
			ALL_VIJE_SAVED[koord] = hungarianDate;
	}
	// Mockolt támadás beillesztése ha nem regisztrált támadásról jött jelentés
	var allAttack = ALL_UNIT_MOVEMENT[koord];
	if (!allAttack) ALL_UNIT_MOVEMENT[koord] = [[10000, hungarianDate, 0]];
	else {
		// debug('VIJE_adatbeir', `+Mock add: ${JSON.stringify(allAttack)} --`);
		var smallestDifference = null;
		ALL_UNIT_MOVEMENT[koord].forEach(arr => {
			var difference = Math.abs(arr[1] - hungarianDate);
			if (!smallestDifference || difference < smallestDifference) {
				smallestDifference = difference;
			}
		});
		if (smallestDifference > 60000) ALL_UNIT_MOVEMENT[koord].push([10000, hungarianDate, 0]); // FIXME: Ne 10k legyen már hanem MAX_megbízhatóság
		// debug('VIJE_adatbeir', `Mock added: ${JSON.stringify(allAttack)}`);
	}
	drawWagons(koord);
}catch(e){debug("VIJE_adatbeir","Hiba: "+e);}}
function szem4_VIJE_2elemzes(adatok){try{
	/*Adatok: [0]jelentés azon;[1]célpont koord;[2]jelentés SZÍNe;[3]volt e checkbox-olt jeli;[4]régi jeli e? (igen->nincs nyerselem)*/
	var nyersossz=0;
	var isOld = false;
	var reportTable=VIJE_REF2.document.getElementById("attack_info_att").parentNode;
	while (reportTable.nodeName != 'TABLE') {
		reportTable = reportTable.parentNode;
	}
	var hungarianDate = reportTable.rows[1].cells[1].innerText;
	var defUnits = VIJE_REF2.document.getElementById('attack_info_def_units');
	if (defUnits && defUnits.textContent.match(/[1-9]+/g)) adatok[2] = 'SEREG';
	hungarianDate = new Date(Date.parse(hungarianDate.replace(/jan\./g, "Jan").replace(/febr?\./g, "Feb").replace(/márc\./g, "Mar").replace(/ápr\./g, "Apr").replace(/máj\./g, "May").replace(/jún\./g, "Jun").replace(/júl\./g, "Jul").replace(/aug\./g, "Aug").replace(/szept\./g, "Sep").replace(/okt\./g, "Oct").replace(/nov\./g, "Nov").replace(/dec\./g, "Dec")));
	hungarianDate = hungarianDate.getTime();
	if (ALL_VIJE_SAVED[adatok[1]] >= hungarianDate) isOld = true;
	if (!isOld && VIJE_REF2.document.getElementById("attack_spy_resources")) {
		var x=VIJE_REF2.document.getElementById("attack_spy_resources").rows[0].cells[1];
		if (adatok[4]) {var nyersossz="";debug("VIJE2","Nem kell elemezni (régi)"); } else {
			try{
				if (/\d/.test(x.textContent)) {
					var nyers=x.textContent.replace(/\./g,"").match(/[0-9]+/g); 
					var nyersossz=0;
					for (var i=0;i<nyers.length;i++) nyersossz+=parseInt(nyers[i],10);
				} else {
					nyersossz=0;
				}
			}catch(e){var nyersossz=0; debug("VIJE","<a href='"+VIJE_REF2.document.location+"' target='_BLANK'>"+adatok[0]+"</a> ID-jű jelentés nem szokványos, talált nyers 0-ra állítva. Hiba: "+e);}
		}
	
		// Épületek
		if (VIJE_REF2.document.getElementById("attack_spy_buildings_left")) {
			var i18nBuildings=document.getElementById("vije_opts");
			const spyLevels = {
				wood: 0,
				stone: 0,
				iron: 0,
				wall: 0,
				main: 1,
				barracks: 0
			}
			
			var spyBuildingRows_left=VIJE_REF2.document.getElementById("attack_spy_buildings_left").rows;
			var spyBuildingRows_right=VIJE_REF2.document.getElementById("attack_spy_buildings_right").rows;
			for (var i=1;i<spyBuildingRows_left.length;i++) {
				let buildingName_l = spyBuildingRows_left[i].cells[0].textContent.toUpperCase();
				let buildingName_r = spyBuildingRows_right[i].cells[0].textContent.toUpperCase();
				for (const key in spyLevels) {
					if (buildingName_l.includes(i18nBuildings[key].value.toUpperCase())) spyLevels[key] = parseInt(spyBuildingRows_left[i].cells[1].textContent,10);
					if (buildingName_r.includes(i18nBuildings[key].value.toUpperCase())) spyLevels[key] = parseInt(spyBuildingRows_right[i].cells[1].textContent,10);
				}
			}
			DOMINFO_FARMS[adatok[1]].buildings = JSON.parse(JSON.stringify(spyLevels));
			if (spyLevels.wall == 0) {
				if (spyLevels.barracks == 0) spyLevels.wall--;
				if (spyLevels.main == 2) spyLevels.wall--;
				if (spyLevels.main == 1) spyLevels.wall-=2;
			}
			var banyak = [spyLevels.wood, spyLevels.stone, spyLevels.iron];
			var fal = spyLevels.wall;
		} else { /*Csak nyerset láttunk*/
			var banyak = "";
			var fal = "";
		}
		VIJE_adatbeir(adatok[1],nyersossz,banyak,fal,adatok[2], hungarianDate);
	} else if (!isOld) {
		var atkTable = VIJE_REF2.document.getElementById('attack_results');
		var fosztogatas = atkTable?atkTable.rows[0].cells[2].innerText.split('/').map(item => parseInt(item,10)):0;
		var nyers = '';
		if (fosztogatas[0] + 5 < fosztogatas[1]) {
			nyers=0;
			//debug('debug/szem4_VIJE_2elemzes', `VIJE_adatbeir(${adatok[1],nyers},'','',${adatok[2]}, ${hungarianDate}`);
			VIJE_adatbeir(adatok[1],nyers,'','',adatok[2], hungarianDate);
		}
	}
	
	/*Tedd be az elemzettek listájába az ID-t*/
	document.getElementById("VIJE_elemzett").innerHTML+=adatok[0]+",";
	if (document.getElementById("VIJE_elemzett").innerHTML.split(",").length>200) {
		document.getElementById("VIJE_elemzett").innerHTML=document.getElementById("VIJE_elemzett").innerHTML.split(",").splice(100,100)+",";
	}
	
	VIJE2_HIBA=0; VIJE2_GHIBA=0;
	return true;
}catch(e){debug("VIJE2","Elemezhetetlen jelentés: "+adatok[0]+":"+adatok[1]+". Hiba: "+e); VIJE_adatbeir(adatok[1],nyersossz,"","",adatok[2]); VIJE2_HIBA++; VIJE_HIBA++; return false;}}

function szem4_VIJE_3torol(){try{
	if (document.getElementById("vije").getElementsByTagName("input")[6].checked) {
		try{VIJE_REF1.document.forms[0].del.click();}catch(e){VIJE_REF1.document.getElementsByName("del")[0].click();}
	}
}catch(e){debug("VIJE3","Hiba: "+e);return;}}

function szem4_VIJE_motor(){try{
	var nexttime=1500;
	if (VIJE_PAUSE) clearAttacks();
	if (BOT||VIJE_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
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
	
	if (VIJE2_HIBA>6) {VIJE2_HIBA=0; VIJE2_GHIBA++; if(VIJE2_GHIBA>3) {if (VIJE2_GHIBA>5) naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); VIJE_REF2.close();} VIJE_LEPES=0;}
	if (!VIJE_REF1 || (VIJE_LEPES!=0 && VIJE_REF1.closed)) VIJE_LEPES=0;
	
	switch(VIJE_LEPES) {
		case 0: /*Támadói jelentések megnyitása*/
			if (document.getElementById("farm_hova").rows.length>1) {
			var csoport="";
			if (game_data.player.premium) csoport="group_id=-1&";
			VIJE_REF1=windowOpener('vije', VILL1ST.replace("screen=overview","mode=attack&"+csoport+"screen=report"), AZON+"_SZEM4VIJE_1");
			VIJE_LEPES=1;
			} else nexttime=10000;
			break;
		case 1: /*Megnyitandó jelentés kiválasztás(+bepipálás)*/
			if (isPageLoaded(VIJE_REF1,-1,"screen=report")) {
				VIJE_HIBA=0; VIJE_GHIBA=0;
				PM2=szem4_VIJE_1kivalaszt();
				if (PM2[0]===0) { // Nincs meló
					if (PM2[3] && document.getElementById("vije").getElementsByTagName("input")[6].checked) {
						VIJE_LEPES=3;
					} else {
						VIJE_LEPES=0;
						nexttime=120000;
						if (MOBILE_MODE) {
							VIJE_REF1.close();
							VIJE_REF2.close();
						}
					}
				} else {
					VIJE_REF2=windowOpener('vije2', VILL1ST.replace("screen=overview","mode=attack&view="+PM2[0]+"&screen=report"), AZON+"_SZEM4VIJE_2");
					VIJE_LEPES=2;
				}
				VIJE_REF1.document.title = 'Szem4/vije1';
			} else { VIJE_HIBA++;}
			break;
		case 2: /*Megnyitott jelentés elemzése*/
			if (isPageLoaded(VIJE_REF2,-1,PM2[0])) {
				clearAttacks();
				szem4_VIJE_2elemzes(PM2);
				if (PM2[3]) VIJE_LEPES=3; else VIJE_LEPES=1;
				VIJE_REF2.document.title = 'Szem4/vije2';
			} else { VIJE2_HIBA++;}
			break;
		case 3: /*bepipált jelentések törlése*/
			szem4_VIJE_3torol();
			VIJE_LEPES=0;
			if (PM2[0]===0) {
				nexttime=120000;
				if (MOBILE_MODE) {
					VIJE_REF1.close();
					VIJE_REF2.close();
				}
			}
			break;
		default: VIJE_LEPES=0;
	}}
}catch(e){debug("szem4_VIJE_motor()","ERROR: "+e+" Lépés:"+VIJE_LEPES);}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'vije', 'time': nexttime});
}catch(e){debug('vije', 'Worker engine error: ' + e);setTimeout(function(){szem4_VIJE_motor();}, 3000);}}
/*VIJE*/
ujkieg("vije","Jelentés Elemző",`<tr><td>
	A VIJE a Farmoló táblázatába dolgozik, itt csupán működési beállításokat módosíthatsz.
	<form id="vije_opts">
		<table class="szem4_vije_optsTable">
			<tr><td>"Fatelep" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="wood" value="Fatelep"></td></tr>
			<tr><td>"Agyagbánya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="stone" value="Agyagbánya"></td></tr>
			<tr><td>"Vasbánya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="iron" value="Vasbánya"></td></tr>
			<tr><td>"Fal" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="wall" value="Fal"></td></tr>
			<tr><td>"Főhadiszállás" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="main" value="Főhadiszállás"></td></tr>
			<tr><td>"Barakk" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="barracks" value="Barakk"></td></tr>
		</table>
		<input type="checkbox" name="isdelete"> Zöld farmjelentések törlése?<br><br><br>
	</form>
	<i>Elemzett jelentések:</i><div id="VIJE_elemzett" style="font-size:30%;width:980px;word-wrap: break-word;"></div></td></tr>`);

var VIJE_PAUSE=true;
var VIJE_LEPES=0;
var VIJE_REF1; var VIJE_REF2;
var VIJE_HIBA=0; var VIJE_GHIBA=0;
var VIJE2_HIBA=0; var VIJE2_GHIBA=0;
var ALL_VIJE_SAVED = {}; // coord: date
var PM2;
szem4_VIJE_motor();

/*-----------------TÁMADÁS FIGYELŐ--------------------*/

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
}catch(e){debug("ID beir","Hiba: "+e);}}

ujkieg_hang("Bejövő támadások","bejovo");
ujkieg("idtamad","Bejövő támadások",'<tr><td align="center"><table class="vis" id="idtamad_Bejovok" style="vertical-align:top; display: inline-block;"><tr><th>Időpont</th><th>Támadások száma</th></tr></table> </td></tr>');


/*-----------------ÉPÍTŐ--------------------*/
function szem4_EPITO_perccsokkento(){try{
	var hely=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	var patt=/[0-9]+\:[0-9]+/g;
	for (var i=1;i<hely.length;i++) {
		let currentCell = hely[i].cells[3];
		if (currentCell.textContent.search(patt)>-1) {
			let time = currentCell.textContent.match(patt)[0];
			time = time.split(':').map(a => parseInt(a,10));
			time = time[0] * 60 + time[1];
			time--;
			currentCell.textContent = currentCell.textContent.replace(patt, writeAllBuildTime(time, true));
		}
	}
}catch(e){debug("Építő_pcsökk",e); setTimeout("szem4_EPITO_perccsokkento()",60000);}}
function writeAllBuildTime(minutes, isDateOnly=false) {
	let sixty = 60;
	let hours = Math.floor(minutes / sixty);
	let mins = minutes % sixty;
	let toDate = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
	if (isDateOnly) {
		return toDate;
	}
	return '<span class="writeOutDate">Hátralévő építési idő: ' + toDate + '</span>';
}

function szem4_EPITO_getlista(){try{
	var ret='<select>';
	var Z=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=1;i<Z.length;i++) {
		ret+='<option value="'+Z[i].cells[0].textContent+'">'+Z[i].cells[0].textContent+'</option> ';
	}
	ret+='</select>'; 
	return ret;
}catch(e){debug("Építő",e);}}

function szem4_EPITO_csopDelete(ezt){try{
	var name=ezt.innerHTML;
	if (!confirm("Biztos kitörlöd a "+name+" nevű csoportot?\nA csoportot használó faluk az Alapértelmezett csoportba fognak tartozni.")) return;
	sortorol(ezt,"");
	var bodyTable=document.getElementById("epit_lista").rows;
	for (var i=1;i<bodyTable.length;i++) {
		var selectedElement=bodyTable[i].cells[1].getElementsByTagName("select")[0];
		if (selectedElement.value==name) selectedElement.value=document.getElementById("epit").getElementsByTagName("table")[0].rows[1].cells[0].innerHTML;
	}
	bodyTable=document.getElementById("epit_ujfalu_adat").getElementsByTagName("option");
	for (var i=0;i<bodyTable.length;i++) {
		if (bodyTable[i].value==name) {
			document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0].remove(i);
			break;
		}
	}
}catch(e){alert2("Hiba:\n"+e);}}

function szem4_EPITO_ujFalu(){try{
	var adat=document.getElementById("epit_ujfalu_adat");
	var f_nev=adat.getElementsByTagName("input")[0].value;
	if (f_nev=="" || f_nev==null) return;
	f_nev=f_nev.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
	var Z=document.getElementById("epit_lista"); var str="";
	var lista=szem4_EPITO_getlista();
	for (var i=0;i<f_nev.length;i++) {
		var vane=false;
		for (var j=1;j<Z.rows.length;j++) {
			if (Z.rows[j].cells[0].textContent==f_nev[i]) vane=true;
		} if (vane) {str+="DUP:"+f_nev[i]+", "; continue;}
		if (koordTOid(f_nev[i])==0) {str+="NL: "+f_nev[i]+", "; continue;}
		
		var ZR=Z.insertRow(-1);
		var ZC=ZR.insertCell(0); ZC.innerHTML=f_nev[i]; ZC.setAttribute("ondblclick","sortorol(this)");
			ZC=ZR.insertCell(1); ZC.innerHTML=lista; ZC.getElementsByTagName("select")[0].value=adat.getElementsByTagName("select")[0].value;
			ZC=ZR.insertCell(2); ZC.style.fontSize="x-small"; var d=new Date(); ZC.innerHTML=d.toLocaleString(); ZC.setAttribute("ondblclick","szem4_EPITO_most(this)");
			ZC=ZR.insertCell(3); ZC.innerHTML="<i>Feldolgozás alatt...</i>"+' <a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+koordTOid(f_nev[i])).replace('screen=overview','screen=main')+'" target="_BLANK"><img alt="Nyit" title="Falu megnyitása" src="'+pic("link.png")+'"></a>';; ZC.setAttribute("ondblclick",'szem4_EPITO_infoCell(this.parentNode,\'alap\',"")');
	}
	if (str!="") alert2("Dupla megadások/nem létező faluk kiszűrve: "+str);
	adat.getElementsByTagName("input")[0].value="";
	return;
}catch(e){alert2("Új falu(k) felvételekori hiba:\n"+e);}}

function szem4_EPITO_ujCsop(){try{
	var cs_nev=document.getElementById("epit_ujcsopnev").value.replace(/[;\._]/g,"").replace(/( )+/g," ");;
	if (cs_nev=="" || cs_nev==null) return;
	var Z=document.getElementById("epit").getElementsByTagName("table")[0];
	for (var i=1;i<Z.rows.length;i++) {
		if (Z.rows[i].cells[0].textContent==cs_nev) throw "Már létezik ilyen nevű csoport";
	}
	var ZR=Z.insertRow(-1);
	var ZC=ZR.insertCell(0); ZC.innerHTML=cs_nev; ZC.setAttribute("ondblclick","szem4_EPITO_csopDelete(this)");
		ZC=ZR.insertCell(1); ZC.innerHTML=Z.rows[1].cells[1].innerHTML; ZC.getElementsByTagName("input")[0].disabled=false;
	
	var Z=document.getElementById("epit_lista").rows;
	for (var i=1;i<Z.length;i++) {
		var Z2=Z[i].cells[1].getElementsByTagName("select")[0];
		var option=document.createElement("option");
		option.text=cs_nev;
		Z2.add(option);
	}
	Z2=document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0];
	option=document.createElement("option");
	option.text=cs_nev;
	Z2.add(option);
	document.getElementById("epit_ujcsopnev").value="";
	return;
}catch(e){alert2("Új csoport felvételekori hiba:\n"+e);}}

function szem4_EPITO_cscheck(alma){try{
	var Z=alma.parentNode.getElementsByTagName("input")[0].value;
	Z=Z.split(";");
	
	var epuletek=new Array("main","barracks","stable","garage","church_f","church","smith","snob","place","statue","market","wood","stone","iron","farm","storage","hide","wall","MINES");
	for (var i=0;i<Z.length;i++) {
		if (epuletek.indexOf(Z[i].match(/[a-zA-Z]+/g)[0])>-1) {} else throw "Nincs ilyen épület: "+Z[i].match(/[a-zA-Z]+/g)[0];
		if (parseInt(Z[i].match(/[0-9]+/g)[0])>30) throw "Túl magas épületszint: "+Z[i];
	}
	alert2("Minden OK");
}catch(e){alert2("Hibás lista:\n"+e);}}

function szem4_EPITO_most(objektum){try{
	var d=new Date();
	objektum.innerHTML=d.toLocaleString();
	return;
}catch(e){alert2("Hiba lépett fel:\n"+e);}}

function szem4_EPITO_csopToList(csoport){try{
	var Z=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=1;i<Z.length;i++) {
		if (Z[i].cells[0].textContent==csoport) return Z[i].cells[1].getElementsByTagName("input")[0].value;
	}
	return ";";
}catch(e){debug("epito_csopToList",e);}}

function szem4_EPITO_Wopen(){try{
	/*Eredmény: faluID, teljes építendő lista, pointer a sorra*/
	var TT=document.getElementById("epit_lista").rows;
	var now=new Date();
	for (var i=1;i<TT.length;i++) {
		var datum=new Date(TT[i].cells[2].textContent);
		if (datum<now) {
			var lista=szem4_EPITO_csopToList(TT[i].cells[1].getElementsByTagName("select")[0].value);
			return [koordTOid(TT[i].cells[0].textContent),lista,TT[i]];
		}
	}
	return [0,";"];
}catch(e){debug("Epito_Wopen",e);}}

function szem4_EPITO_addIdo(sor, perc){try{
	if (perc == "del") {
		document.getElementById("epit_lista").deleteRow(sor.rowIndex);
	} else {
		if (perc == 0) perc = 30;
		var d=new Date();
		d.setSeconds(d.getMinutes() + (perc * 60));
		sor.cells[2].innerHTML=d.toLocaleString();
	}
}catch(e){debug("epito_addIdo",e); return false;}}

function szem4_EPITO_infoCell(sor,szin,info){try{
	if (szin=="alap") szin="#f4e4bc";
	if (szin=="blue") szin="#44F";
	if (szin=="red") setTimeout('playSound("kritikus_hiba")',2000);
	sor.cells[3].style.backgroundColor=szin;
	
	sor.cells[3].innerHTML=info+' <a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+koordTOid(sor.cells[0].textContent)).replace('screen=overview','screen=main')+'" target="_BLANK"><img alt="Nyit" title="Falu megnyitása" src="'+pic("link.png")+'"></a>';
	return;
}catch(e){debug("építő_infoCell",e);}}

function szem4_EPITO_getBuildLink(ref, type) {
	var row = ref.document.getElementById('main_buildrow_' + type);
	if (row.cells.length < 3) return false;
	var patt = new RegExp('main_buildlink_'+type+'_[0-9]+','g');
	var allItem = row.getElementsByTagName("*");
	for (var i=0;i<allItem.length;i++) {
		if (patt.test(allItem[i].id)) {
		return allItem[i];
		}
	}
}

function szem4_EPITO_IntettiBuild(buildOrder){try{
	try{TamadUpdt(EPIT_REF);}catch(e){}
	var buildList=""; /*Current BuildingList IDs*/
	var allBuildTime=0; /*Ennyi perc építési idő, csak kiírás végett*/
	var firstBuildTime=0; /*Az első épület építési ideje*/
	var textTime;

	try {
		if (!EPIT_REF.document.getElementById("buildqueue")) throw 'No queue';
		var buildQueueRows=EPIT_REF.document.getElementById("buildqueue").rows;
		for (var i=1;i<buildQueueRows.length;i++) {try{
			buildList+=buildQueueRows[i].cells[0].getElementsByTagName("img")[0].src.match(/[A-Za-z0-9]+\.(png)/g)[0].replace(/[0-9]+/g,"").replace(".png","");
			textTime=buildQueueRows[i].cells[1].textContent.split(":");
			allBuildTime+=parseInt(textTime[0])*60+parseInt(textTime[1])+(parseInt(textTime[2])/60);
			if (firstBuildTime==0) firstBuildTime=allBuildTime;
			buildList+=";";
		}catch(e){}}

		allBuildTime=Math.round(allBuildTime);

		firstBuildTime = Math.ceil(firstBuildTime);
		if (firstBuildTime>180) firstBuildTime=180;
	}catch(e){var buildList=";"; var allBuildTime=0; var firstBuildTime=0;}
	
	if (buildList == '') buildList = ';';
	buildList=buildList.split(";");
	buildList.pop();
	if (buildList.length>4) {
		szem4_EPITO_infoCell(PMEP[2],"alap","Építési sor megtelt. " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime);
		return;
	}
	
	/* Jelenlegi épületszintek kiszámítása építési sorral együtt */
	let currentBuildLvls=EPIT_REF.game_data.village.buildings;
	currentBuildLvls = Object.fromEntries(Object.entries(currentBuildLvls).map(([key, value]) => [key, parseInt(value)]));
	
	for (var i=0;i<buildList.length;i++) {
		currentBuildLvls[buildList[i]]++;
	}

	/* Következő építendő épület meghatározása */
	var nextToBuild = '';
	var buildOrderArr=buildOrder.split(";");
	for (var i=0;i<buildOrderArr.length;i++) {
		let cel = buildOrderArr[i].split(' ');
		cel[1] = parseInt(cel[1]);
		if (cel[0] == 'MINES') {
			let smallest = 31;
			if (currentBuildLvls['wood'] < cel[1]) {
				smallest = currentBuildLvls['wood'];
				nextToBuild = 'wood';
			}
			if (currentBuildLvls['stone'] < cel[1] && currentBuildLvls['stone'] < smallest) {
				smallest = currentBuildLvls['stone'];
				nextToBuild = 'stone';
			}
			if (currentBuildLvls['iron'] < cel[1] && currentBuildLvls['iron'] < smallest) {
				smallest = currentBuildLvls['iron'];
				nextToBuild = 'iron';
			}
			if (nextToBuild != '') break;
		}
		// TODO: FASTEST
		if (currentBuildLvls[cel[0]] < cel[1]) {
			nextToBuild = cel[0];
			break;
		}
	}

	/* Minden épület kész */
	if (nextToBuild == '') {
		naplo("Építő",'<a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+PMEP[0])+'" target="_BLANK">'+EPIT_REF.game_data.village.name+" ("+EPIT_REF.game_data.village.x+"|"+EPIT_REF.game_data.village.y+")</a> falu teljesen felépült és törlődött a listából");
		setTimeout(() => playSound("falu_kesz"), 1500);
		szem4_EPITO_addIdo(PMEP[2],"del");
		return;
	}

	/* Cél szükségeletének lekérése */
	var nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
	if (!nextToBuildRow) {
		szem4_EPITO_infoCell(PMEP[2],firstBuildTime==0?"red":"yellow", nextToBuild+" nem építhető. Előfeltétel szükséges? " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2], firstBuildTime>0?firstBuildTime:60);
		return;
	}
	var resNeed = {
		wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
		stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
		iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
		pop: parseInt(nextToBuildRow.cells[5].textContent.match(/[0-9]+/g),10)
	}
	if (Math.max(resNeed.wood, resNeed.stone, resNeed.iron) > EPIT_REF.game_data.village.storage_max) nextToBuild = 'storage+';
	if (resNeed.pop > (EPIT_REF.game_data.village.pop_max - EPIT_REF.game_data.village.pop)) nextToBuild = 'farm+';
	if (nextToBuild == 'farm+' && EPIT_REF.game_data.village.buildings.farm == 30) {
		szem4_EPITO_infoCell(PMEP[2],"red","Tanya megtelt, építés nem folytatható. " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2], 120);
		return;
	}
	if (nextToBuild == 'farm+' && buildList.includes('farm')) {
		szem4_EPITO_infoCell(PMEP[2],'yellow', 'Tanya megtelt, de már építés alatt... ' + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2], 120);
		return;
	}
	if (nextToBuild == 'farm+' || nextToBuild == 'storage+') {
		nextToBuild = nextToBuild.slice(0, -1);
		nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
		resNeed = {
			wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
			stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
			iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
			pop: 0
		}
		// Farm kéne, de raktár nincs hozzá ~>
		if (Math.max(resNeed.wood, resNeed.stone, resNeed.iron) > EPIT_REF.game_data.village.storage_max) {
			nextToBuild = 'storage';
			nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
			resNeed = {
				wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
				stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
				iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
				pop: 0
			}
		}
	}

	if (EPIT_REF.game_data.village.wood < resNeed.wood || EPIT_REF.game_data.village.stone < resNeed.stone || EPIT_REF.game_data.village.iron < resNeed.iron) {
		szem4_EPITO_infoCell(PMEP[2],"yellow","Nyersanyag hiány lépett fel. " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime>0?Math.min(firstBuildTime, 60):60);
		return;
	} 

	/* Minden rendben, építhető, klikk */
	szem4_EPITO_infoCell(PMEP[2],"alap","Építés folyamatban.");
	var buildBtn = nextToBuildRow.querySelector('.btn.btn-build');
	if (buildBtn.style.display == 'none') {
		if (buildList.length < 2) {
			szem4_EPITO_infoCell(PMEP[2],"red","Ismeretlen hiba. " + writeAllBuildTime(allBuildTime));
		} else {
			szem4_EPITO_infoCell(PMEP[2],"alap","Építkezési sor megtelt. " + writeAllBuildTime(allBuildTime));
		}
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime>0?firstBuildTime:60);
		return;
	}
	buildBtn.click();
	playSound("epites");
}catch(e){debug("epit_IntelliB",e);}}

function szem4_EPITO_motor(){try{
	var nexttime=2000;
	if (BOT||EPIT_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	if (EPIT_HIBA>10) {EPIT_HIBA=0; EPIT_GHIBA++; if(EPIT_GHIBA>3) {if (EPIT_GHIBA>5) {naplo("Globál","Nincs internet? Folyamatos hiba az építőnél"); nexttime=60000; playSound("bot2");} EPIT_REF.close();} EPIT_LEPES=0;}
	switch (EPIT_LEPES) {
		case 0: PMEP=szem4_EPITO_Wopen(); /*FaluID;lista;link_a_faluhoz*/
				if (PMEP[0]>0) {
					EPIT_REF=windowOpener('epit', VILL1ST.replace("screen=overview","screen=main").replace(/village=[0-9]+/,"village="+PMEP[0]), AZON+"_SZEM4EPIT");
					EPIT_LEPES=1;
				} else {
					if (document.getElementById("epit_lista").rows.length==1) 
						nexttime=5000;
					else {
						nexttime=60000;
						if (MOBILE_MODE) EPIT_REF.close();
					}
				}
				if (EPIT_REF && EPIT_REF.document) EPIT_REF.document.title = 'szem4/építő';
				break;
		case 1: if (isPageLoaded(EPIT_REF,PMEP[0],"screen=main")) {EPIT_HIBA=0; EPIT_GHIBA=0;
					/*PMEP=*/szem4_EPITO_IntettiBuild(PMEP[1]);
				} else {EPIT_HIBA++;}
				EPIT_LEPES=0;
				break;
		default: EPIT_LEPES=0;
	}
	
	/*
	1.) Megnézzük melyik falut kell megnyitni -->főhadi.
	2.) <5 sor? Mit kell venni? Lehetséges e? Ha nem, lehet e valamikor az életbe? (tanya/raktár-vizsgálat)
	3.) Nincs! xD
	*/}
}catch(e){debug("Epito motor",e); EPIT_LEPES=0;}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'epit', 'time': nexttime});
}catch(e){debug('epit', 'Worker engine error: ' + e);setTimeout(function(){szem4_EPITO_motor();}, 3000);}}

ujkieg_hang("Építő","epites;falu_kesz;kritikus_hiba");
ujkieg("epit","Építő",'<tr><td><h2 align="center">Építési listák</h2><table align="center" class="vis" style="border:1px solid black;color: black;"><tr><th onmouseover=\'sugo(this,"Építési lista neve, amire később hivatkozhatunk")\'>Csoport neve</th><th onmouseover=\'sugo(this,"Az építési sorrend megadása. Saját lista esetén ellenőrizzük az OK? linkre kattintva annak helyességét!")\' style="width:800px">Építési lista</th></tr><tr><td>Alapértelmezett</td><td><input type="text" disabled="disabled" value="main 10;storage 10;wall 10;main 15;wall 15;storage 15;farm 10;main 20;wall 20;MINES 10;smith 5;barracks 5;stable 5;storage 20;farm 20;market 10;main 22;smith 12;farm 25;storage 28;farm 26;MINES 24;market 19;barracks 15;stable 10;garage 5;MINES 26;farm 28;storage 30;barracks 20;stable 15;farm 30;barracks 25;stable 20;MINES 30;smith 20;snob 1" size="125"><a onclick="szem4_EPITO_cscheck(this)" style="color:blue; cursor:pointer;"> OK?</a></td></tr></table><p align="center">Csoportnév: <input type="text" value="" size="30" id="epit_ujcsopnev" placeholder="Nem tartalmazhat . _ ; karaktereket"> <a href="javascript: szem4_EPITO_ujCsop()" style="color:white;text-decoration:none;"><img src="'+pic("plus.png")+' " height="17px"> Új csoport</a></p></td></tr><tr><td><h2 align="center">Építendő faluk</h2><table align="center" class="vis" style="border:1px solid black;color: black;width:900px" id="epit_lista"><tr><th style="width: 75px; cursor: pointer;" onclick=\'rendez("szoveg",false,this,"epit_lista",0)\' onmouseover=\'sugo(this,"Rendezhető. Itt építek. Dupla klikk a falura = sor törlése")\'>Falu koord.</th><th onclick=\'rendez("lista",false,this,"epit_lista",1)\' onmouseover=\'sugo(this,"Rendezhető. Felső táblázatban használt lista közül választhatsz egyet, melyet később bármikor megváltoztathatsz.")\' style="width: 135px; cursor: pointer">Használt lista</th><th style="width: 220px; cursor: pointer;" onclick=\'rendez("datum",false,this,"epit_lista",2)\' onmouseover=\'sugo(this,"Rendezhető. Ekkor fogom újranézni a falut, hogy lehet e már építeni.<br>Dupla klikk=idő azonnalira állítása.")\'>Return</th><th style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"epit_lista",3)\' onmouseover=\'sugo(this,"Rendezhető. Szöveges információ a faluban zajló építésről. Sárga hátterű szöveg orvosolható; kék jelentése hogy nem tud haladni; piros pedig kritikus hibát jelöl; a szín nélküli a normális működést jelzi.<br>Dupla klikk=alaphelyzet")\'><u>Infó</u></th></tr></table><p align="center" id="epit_ujfalu_adat">Csoport: <select><option value="Alapértelmezett">Alapértelmezett</option> </select> \Faluk: <input type="text" value="" placeholder="Koordináták: 123|321 123|322 ..." size="50"> \<a href="javascript: szem4_EPITO_ujFalu()" style="color:white;text-decoration:none;"><img src="'+pic("plus.png")+'" height="17px"> Új falu(k)</a></p></td></tr>');

var EPIT_LEPES=0;
var EPIT_REF; var EPIT_HIBA=0; var EPIT_GHIBA=0;
var PMEP; var EPIT_PAUSE=false;
szem4_EPITO_motor();
szem4_EPITO_perccsokkento();

/*-----------------Export/Import kezelő--------------------*/
function szem4_ADAT_saveNow(tipus){
	switch (tipus) {
		case "farm": szem4_ADAT_farm_save(); break;
		case "epito": szem4_ADAT_epito_save(); break;
		case "sys": szem4_ADAT_sys_save(); break;
	}
	return;
}

function szem4_ADAT_restart(tipus){
	switch (tipus) {
		case "farm": localStorage.setItem(AZON+"_farm",'3600.4.0.3600.1.false.false.100.10.500.90;;;;;;'); szem4_ADAT_farm_load(); break;
		case "epito": localStorage.setItem(AZON+"_epito",'__'); szem4_ADAT_epito_load(); break;
		case "sys": localStorage.setItem(AZON+"_sys",'Fatelep.Agyagbánya.Vasbánya.Fal.false;false.false.false;http://www youtube com/watch?v=k2a30--j37Q.true.true.true.true.true.true;'); 
	szem4_ADAT_sys_load(); break;
	}
}

function szem4_ADAT_StopAll(){
	var tabla=document.getElementById("adat_opts").rows;
	for (var i=1;i<tabla.length;i++) {
		tabla[i].cells[0].getElementsByTagName("input")[0].checked=false;
	}
	return;
}

function szem4_ADAT_LoadAll(){
	szem4_ADAT_farm_load();
	szem4_ADAT_epito_load();
	szem4_ADAT_sys_load();
}

function szem4_ADAT_sys_save(){try{
	var eredmeny="";
	/*VIJE*/
	var adat=document.getElementById("vije").getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].getAttribute("type")=="checkbox") {
			if (adat[i].checked) eredmeny+="true"; else eredmeny+="false"; 
		} else eredmeny+=adat[i].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+='.'+JSON.stringify(ALL_VIJE_SAVED);
	eredmeny+=";";
	
	/*Adatmentő*/
	var adat=document.getElementById("adatok").getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].checked) eredmeny+="true"; else eredmeny+="false"; 
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+=";";
	
	/*Hangok*/
	var adat=document.getElementById("hang").getElementsByTagName("input");
	for (var i=0;i<adat.length;i++) {
		if (adat[i].getAttribute("type")=="checkbox") {
			if (adat[i].checked) eredmeny+="true"; else eredmeny+="false"; 
		} else eredmeny+=adat[i].value.replace(/\./g," ").replace(/;/g,"  ");
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+=";" + JSON.stringify(DOMINFO_FARMS);

	
	localStorage.setItem(AZON+"_sys",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[3].cells[2].textContent=d.toLocaleString();
	return;
}catch(e){debug("ADAT_sys_save",e);}}

function szem4_ADAT_farm_save(){try{
	var eredmeny="";
	/*Options*/
	let adat=document.getElementById("farmolo_options");
	let formData = {};
	for (let i = 0; i < adat.elements.length; i++) {
		let input = adat.elements[i];
		
		if (input.name) {
			if (input.type === 'checkbox') {
				formData[input.name] = input.checked;
			} else if (input.value) {
				formData[input.name] = input.value;
			}
		}
	}
	eredmeny+=JSON.stringify(formData);
	
	/*Farm_honnan*/
	eredmeny+=";";
	adat=document.getElementById("farm_honnan").rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+=";";
	
	var seged;
	for (var i=1;i<adat.length;i++) {
		seged=adat[i].cells[1].getElementsByTagName("input");
		for (var j=0;j<seged.length;j++) {
			if (seged[j].checked) eredmeny+="true"; else eredmeny+="false";
			if (j<seged.length-1) eredmeny+="-";
		}
		if (i<adat.length-1) eredmeny+=".";
	}
	
	/*Farm_hova*/
	eredmeny+=";";
	adat=document.getElementById("farm_hova").rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (adat[i].cells[0].style.backgroundColor=="red") eredmeny+="R";
		if (i<adat.length-1) eredmeny+=".";
	} eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[1].textContent;
		if (i<adat.length-1) eredmeny+=".";
	} eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=DOMINFO_FARMS[adat[i].cells[0].textContent].buildings.wall.match(/[0-9]+/g)[0];
		if (i<adat.length-1) eredmeny+=".";
	} eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		if (adat[i].cells[4].getElementsByTagName("input")[0].checked) eredmeny+="true"; else eredmeny+="false";
		if (i<adat.length-1) eredmeny+=".";
	}

	/* ALL Movement */
	eredmeny+=';' + JSON.stringify(ALL_UNIT_MOVEMENT);
	eredmeny+=';' + JSON.stringify(ALL_SPY_MOVEMENTS);
	
	/* Farm_hova nyers */
	eredmeny+=";";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[3].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}

	localStorage.setItem(AZON+"_farm",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[1].cells[2].textContent=d.toLocaleString();
	return;
}catch(e){debug("ADAT_farm_save",e);}}

function szem4_ADAT_epito_save(){try{
	var eredmeny="";
	/*Csoportok*/
	var adat=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=2;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent+"-"+adat[i].cells[1].getElementsByTagName("input")[0].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	
	/*Falulista*/
	eredmeny+="_";
	adat=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+="_";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[1].getElementsByTagName("select")[0].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	localStorage.setItem(AZON+"_epito",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[2].cells[2].textContent=d.toLocaleString();;
	return;
}catch(e){debug("ADAT_epito_save",e);}}

function szem4_ADAT_farm_load(){try{
	if(localStorage.getItem(AZON+"_farm")) var suti=localStorage.getItem(AZON+"_farm"); else return;
	
	/* Beállítások */
	var adat = document.getElementById("farmolo_options");
	var resz = JSON.parse(suti.split(";")[0]);
	for (let i = 0; i < adat.elements.length; i++) {
		let input = adat.elements[i];
		
		if (input.name) {
			if (input.type === 'checkbox') {
				input.checked = resz[input.name];
			} else if (input.value) {
				input.value = resz[input.name];
			}
		}
	}

	/* START: Minden adat törlése a honnan;hova táblázatokból! */
	adat=document.getElementById("farm_honnan");
	for (var i=adat.rows.length-1;i>0;i--) adat.deleteRow(i);
	adat=document.getElementById("farm_hova");
	for (var i=adat.rows.length-1;i>0;i--) adat.deleteRow(i);
	DOMINFO_FARMS = {};

	/* Honnan: kitölti a hozzáadást, 1 1ség bepipálásával (az első jó lesz) */
	document.getElementById("add_farmolo_faluk").value = suti.split(";")[1];
	document.getElementById("add_farmolo_egysegek").getElementsByTagName("input")[0].checked = true;
	add_farmolo();
	
	/*Hova: Hozzáadás használata koordikkal, később bánya;fal állítás*/	
	document.getElementById("add_farmolando_faluk").value=suti.split(";")[3];
	add_farmolando();
	
	// Kiütni a VIJE MOTOR-t, majd újraindítani
	worker.postMessage({'id': 'stopTimer', 'value': 'vije'});
	setTimeout(function(){try{
		var suti=localStorage.getItem(AZON+"_farm");
		
		var adat=document.getElementById("farm_honnan").rows;
		resz=suti.split(";")[2].split(".");
		for (var i=0;i<resz.length;i++) {
			var hely=adat[i+1].cells[1].getElementsByTagName("input");
			for (var j=0;j<resz[i].split("-").length;j++) {
				if (resz[i].split("-")[j]=="true") hely[j].checked=true; else hely[j].checked=false;
			}
		}
		/*Betöltés: farmok részletei*/
		adat=document.getElementById("farm_hova").rows;
		const farmFaluSor = suti.split(";")[3].match(/[0-9]+(\|)[0-9]+/g);
		resz=suti.split(";")[2].split(".");
		for (var i=0;i<resz.length;i++) {
			if (resz[i].indexOf("R")>0) {
				adat[i+1].cells[0].style.backgroundColor="red";
				DOMINFO_FARMS[farmFaluSor[i]].color = 'red';
			}
		}
		
		resz=suti.split(";")[4].split(".");
		for (var i=0;i<resz.length;i++) {
			adat[i+1].cells[1].textContent=resz[i];
			DOMINFO_FARMS[farmFaluSor[i]].prodHour = getProdHour(resz[i]);
		}
		
		resz=suti.split(";")[5].split(".");
		for (var i=0;i<resz.length;i++) {
			adat[i+1].cells[2].innerHTML = `
			<span onmouseenter="addTooltip_build(this, '${farmFaluSor[i]}')" class="tooltip_hover">
				${resz[i].match(/[0-9]+/g)[0]}
				<span class="tooltip_text"></span>
			</span>`;
			DOMINFO_FARMS[farmFaluSor[i]].buildings.wall = resz[i];
		}
		
		resz=suti.split(";")[6].split(".");
		for (var i=0;i<resz.length;i++) {
			resz[i]=="true" ? adat[i+1].cells[4].getElementsByTagName("input")[0].checked = true : adat[i+1].cells[4].getElementsByTagName("input")[0].checked = false;
			DOMINFO_FARMS[farmFaluSor[i]].isJatekos = (resz[i]=="true");
		}

		resz=suti.split(";")[7];
		if (resz && resz.length > 5) ALL_UNIT_MOVEMENT = JSON.parse(resz); else ALL_UNIT_MOVEMENT = {};
		
		resz=suti.split(";")[8];
		if (resz && resz.length > 5) ALL_SPY_MOVEMENTS = JSON.parse(resz); else ALL_SPY_MOVEMENTS = {};
		
		resz=suti.split(";")[9];
		if (resz) {
			resz = resz.split('.');
			clearAttacks();
			for (var i=0;i<resz.length;i++) {
				if (ALL_VIJE_SAVED[adat[i+1].cells[0].textContent]) {
					adat[i+1].cells[3].textContent=resz[i];
					DOMINFO_FARMS[farmFaluSor[i]].nyers = parseInt(resz[i], 10);
				} else {
					adat[i+1].cells[3].textContent=0;
				}
			}
		}
		
		document.getElementById("add_farmolo_egysegek").getElementsByTagName("input")[0].checked = false;
		drawWagons();
		shorttest();
		alert2("Farmolási adatok betöltése kész.");
	} catch(e){
		alert("ERROR_LOAD\n"+e);
	} finally {
		szem4_VIJE_motor();
	}
	},600);
}catch(e){debug("ADAT_farm_load",e);}void(0);}

function szem4_ADAT_epito_load(){try{
	if(localStorage.getItem(AZON+"_epito")) var suti=localStorage.getItem(AZON+"_epito"); else return;
	/* START: Minden adat törlése a listából és falukból!*/
	var adat=document.getElementById("epit").getElementsByTagName("table")[0];
	for (var i=adat.rows.length-1;i>1;i--) {
		adat.deleteRow(i);
	}
	var adat=document.getElementById("epit").getElementsByTagName("table")[1];
	for (var i=adat.rows.length-1;i>0;i--) {
		adat.deleteRow(i);
	}
	adat=document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0];
	while (adat.length>1) adat.remove(1);
	
	/*új csoport gomb használata, utána módosítás - ezt egyesével*/
	adat=suti.split("_")[0].split(".");
	for (var i=0;i<adat.length;i++) {
		document.getElementById("epit_ujcsopnev").value=adat[i].split("-")[0];
		szem4_EPITO_ujCsop();
		document.getElementById("epit").getElementsByTagName("table")[0].rows[i+2].cells[1].getElementsByTagName("input")[0].value=adat[i].split("-")[1];
	}
	/*Új faluk hozzáadása gomb, majd select állítása*/
	adat=suti.split("_")[1].split(".");
	document.getElementById("epit_ujfalu_adat").getElementsByTagName("input")[0].value=adat;
	szem4_EPITO_ujFalu();
	
	adat=suti.split("_")[2].split(".");
	var hely=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	for (var i=0;i<adat.length;i++) {
		hely[i+1].cells[1].getElementsByTagName("select")[0].value=adat[i];
	}
	alert2("Építési adatok betöltése kész.");
	return;
}catch(e){debug("ADAT_epito_load",e);}}

function szem4_ADAT_sys_load(){ try{
	if(localStorage.getItem(AZON+"_sys")) var suti=localStorage.getItem(AZON+"_sys"); else return;
	/*VIJE*/
	var adat=document.getElementById("vije").getElementsByTagName("input");
	var resz=suti.split(";")[0].split(".");
	for (var i=0;i<resz.length-1;i++) {
		if (resz[i]=="true") adat[i].checked=true; else
			if (resz[i]=="false") adat[i].checked=false; else
				adat[i].value=resz[i];
	}
	if (resz[resz.length-1].length < 12)
		ALL_VIJE_SAVED = {};
	else
		ALL_VIJE_SAVED = JSON.parse(resz[resz.length-1]);
	
	/*Adatmentő*/
	var adat=document.getElementById("adat_opts").getElementsByTagName("input");
	var resz=suti.split(";")[1].split(".");
	for (var i=0;i<resz.length;i++) {
		if (resz[i]=="true") adat[i].checked=true; else
		if (resz[i]=="false") adat[i].checked=false;
	}
	
	/*Hangok*/
	var adat=document.getElementById("hang").getElementsByTagName("input");
	var resz=suti.split(";")[2].split(".");
	adat[0].value=resz[0].replace(/\s\s/g,";").replace(/\s/g,".");
	for (var i=1;i<resz.length;i++) {
		if (resz[i]=="true") adat[i].checked=true; else
		if (resz[i]=="false") adat[i].checked=false;
	}

	/* DOM TREE */
	DOMINFO_FARMS = JSON.parse(suti.split(";")[3]);

	alert2("Rendszereadatok betöltése kész.");
}catch(e){debug("ADAT_epito_sys",e);}}

function szem4_ADAT_del(tipus){try{
	if (!confirm("Biztos törli a(z) "+tipus+" összes adatát?")) return;
	if (localStorage.getItem(AZON+"_"+tipus)) {
		localStorage.removeItem(AZON+"_"+tipus);
		alert2(tipus+": Törlés sikeres");
	} else alert2(tipus+": Nincs lementett adat");
	return;
}catch(e){debug("ADAT_epito_load",e);}}

function szem4_ADAT_kiir(tipus){try{
	if (localStorage.getItem(AZON+"_"+tipus)) {
		alert2("<textarea onmouseover='this.select()' onclick='this.select()' cols='38' rows='30'>"+localStorage.getItem(AZON+"_"+tipus)+"</textarea>");
	} else alert2("Nincs lementett adat");
	return;
}catch(e){debug("szem4_ADAT_kiir",e);}}

function szem4_ADAT_betolt(tipus){try{
	var beadat=prompt("Adja meg a korábban SZEM4 ÁLTAL KIÍRT ADATOT, melyet be kíván tölteni.\n\n Ne próbálj kézileg beírni ide bármit is. Helytelen adat megadását SZEM4 nem tudja kezelni, az ebből adódó működési rendellenesség csak RESET-eléssel állítható helyre.");
	if (beadat==null || beadat=="") return;
	localStorage.setItem(AZON+"_"+tipus,beadat);
	if (tipus=="farm") szem4_ADAT_farm_load();
	if (tipus=="epito") szem4_ADAT_epito_load();
	if (tipus=="sys") szem4_ADAT_sys_load();
	alert2("Az adatok sikeresen betöltődtek.");
}catch(e){debug("szem4_ADAT_betolt",e);}}

function loadCloudSync() {
	if (CLOUD_AUTHS) {try{
		CLOUD_AUTHS = JSON.parse(CLOUD_AUTHS);
		if (!CLOUD_AUTHS.authDomain || !CLOUD_AUTHS.projectId || !CLOUD_AUTHS.storageBucket || !CLOUD_AUTHS.messagingSenderId || !CLOUD_AUTHS.appId || !CLOUD_AUTHS.email || !CLOUD_AUTHS.password || !CLOUD_AUTHS.collection || !CLOUD_AUTHS.myDocument)
			throw 'Must consist these fields: authDomain projectId storageBucket messagingSenderId appId email password';
	} catch(e) { naplo('Sync', 'Invalid Auth data ' + e); }
	} else return;
	const script = document.createElement("script");
	script.type = "module";
	script.innerHTML = `
		import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
		import { getFirestore, collection, updateDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
		import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js"

		const app = initializeApp(CLOUD_AUTHS);
		const db = getFirestore(app);
		const auth = getAuth();

		signInWithEmailAndPassword(auth, CLOUD_AUTHS.email, CLOUD_AUTHS.password)
		.then(async (userCredential) => {
			const user = userCredential.user;

			window.readUpData = async () => {
				const myDoc = await getDoc(doc(db, CLOUD_AUTHS.collection, CLOUD_AUTHS.myDocument));
				return myDoc.data();
			}
			window.updateData = async (newData) => {
				try {
					const myDoc = await getDoc(doc(db, CLOUD_AUTHS.collection, CLOUD_AUTHS.myDocument));
					await updateDoc(myDoc.ref, newData);
					return 'OK';
				} catch(e) {
					return 'Error: '+e;
				}
			}
			window.naplo('Sync', 'Firebase felhő kapcsolat létrejött');
			if (confirm("Firebase adatszinkronizálás helyi adatokra?")) {
				window.loadCloudDataIntoLocal();
			}
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
		});`;
	document.head.appendChild(script);
}
function loadCloudDataIntoLocal() {
	if (!CLOUD_AUTHS) {
		alert("Nincs aktív felhő szinkronizáció");
		return;
	}
	readUpData().then((cloudData) => {
		localStorage.setItem(AZON+"_farm", cloudData.farm);
		localStorage.setItem(AZON+"_epito", cloudData.epit);
		localStorage.setItem(AZON+"_sys", cloudData.vije);
		szem4_ADAT_LoadAll();
	});
	document.getElementById("adat_opts").rows[4].cells[0].getElementsByTagName("input")[0].checked = true;
}
function saveLocalDataToCloud(isAll) {
	if (!CLOUD_AUTHS) {
		alert("Nincs aktív felhő szinkronizáció");
		return;
	}
	if (isAll) {
		szem4_ADAT_farm_save();
		szem4_ADAT_epito_save();
		szem4_ADAT_sys_save();
	}
	var jsonToSave = {
		farm: localStorage.getItem(AZON+"_farm"),
		epit: localStorage.getItem(AZON+"_epito"),
		vije: localStorage.getItem(AZON+"_sys")
	};
	updateData(jsonToSave).then(() => {
		var d=new Date();
		document.getElementById("adat_opts").rows[4].cells[2].textContent=d.toLocaleString();
	});
}

function szem4_ADAT_motor(){try{if (!ADAT_PAUSE){
	if (ADAT_FIRST === 0)
		ADAT_FIRST=1;
	else {
		var Z=document.getElementById("adat_opts").rows;
		if (Z[1].cells[0].getElementsByTagName("input")[0].checked) szem4_ADAT_farm_save();
		if (Z[2].cells[0].getElementsByTagName("input")[0].checked) szem4_ADAT_epito_save();
		if (Z[3].cells[0].getElementsByTagName("input")[0].checked) szem4_ADAT_sys_save();
		if (Z[4].cells[0].getElementsByTagName("input")[0].checked) saveLocalDataToCloud(false);
	}
}}catch(e){debug("ADAT_motor",e);}
try{
	worker.postMessage({'id': 'adatok', 'time': 60000});
}catch(e){debug('adatok', 'Worker engine error: ' + e);setTimeout(function(){szem4_ADAT_motor();}, 3000);}}

function szem4_ADAT_AddImageRow(tipus){
	return '\
	<img title="Jelenlegi adat betöltése" alt="Betölt" onclick="szem4_ADAT_'+tipus+'_load()" width="17px" src="'+pic("load.png")+'"> \
	<img title="Törlés" alt="Töröl" onclick="szem4_ADAT_del(\''+tipus+'\')" src="'+pic("del.png")+'" width="17px""> \
	<img title="Jelenlegi adat kiiratása" alt="Export" onclick="szem4_ADAT_kiir(\''+tipus+'\')" width="17px" src="'+pic("Export.png")+'"> \
	<img title="Saját adat betöltése" alt="Import" onclick="szem4_ADAT_betolt(\''+tipus+'\')" width="17px" src="'+pic("Import.png")+'"> \
	<img title="Mentés MOST" alt="Save" onclick="szem4_ADAT_saveNow(\''+tipus+'\')" width="17px" src="'+pic("saveNow.png")+'">\
	<img title="Reset: Helyreállítás" alt="Reset" onclick="szem4_ADAT_restart(\''+tipus+'\')" width="17px" src="'+pic("reset.png")+'">';
}

ujkieg("adatok","Adatmentő",'<tr><td>\
<p align="center"><b>Figyelem!</b> Az adatmentő legelső elindításakor betölti a lementett adatokat (ha van), nem törődve azzal, hogy jelenleg mi a munkafolyamat.<br>Új adatok használatához az adatmentő indítása előtt használd a törlést a lenti táblázatból.</p>\
<table class="vis" id="adat_opts" style="width:100%; margin-bottom: 50px;"><tr><th style="width:105px">Engedélyezés</th><th style="width:118px">Kiegészítő neve</th><th style="width:250px">Utolsó mentés ideje</th><th style="width:93px">Adat kezelése</th></tr>\
<tr><td><input type="checkbox" checked></td><td>Farmoló</td><td></td><td>'+szem4_ADAT_AddImageRow("farm")+'</td></tr>\
<tr><td><input type="checkbox" checked></td><td>Építő</td><td></td><td>'+szem4_ADAT_AddImageRow("epito")+'</td></tr>\
<tr><td><input type="checkbox" checked></td><td>VIJE,Adatmentő,Hangok</td><td></td><td>'+szem4_ADAT_AddImageRow("sys")+'</td></tr>\
<tr><td><input type="checkbox" unchecked></td><td><img height="17px" src="'+pic('cloud.png')+'"> Cloud sync</td><td></td><td>\
			<img title="Cloud adat betöltése a jelenlegi rendszerbe" alt="Import" onclick="loadCloudDataIntoLocal()" width="17px" src="'+pic("Import.png")+'"> \
			<img title="Local adat lementése a Cloud rendszerbe" alt="Save" onclick="saveLocalDataToCloud(true)" width="17px" src="'+pic("saveNow.png")+'">\
</td></tr>\
</table><p align="center"></p></td></tr>');
var ADAT_PAUSE=false, ADAT_FIRST=0;
szem4_ADAT_motor();
var FARM_TESZTER_TIMEOUT;

$(document).ready(function(){
	nyit("naplo");
	vercheck();
	naplo("Indulás","SZEM 4.5 elindult.");
	naplo("Indulás","Farmolók szünetelő módban.");
	soundVolume(0.0);
	playSound("bot2"); /* Ha elmegy a net, tudjon csipogni */
	if (confirm("Engedélyezed az adatok mentését?\nKésőbb elindíthatja, ha visszapipálja a mentés engedélyezését - ekkor szükséges kézi adatbetöltés is előtte.")) {
		if (CLOUD_AUTHS) {
			naplo("Sync","Connecting to Firebase Cloud System...");
			loadCloudSync();
		} else {
			naplo("Sync","Firebase Cloud System is not setup. Create 'szem_firebase' localStorage item with credentials");
			naplo("Adat","Adatbetöltés helyi adatokból...");
			szem4_ADAT_LoadAll();
		}
	} else {
		szem4_ADAT_StopAll();
	}
	setTimeout(function(){soundVolume(1.0);},2000);
	
	$(function() {
		$("#alert2").draggable({handle: $('#alert2head')});
		$('#sugo').mouseover(function() {sugo(this,"Ez itt a súgó");});
		$('#fejresz').mouseover(function() {sugo(this,"");});
	});
	$("#farm_opts input").on('keydown keypress',function() {
		if (FARM_TESZTER_TIMEOUT) clearTimeout(FARM_TESZTER_TIMEOUT);
		FARM_TESZTER_TIMEOUT = setTimeout(() => shorttest(), 1000);
	});
	document.addEventListener('click', addFreezeNotification);
	document.addEventListener('keypress', addFreezeNotification);
	addFreezeNotification();
	window.onbeforeunload = function() {return true;}
});
/*

FARMVÉDŐ
minimum sereg definiálása 

CONVERT: Határszám -> minimum percnyi termelés
ADDME: VIJE mikor defíti a főhadi/barakkot, azt is mentse a falu infókba. Később majd még többet, mert kell az auto katázóhoz
REFACTOR: Minden változó, a DOM-ba csak ír, nem olvas!
ADDME: Színezést is mentsen a Farmoló
CONVERT: alert notification áthelyezése, +önmagától idővel eltűnő alertek
ADDME: Farmok rendezése táv szerint
ADDME: VIJE stat, h hány %-osan térnek vissza az egységek. Óránként resettelni!?
ADDME: New kieg.: FARMVÉDŐ (Farmolóba, opciókhoz)
ADDME: Ai: Automatikus, falunkénti megbízhatóság- és hatászám számolás. Csak perc alapú, és farmvédő alapú
ADDME: szüneteltethető a falu támadása/pipára mint a "J?" oszlop
ADDME: VIJE opciók: [] zöld kém nélküli jeliket törölje csak
ADDME: Sebesség ms-e leOKézáskor ne legyen érvényes, azt csinálja gyorsabban (konstans rnd(500ms)?)
FIXME: Utolsó visszatérő sereget nézzen, ne default <10p> pihit falu_helye.cells[2].innerHTML=d;
ADDME: "Sárgát NE támadd"
ADDME: Custom wallpaper
EXTRA: Pihenés sync: Ha Farmoló pihen, VIJE is (külön opció VIJE-nél: recommended ha zöld-törlése be van pipálva). Előbb VIJE, aztán farmolás!
ADDME: [Lebegő ablak] PAUSE ALL, I'M OUT
ADDME: [Lebegő ablak] Reset/ébresztő: Néha pihen a script, lehessen "felébreszteni" (timeout clear+újra motorindít)
ADDME: Teherbírás módosító
ADDME: FAKE limit, és ennek figyelembe vétele
NEW KIEG: Auto katázó: Beadod mely faluból max hány percre, mely falukat. VIJE adatai alapján küldi, [] x+1 épületszintet feltételezve 1esével bontásra. [] előtte 2/4 kos v 2/6 kata falra
*/

void(0);