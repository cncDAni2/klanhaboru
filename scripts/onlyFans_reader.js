/*
	ask for JOI https://onlyfans.com/477420040/addisonivvy
	..for sharing your secret...all these outfit...princess...SMILE, voice
	Show only unliked
	Manual mode: Call by keyboard
	Pause
	Add "time spent", "No of liked video" (Just icons...)
	Like options: Muted; sound; only non-like
	Paralell: read up and swipe
	BUG: vid_start_eary after Swipe, or not even played
	Narrator: "Next" option
	Next/Prev post
	Write name
	full screen options (Detect full screen image/vids & stop, or options to do that?)
	
*/

function adjustScrollPosition() {
	var visible_item = getCurrentlyVisibleItem();
	console.info(visible_item);
	
	if (visible_item.YCoord > 90) {
		visible_item.isNew = true;
		scrollToPostItem(visible_item.postItem);
	}
	if (!visible_item.postItem) {
		visible_item = getClosestPostItem();
		visible_item.isNew = true;
		if (visible_item.postItem) scrollToPostItem(visible_item.postItem);
	}
	if (!visible_item.postItem) {
		console.error("No more item!");
		window.scrollBy(0, 500);
		return {};
	}
	
	return visible_item;
	
	function getCurrentlyVisibleItem() {
		const visible_elements = document.querySelectorAll('.vue-recycle-scroller__item-view');
		for (var i=0;i<visible_elements.length;i++) {
			var rect = visible_elements[i].getBoundingClientRect();
			var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
			var windowWidth = (window.innerWidth || document.documentElement.clientWidth);

			var isVisible = (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (windowHeight + rect.height) &&
				rect.right <= (windowWidth + rect.width)
			);
			
			if (isVisible) 
				return {
					YCoord: visible_elements[i].getBoundingClientRect().top,
					postItem: visible_elements[i]
				};
		}
		return {
			YCoord: 0,
			postItem: null
		};
	}
	
	
	function getClosestPostItem() {
		var foundedY = 0;
		var next_el = {
			YCoord: 0,
			postItem: null
		};
		const visible_elements = document.querySelectorAll('.vue-recycle-scroller__item-view');
		for (var i=0;i<visible_elements.length;i++) {
			var visible_top = visible_elements[i].getBoundingClientRect().top;
			console.info(visible_top, foundedY, next_el);
			if (visible_top > foundedY && (next_el.YCoord == 0 || next_el.YCoord > visible_top)) {
				next_el = {
					postItem: visible_elements[i],
					YCoord: visible_top
				};
			}
		}
		return next_el;
	}

}
function proceedNextPost(curr_YCoord) {
	const visible_elements = document.querySelectorAll('.vue-recycle-scroller__item-view');
	var next_el = [null, 0];
	for (var i=0;i<visible_elements.length;i++) {
		var visible_top = visible_elements[i].getBoundingClientRect().top;
		if (visible_top > curr_YCoord && (next_el[1] == 0 || next_el[1] > visible_top)) {
			next_el = [visible_elements[i], visible_top];
		}
	}
	scrollToPostItem(next_el[0]);
	start_video(next_el[0]);
	readUpText(next_el[0]);
	setTimeout(() => {likePost(next_el[0]);}, 500);
}
function readUpText(el) {
	const textToRead = el.getElementsByClassName('g-truncated-text')[0].innerText.replace(/(?!\p{N})\p{Emoji}/gu, "");
	console.info(textToRead);
	const message = new SpeechSynthesisUtterance(textToRead);
	message.lang = 'en-US';
	
	const ziraVoice = window.speechSynthesis.getVoices().find(function(voice) {
		return voice.name.includes('Zira');
	});
	message.voice = ziraVoice

	setTimeout(() => {speechSynthesis.speak(message);}, 300);
}
function scrollToPostItem(postItem) {
	postItem.scrollIntoView({behavior: "auto", block: "start", inline: "nearest"});
}

function likePost(postItem) {try{
	var likeButton = postItem.querySelectorAll('.set-favorite-btn')[0];
	if (likeButton.classList.contains('m-active')) return;
	else {
		likeButton.click();
		const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/3000/3000.wav');
		sound.volume = 0.5;
		sound.play();
	}
}catch(e){ console.error('at likePost:', e)}}

function start_video(postItem) {
	console.info("Start video");
	if (postItem.querySelectorAll('.vjs-big-play-button').length > 0) {
		NEXTTIME = 1500;
		console.info("Ez egy videó", postItem.querySelectorAll('.video-js')[0]);
		try{postItem.querySelectorAll('.vjs-big-play-button')[0].click();} catch(e) { console.error('No button?', e);}
		STATE = 'Video_S';
	}
}
function swiper_next(postItem) {
	var next_button = postItem.querySelectorAll('.swiper-button-next:not(.swiper-button-disabled)');
	if (next_button.length > 0) {
		next_button[0].click();
		NEXTTIME = 2000;
		return true;
	}
	return false;
}
function isVideoUnderPlay() {
	var vids = document.querySelectorAll('.video-trigger video');
	console.info("isVideoUnderPlay? ", vids);
	for (var i=0;i<vids.length;i++) {
		if (!vids[i].paused) { STATE = 'Normal'; console.info('yes: ', i, vids[i].paused); return true;}
	}
	console.info("No");
	if (STATE == 'Video_S') {
		console.info("DEBUG");
		scrollToNextElement();
		return true;
	}
	return false;
}

function motor() {try{
	NEXTTIME = 5000;
	switch(STATE) {
		case 'Normal': 
			if (isVideoUnderPlay() || window.speechSynthesis.speaking) {NEXTTIME=1000; break;}
			var nextItem = adjustScrollPosition();
			if (nextItem.isNew) {
				start_video(nextItem.postItem);
				readUpText(nextItem.postItem);
				setTimeout(() => {likePost(nextItem.postItem);}, 500);
				likePost(nextItem.postItem);
			} else {
				if (swiper_next(nextItem.postItem)) break;
				proceedNextPost(nextItem.YCoord);
			}
			break;
		case 'Video_S':
			STATE = 'Normal';
			if (!isVideoUnderPlay()) {
				var nextItem = adjustScrollPosition();
				start_video(nextItem.postItem);
			}
			break;
		case 'Video':
			
			break;
	}
	}catch(e) { console.info("ERR: ", e); NEXTTIME = 3000; STATE = 'Normal'; }
	CNC_TIMER = setTimeout(function() {motor();}, NEXTTIME);
}
function addCSS() {
	var newCSS = document.createElement("style");
	newCSS.textContent = `
		.container {
			max-width: 2500px;
		}
		.l-wrapper__holder-content {
			min-width: 1840px;
			max-width: 2000px;
		}
		.l-wrapper__content {
			max-width: 1840px;
		}
		.b-compact-header.m-sticky[data-v-fe4ef892] {
			display: none;
		}
		.container .g-page__header.m-real-sticky[data-v-37611554]:not(.m-reset-sides-gaps) {
			display: none;
		}`;
	document.head.appendChild(newCSS);
}
var STATE = 'Normal';
var NEXTTIME = 3000;
var CNC_TIMER;
addCSS();
motor();

/*
https://onlyfans.com/544790430/addisonivvy

*/