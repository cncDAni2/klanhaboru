javascript: if (typeof(FENNTART)!="undefined") var dupla=true; else var dupla=false;

var FENNTART=0; /*Ennyi tanyahelyet hagy meg*/
var MAXIDO=80; /*Maximum ennyi órára teszi be a képzést*/
var MAX_NYERS=new Array(0,0,0); /*Ennyi nyersanyagot hagy meg a faluban: fa,agyag,vas*/

/*Ennyi sereget vesz:*/
var LANDZSA=0;
var KARDOS =0;
var BARDOS =0;
var IJASZ  =0;

var KEM=0;
var KL =0;
var IL =0;
var NL =0;

var KOS =0;
var KATA=0;

/*Script következik, nem módosítható*/
/*Innentől minify-old*/
if (dupla){
	init2();
	exit(0);
}

var worker = createWorker(function(self){
	self.addEventListener("message", function(e) {
		setTimeout(() => { postMessage(e.data); }, e.data.time);
	}, false);
});
worker.onmessage = function(worker_message) {
	worker_message = worker_message.data;
	REFARRAY[worker_message.index]=window.open(document.getElementById("production_table").rows[worker_message.row].cells[0].getElementsByTagName("a")[0].href.replace("overview","train"),"kikepzo"+worker_message.index);
};
function createWorker(main){
	var blob = new Blob(
		["(" + main.toString() + ")(self)"],
		{type: "text/javascript"}
	);
	return new Worker(window.URL.createObjectURL(blob));
}

function init2(){
	var X=document.getElementById("kik_divbox");
	var illeszt=new Array(LANDZSA,KARDOS,BARDOS,IJASZ,KEM,KL,IL,NL,KOS,KATA,MAXIDO,FENNTART,MAX_NYERS[0],MAX_NYERS[1],MAX_NYERS[2]);
	for (var i=0;i<illeszt.length;i++){
		X.getElementsByTagName("input")[i].value=illeszt[i];
	}
	return;
}
function setLoadmask(str) {
	document.getElementById("TTloadmask").innerHTML = str;
}

function init(){
	$("body").append('<div style="background-color: white; background-image: url(\'https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/Turbo_kikepzo.png\'); width:870px; color: #006; background-position:left top; background-repeat:no-repeat; position: absolute; right:0px; top:260px; border:3px solid blue; padding: 5px; z-index:200; margin-bottom: 50px;" id="kik_divbox"><div id="kik_boxhead"><br><br></div>\
	<table style="padding: 0px; margin-left:25px; border: 0" id="kik_beall"><tr><td style="padding-right: 15px"></td><td style="padding-right: 15px"></td><td style="padding-right: 15px"></td><td style="padding-right: 15px"></td></tr></table>\
	<input type="button" onclick="kikepzo_nyit()" value="1) Lapmegnyitás"> <input type="button" onclick="kikepzo_kepez()" value="2) Kiképzés"> <input type="button" onclick="kikepzo_zar()" value="3) Lapbezárás"> <img height="20px" src="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/kuka.png" title="Eredménytábla tartalmának ürítése" alt="Ürít" onclick="kik_urit()" style="cursor: pointer; cursor: hand;" >&nbsp;&nbsp;&nbsp;<p id="TTloadmask" style="display:inline;font-weight: bold;font-size: 125%;"></p>\
	<table id="eredmeny" style="border: 1px solid black;" width="850px"><tr style="color: #0A0;text-shadow: 1px 1px 3px #0F0; font-weight:bold;"><td><a href="javascript: rendez(0)">No.</a></td><td>Falu</td><td><a href="javascript: rendez(2)">Képzés +</a></td><td><a href="javascript: rendez(3)">Képzés össz</a></td><td>Kiképzett sereg</td><td><a href="javascript: rendez(5)" style="width:300px">Eredmény</a></td></tr></table>\
	C&amp;C Műhely ~ cncDAni2<div style="height: 50px; margin: 0 0 -50px 0; background:transparent;"></div>');
	var Ksereg=new Array(LANDZSA,KARDOS,BARDOS,IJASZ,KEM,KL,IL,NL,KOS,KATA); /*A cél sereg*/
	var units=new Array("spear","sword","axe","archer","spy","light","marcher","heavy","ram","catapult");
	
	var seregTerv=document.getElementById('kik_beall').rows;
	var kikep_sereg_img=""; var j=0;
	for (var i=0;i<Ksereg.length;i++){
		seregTerv[0].cells[j].innerHTML+='<img src="/graphic/unit/unit_'+units[i]+'.png"><input style="background-color: rgba(255,255,255,0.6)" type="text" size="4" value="'+Ksereg[i]+'"><br>';
		if (i==3 || i==7) j++;
	}
	seregTerv[0].cells[3].innerHTML+='\
	<img src="https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/ora.png" alt="ido" title="Maximális kiképzési idő"><input style="background-color: rgba(255,255,255,0.6)" type="text" size="4" value="'+MAXIDO+'"><br> \
	<img src="graphic/buildings/farm.png" title="Meghagyott tanyahely"><input style="background-color: rgba(255,255,255,0.6)" size="4" type="text" value="'+FENNTART+'"><br> \
	<img src="graphic/holz.png" title="Meghagyott fa"><input style="background-color: rgba(255,255,255,0.6)" size="4" type="text" value="'+MAX_NYERS[0]+'"> \
	<img src="graphic/lehm.png" title="Meghagyott agyag"><input style="background-color: rgba(255,255,255,0.6)" size="4" type="text" value="'+MAX_NYERS[1]+'"> \
	<img src="graphic/eisen.png" title="Meghagyott vas"><input style="background-color: rgba(255,255,255,0.6)" size="4" type="text" value="'+MAX_NYERS[2]+'">';
}

function kik_urit(){try{
	if (!confirm('Az eredménytábla ürítésre fog kerülni.\nFolytatja?')) return;
	var kik_u=document.getElementById('eredmeny');
	if (kik_u.rows.length==1) return;
	while (kik_u.rows.length>1){
		kik_u.deleteRow(1);
	}
	return;
}catch(e){alert("Ürítéskor:\n"+e);}}

function openIt(a,b){
	worker.postMessage({
		index: a,
		row: b,
		time: (a*150) + (Math.random()*150)
	});
	// setTimeout(function(){
	// 	refarray[a]=window.open(document.getElementById("production_table").rows[b].cells[0].getElementsByTagName("a")[0].href.replace("overview","train"),"kikepzo"+a);
	// }, (a*150) + (Math.random()*150));
}

function kikepzo_nyit(){try{
	setLoadmask('');
	REFARRAY=new Array();
	var falvak=document.getElementById("production_table");
	var eredmeny=document.getElementById("eredmeny");
	var j=0;
	SORDIFF=eredmeny.rows.length-1;
	for (var i=1;i<falvak.rows.length;i++){
		if (falvak.rows[i].style.display=="none") continue;
		openIt(j,i);
		var sor=eredmeny.insertRow(-1);
		var cell=sor.insertCell(0); cell.innerHTML=SORDIFF+j;
			cell=sor.insertCell(1); cell.innerHTML=falvak.rows[i].cells[0].getElementsByTagName("span")[0].innerHTML;
			cell=sor.insertCell(2); cell.innerHTML="";
			cell=sor.insertCell(3); cell.innerHTML="";
			cell=sor.insertCell(4); cell.innerHTML="";
			cell=sor.insertCell(5); cell.innerHTML="";
		j++;
	}
}catch(e){alert("Hiba megnyitáskor:\n"+e);}}

function kikepzo_kepez1(kik_NO){try{
	var kik_d=document.getElementById('kik_beall').getElementsByTagName("input");
	for (var i=0;i<kik_d.length;i++){
		kik_d[i].value=kik_d[i].value.replace(/[^0-9]/g,"");
		if (kik_d[i].value=="") kik_d[i].value="0";
	}
	MAXIDO=parseInt(kik_d[10].value,10)*3600;
	FENNTART=parseInt(kik_d[11].value,10);
	MAX_NYERS[0]=parseInt(kik_d[12].value,10);
	MAX_NYERS[1]=parseInt(kik_d[13].value,10);
	MAX_NYERS[2]=parseInt(kik_d[14].value,10);
	var CL=REFARRAY[kik_NO];
	var Ksereg=new Array(); /*A cél sereg: document -TO-> tömb*/
	var istech=new Array();
	var units=new Array("spear","sword","axe","archer","spy","light","marcher","heavy","ram","catapult");	
	for (var i=0;i<10;i++){
		Ksereg[i]=parseInt(kik_d[i].value,10);
		/*Tech-check*/
		if (Ksereg[i]>0){
			if (!CL.document.getElementById(units[i]+"_0")){
				istech[i]=false;
			} else istech[i]=true;
		} else istech[i]=true;
	}
	var sereg=new Array(0,0,0,0,0,0,0,0,0,0); /*Ennyi a max kiképzendő sereg*/
	var Vsereg=new Array(0,0,0,0,0,0,0,0,0,0); /*Ennyi egységet teszünk be*/
	var unitsL=new Array("","","","","","","","","",""); /*Translated units words*/
	var tanyaszuk=new Array(1,1,1,1,2,4,5,6,5,8);
	
	var nyers=new Array(CL.game_data.village.wood - MAX_NYERS[0], CL.game_data.village.stone-MAX_NYERS[1], CL.game_data.village.iron-MAX_NYERS[2]);
	var tanya=CL.game_data.village.pop;
	var tanyamax=CL.game_data.village.pop_max;
	/*console.info(nyers, tanya, tanyamax);*/
	
	var X=CL.document.getElementById("train_form").getElementsByTagName("table")[0].rows;
	var Kidok=new Array(0,0,0,0,0,0,0,0,0,0);
	var jelenlegi=0;  var idok="";
	for (var i=1;i<X.length-1;i++){
		for (var j=0;j<units.length;j++) { if (X[i].cells[0].getElementsByTagName("img")[0].src.indexOf("/"+units[j])>0) {var whatisit=units[j]; unitsL[j]=$.trim(X[i].cells[0].textContent); break;}}
		idok=X[i].cells[1].textContent.match(/[0-9]+/g);
		for (var k=0;k<idok.length;k++){ if (idok[k]!="0") idok[k]=idok[k].replace(/^0/g,"");}
		var masodp=parseInt(idok[idok.length-3])*3600+parseInt(idok[idok.length-2])*60+parseInt(idok[idok.length-1]);
		Kidok[j]=masodp;
		/*sereg=cél-(Jelenleg meglévő sereg + képzés alatt álló)*/
		sereg[j]=Ksereg[j];
		jelenlegi=parseInt(X[i].cells[2].textContent.match(/[0-9]+/g)[1]);
		sereg[j]-=jelenlegi;
	}
	
	
	var foido=new Array(0,0,0); /*Képzési idők mp-be*/
	if (CL.document.getElementById("trainqueue_wrap_barracks")){
	var XX=CL.document.getElementById("trainqueue_wrap_barracks").getElementsByTagName("table")[0].rows;
	if (XX.length==2) var cik=2; else var cik=XX.length-1;
		for (var i=1;i<cik;i++){
			for (var k=0;k<=3;k++){if (XX[i].cells[0].textContent.indexOf(unitsL[k])>0) {sereg[k]-=parseInt(XX[i].cells[0].textContent.match(/[0-9]+/g));}}
			idok=XX[i].cells[1].textContent.match(/[0-9]+/g);
			for (var k=0;k<3;k++){if (idok[k]!="0") idok[k]=idok[k].replace(/^0/g,"");}
			foido[0]+=parseInt(idok[0])*3600+parseInt(idok[1])*60+parseInt(idok[2]);
		}
	}
	if (XX=CL.document.getElementById("trainqueue_wrap_stable")){
	XX=CL.document.getElementById("trainqueue_wrap_stable").getElementsByTagName("table")[0].rows;
	if (XX.length==2) cik=2; else cik=XX.length-1;
		for (var i=1;i<cik;i++){
			for (var k=4;k<=7;k++){if (XX[i].cells[0].textContent.indexOf(unitsL[k])>0) {sereg[k]-=parseInt(XX[i].cells[0].textContent.match(/[0-9]+/g));}}
			idok=XX[i].cells[1].textContent.match(/[0-9]+/g);
			for (var k=0;k<3;k++){if (idok[k]!="0") idok[k]=idok[k].replace(/^0/g,"");}
			foido[1]+=parseInt(idok[0])*3600+parseInt(idok[1])*60+parseInt(idok[2]);
		}
	} 
	if (XX=CL.document.getElementById("trainqueue_wrap_garage")){
	XX=CL.document.getElementById("trainqueue_wrap_garage").getElementsByTagName("table")[0].rows;
	if (XX.length==2) cik=2; else cik=XX.length-1;
		for (var i=1;i<cik;i++){
			for (var k=8;k<=9;k++){if (XX[i].cells[0].textContent.indexOf(unitsL[k])>0) {sereg[k]-=parseInt(XX[i].cells[0].textContent.match(/[0-9]+/g));}}
			idok=XX[i].cells[1].textContent.match(/[0-9]+/g);
			for (var k=0;k<3;k++){if (idok[k]!="0") idok[k]=idok[k].replace(/^0/g,"");}
			foido[2]+=parseInt(idok[0])*3600+parseInt(idok[1])*60+parseInt(idok[2]);
		}
	}
	
	var alap_ido=foido.slice(0);
	var eredmeny="Ismeretlen"; /*Mi miatt állunk meg*/
	while(true){
		var VEGE=true;
		/*1.) foido állítása -1re ahol már nincs több képeznivaló*/
		if (sereg[0]<=0 && sereg[1]<=0 && sereg[2]<=0 && sereg[3]<=0) foido[0]=-1; else {VEGE=false; min=0;}
		if (sereg[4]<=0 && sereg[5]<=0 && sereg[6]<=0 && sereg[7]<=0) foido[1]=-1; else {VEGE=false; min=1;}
		if (sereg[8]<=0 && sereg[9]<=0) foido[2]=-1; else {VEGE=false;min=2;}
		if (VEGE) {eredmeny="A beállított sereg 100%-a le van gyártva"; break;}
		
		/*2.) foido minim helyének keresése, ahol >0 érték van*/
		VEGE=true; var endoftime=new Array(false,false,false);
		for (var i=0;i<foido.length;i++){
			if (foido[i]>MAXIDO) {endoftime[i]=true; foido[i]==-1;}
			if (foido[i]!=-1 && foido[i]<foido[min]) min=i;
		}
		if (endoftime[0]==true) { sereg[0]=0;sereg[1]=0;sereg[2]=0;sereg[3]=0;}
		if (endoftime[1]==true) { sereg[4]=0;sereg[5]=0;sereg[6]=0;sereg[7]=0;}
		if (endoftime[2]==true) { sereg[8]=0;sereg[9]=0;}
		VEGE=true;
		for (var i=0;i<3;i++){if (endoftime[i]==true || foido[i]==-1) VEGE=true; else {VEGE=false; break;}}
		if (VEGE) {eredmeny="Maximális kiképzési idő elérve"; break;}
		
		/*3.) Intervallum készítése min alapján*/
		if (min==0) { also=0; felso=3;
		} else if (min==1){ also=4; felso=7;
		} else if (min==2){ also=8; felso=9;
		}
		
		/*4.) Vásárolandó egység pontosítása, >>rnd<< meghat.: rnd also és felső között; ha a sereg[rnd]>0 akkor megvan*/
		var ezt=""; var vegtelen=0;
		while (ezt==""){
			var rnd=Math.floor((Math.random()*(felso-also+0.99))+also);
			if (sereg[rnd]>0) ezt=units[rnd];
		}
		
		/*5.) Ellenőrzés hogy be lehet e tenni a sorba az egységet (tanya, nyers megléte)*/
		if (tanya+tanyaszuk[rnd]>tanyamax-FENNTART) {eredmeny="Megtelt a tanya: ("+tanya+")"; break;} else tanya+=tanyaszuk[rnd];
			/*5+1.) Nyers szükséglet megállapítása*/
			var nyersszuk=new Array(0,0,0);
			for (var i=1;i<X.length-1;i++){
				/*console.info('CIK::', X[i].cells[0]);*/
				if (X[i].cells[0].innerHTML.indexOf(units[rnd])>0) {
					nyersszuk=new Array(parseInt($.trim(X[i].cells[1].textContent.match(/[0-9]+/g)[0])),
										parseInt($.trim(X[i].cells[1].textContent.match(/[0-9]+/g)[1])),
										parseInt($.trim(X[i].cells[1].textContent.match(/[0-9]+/g)[2]))); 
					break;
				}
			} if (nyersszuk[0]==0) throw "Nyers nem található";
			for (var i=0;i<3;i++) {
				nyers[i]-=nyersszuk[i];
				if (nyers[i]<0) VEGE=true;
			}
			if (VEGE) {eredmeny="Elfogyott a nyersanyag"; break;}
			
			
		/*6.) Betesz a sorba*/
		Vsereg[rnd]++; sereg[rnd]--;  foido[min]+=Kidok[rnd];
		/*alert("Betevés "+also+"-"+felso+":\n"+units[rnd]+"\n Idő: "+Kidok[rnd]+"\n\nIdők:"+foido);*/
	}
	
	/*Kiképzésbe beilleszteni a végeredményt*/
	/*alert(Vsereg+"\n"+Vsereg[6]);*/
	var kikep_sereg_img=""; tech_img=""; var osszkep=new Array(0,0,0,0,0,0,0,0,0,0);
	for (var i=0;i<Vsereg.length;i++){
		if (Vsereg[i]>0) {
			CL.document.getElementById(units[i]+"_0").value=Vsereg[i];
			kikep_sereg_img+=Vsereg[i]+'<img src="/graphic/unit/unit_'+units[i]+'.png"> ';
			osszkep[i]=Kidok[i]*Vsereg[i];
		}
		if (!istech[i]){
			tech_img='<img src="/graphic/unit/unit_'+units[i]+'.png"> ';
		}
	}
	if (tech_img!=""){ tech_img='<b style="font-size:200%; color:red;">!</b>'+tech_img;}
	clickOk(kik_NO);
	
	var betett_ido=new Array(osszkep[0]+osszkep[1]+osszkep[2]+osszkep[3],osszkep[4]+osszkep[5]+osszkep[6]+osszkep[7],osszkep[8]+osszkep[9]);
	var totalido=new Array(alap_ido[0]+betett_ido[0],alap_ido[1]+betett_ido[1],alap_ido[2]+betett_ido[2]);
	var kepplusz=betett_ido[0]; var kepossz=totalido[0];
	for (var i=1;i<totalido.length;i++){
		if (kepplusz<betett_ido[i]) kepplusz=betett_ido[i];
		if (kepossz<totalido[i]) kepossz=totalido[i];
	}
	
	document.getElementById("eredmeny").rows[SORDIFF+kik_NO+1].cells[2].innerHTML=(kepplusz/3600).toFixed(2)+' óra';
	document.getElementById("eredmeny").rows[SORDIFF+kik_NO+1].cells[3].innerHTML=(kepossz/3600).toFixed(2)+' óra';
	document.getElementById("eredmeny").rows[SORDIFF+kik_NO+1].cells[4].innerHTML=tech_img+" "+kikep_sereg_img;
	document.getElementById("eredmeny").rows[SORDIFF+kik_NO+1].cells[5].innerHTML=eredmeny;
	
	function clickOk(id){
		setTimeout(function(){
			REFARRAY[id].document.getElementById('train_form').getElementsByClassName('btn-recruit')[0].click();
			if (id >= REFARRAY.length-1) setLoadmask('Kiképzés elindítva');
		}, id*200 + (Math.random()*50)); /*ILU Tündi*/
	}
}catch(e){alert("Hiba kiképzés betevésekor:\n"+e);}}

function kikepzo_kepez(){try{
	setLoadmask('Kiképzés folyamatban, kérem várjon...');
	for (var ki=0;ki<REFARRAY.length;ki++){
		if (document.getElementById("eredmeny").rows.length<=SORDIFF+ki+1) {alert("Az eredménytáblába nincs hely, így nem tudom hova írni az adatokat. Kezdje az első lépéssel."); return; }
		kikepzo_kepez1(ki);
	}
	return;
}catch(e){alert("Hiba kiképzéskor:\n"+e);}}

function kikepzo_zar(){try{
	setLoadmask('');
	for (var i=0;i<REFARRAY.length;i++){
		REFARRAY[i].close();
	}
	return;
}catch(e){alert("Hiba lapbezáráskor:\n"+e);}}

function rendez(kik_osz){try{
	var OBJ=document.getElementById("eredmeny");
	var prodtable=OBJ.rows;
	var tavok=new Array(); var sorok=new Array(); var indexek=new Array();
	var fix=0; var bool=false;
	var tipus="szam"; if (kik_osz==5) tipus="szoveg";
	
	for (var i=1;i<prodtable.length-fix;i++){
		switch (tipus) {
			case "szoveg": tavok[i-1]=prodtable[i].cells[kik_osz].innerText; break;
			case "szam": tavok[i-1]=parseFloat(prodtable[i].cells[kik_osz].innerText.replace(" óra","")); break;
			default: alert("Nem értelmezhető mi szerint kéne rendezni."); return;
		}
			
		/*switch vége*/
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
	return;
}catch(e){alert("Hiba rendezéskor:\n"+e);}}

var SORDIFF = 0;
init();
REFARRAY = [];

$(document).ready(function(){
	$(function() {
        $("#kik_divbox").draggable({handle: $('#kik_boxhead')});
	}); 
});
void(0);