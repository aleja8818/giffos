// JavaScript source code
$buttonGrabar.style.display = 'none';
$buttonFinalizar.style.display = 'none';
$buttonSubirGif.style.display = 'none';
$overlay.style.display = 'none';

let recorder;
let blob;
let form = new FormData();
let arrMyGifos = [];

// timer
let timer;
let hours = '00';
let minutes = '00';
let seconds = '00';

// ejecuta la c?mara y se setea la API
const getStreamAndRecord = async () => {
	$crearGifTitle.innerHTML = `?Nos das acceso <br> a tu c?mara?`;
	$crearGifText.innerHTML = `El acceso a tu camara ser? v?lido s?lo <br> por el tiempo en el que est?s creando el GIFO.`;
	$buttonComenzar.style.visibility = 'hidden';
	$step1.classList.add('step-active');

	await navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				height: { max: 480 }
			}
		})
		.then((mediaStreamObj) => {
			$crearGifTitle.classList.add('hidden');
			$crearGifText.classList.add('hidden');
			$step1.classList.remove('step-active');
			$step2.classList.add('step-active');
			$buttonComenzar.style.display = 'none';
			$buttonGrabar.style.display = 'block';
			$video.classList.remove('hidden');
			$video.srcObject = mediaStreamObj;
			$video.play();

			recorder = RecordRTC(mediaStreamObj, {
				type: 'gif',
				frameRate: 1,
				quality: 10,
				width: 360,
				hidden: 240,
				onGifRecordingStarted: function () {
					console.log('started');
				}
			});
		})
		.catch((err) => console.log(err));
};

$buttonComenzar.addEventListener('click', getStreamAndRecord);

const createGifo = () => {
	console.log('est? grabando');
	$buttonGrabar.style.display = 'none';
	$buttonFinalizar.style.display = 'block';
	$timer.classList.remove('hidden');
	$repeatBtn.classList.add('hidden');
	recorder.startRecording();
	timer = setInterval(timerActive, 1000);
};

$buttonGrabar.addEventListener('click', createGifo);

const stopCreatingGif = () => {
	$video.classList.add('hidden');
	$recordedGifo.classList.remove('hidden');
	recorder.stopRecording(() => {
		blob = recorder.getBlob();
		$recordedGifo.src = URL.createObjectURL(blob);

		form.append('file', recorder.getBlob(), 'myGif.gif');
		console.log(form.get('file'));
	});

	$buttonFinalizar.style.display = 'none';
	$buttonSubirGif.style.display = 'block';
	$timer.classList.add('hidden');
	$repeatBtn.classList.remove('hidden');

	clearInterval(timer);
	hours = '00';
	minutes = '00';
	seconds = '00';
	$timer.innerText = `${hours}:${minutes}:${seconds}`;
};

$buttonFinalizar.addEventListener('click', stopCreatingGif);

const uploeadCreatedGif = async () => {
	$overlay.style.display = 'flex';
	$step2.classList.remove('step-active');
	$step3.classList.add('step-active');
	$repeatBtn.classList.add('hidden');
	$buttonSubirGif.style.visibility = 'hidden';

	await fetch(`${uploadGifEndpoint}?api_key=${apiKey}`, {
		method: 'POST',
		body: form,
	})
		.then((response) => response.json())
		.then((myGif) => {

			let myGifoId = myGif.data.id
			console.log(myGif.data.id);
			$overlayStatusIcon.src = 'assets/check.svg';
			$overlayStatusText.innerHTML = 'GIFO subido con ?xito';

			let buttonsMyGif = document.createElement('div');
			buttonsMyGif.classList.add('overlay__buttons');
			buttonsMyGif.innerHTML = `<div class="btns downloadOverlay" onclick="downloadCreatedGif('${myGifoId}')"></div> 
			<div class="btns linkOverlay" onclick="displayMisGifosSection(event)"></div>`;
			$overlay.appendChild(buttonsMyGif);

			arrMyGifos.push(myGifoId);
			console.log(arrMyGifos);

			myGifos = localStorage.setItem('MyGifs', JSON.stringify(arrMyGifos));
		})
		.catch((err) => {
			console.error(err);
		});
};

$buttonSubirGif.addEventListener('click', uploeadCreatedGif);
const repeatRecordingGif = (event) => {
	event.preventDefault();
	recorder.clearRecordedData();
	$step2.classList.add('step-active');
	$repeatBtn.classList.add('hidden');
	$buttonGrabar.style.display = 'block';
	$buttonSubirGif.style.display = 'none';
	$video.classList.remove('hidden');
	$recordedGifo.classList.add('hidden');

	navigator.mediaDevices
		.getUserMedia({
			audio: false,
			video: {
				height: { max: 480 }
			}
		})
		.then((mediaStreamObj) => {
			$video.srcObject = mediaStreamObj;
			$video.play();

			recorder = RecordRTC(mediaStreamObj, {
				type: 'gif',
				frameRate: 1,
				quality: 10,
				width: 360,
				hidden: 240,
				onGifRecordingStarted: function () {
					console.log('started');
				}
			});
		})
		.catch((err) => console.log(err));
};
$repeatBtn.addEventListener('click', repeatRecordingGif);

const downloadCreatedGif = async (myGifId) => {
	let blob = await fetch(
		`https://media.giphy.com/media/${myGifId}/giphy.gif`
	).then((img) => img.blob());
	invokeSaveAsDialog(blob, 'My-Gif.gif');
};

function timerActive() {
	seconds++;

	if (seconds < 10) seconds = `0` + seconds;

	if (seconds > 59) {
		seconds = `00`;
		minutes++;

		if (minutes < 10) minutes = `0` + minutes;
	}

	if (minutes > 59) {
		minutes = `00`;
		hours++;

		if (hours < 10) hours = `0` + hours;
	}

	$timer.innerHTML = `${hours}:${minutes}:${seconds}`;
}
