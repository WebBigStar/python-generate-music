URL = window.URL || window.webkitURL;
const RECORDING_COLOR = "red", RECORDED_COLOR = "yellow", PROMPTED_COLOR = "blue";
const textRecordingButton = "Recording", textPromptButton = "Prompt";

var record, wavesurfer = null;

let startTime, endTime;
let recordedItems = [];
let selectedButton = null;
let recordingButton, promptButton = null;


function generateButtons() {
    // Generate recording button
    recordingButton = square.appendChild(document.createElement('button'))
    recordingButton.textContent = textRecordingButton;
    recordingButton.style.left = "25%"
    recordingButton.style.color = RECORDED_COLOR;
    recordingButton.onclick = () => {
        recordedItems[selectedButton.id]["status"] = "recording";
        console.log("recording button clicked of",selectedButton.id )
        destroyButtons();
    }

    // Generate prompt button
    promptButton = square.appendChild(document.createElement('button'))
    promptButton.textContent = textPromptButton;
    promptButton.style.right = '25%'
    promptButton.style.color = PROMPTED_COLOR;
    promptButton.onclick = () => {
        recordedItems[selectedButton.id]["status"] = "prompt"
        selectedButton.style.backgroundColor = PROMPTED_COLOR;
        destroyButtons();
    }
}

function destroyButtons() {
    square.removeChild(recordingButton) && (recordingButton = null);
    square.removeChild(promptButton) && (promptButton = null);
}

function uploadAudioFile(blob) {
    let d = new Date(startTime);
    let file_name = `Recording__${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}__${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}.wav`;

    const formData = new FormData();
    formData.append('audio', blob, file_name);
    formData.append('csrfmiddlewaretoken', csrfToken);

    $.ajax({
        url: '/upload_audio/',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('Audio uploaded:', data);
        },
        error: function (error) {
            console.error('Error uploading audio:', error);
        }
    });
}

function startRecording(e) {
    e.preventDefault();
    selectedButton = this

    if (recordedItems[selectedButton.id]) {
        // Only replay recorded audio file
        console.log("playing of ",selectedButton.id)
        wavesurfer.destroy() && (wavesurfer = null);
        wavesurfer = WaveSurfer.create({
            container: "#wave_wrapper",
            waveColor: 'rgb(200, 100, 0)',
            progressColor: 'rgb(100, 50, 0)',
            autoplay: true,
            url: recordedItems[e.target.id]["recordedUrl"],
        })
        if (recordedItems[selectedButton.id]["status"] == "pending") generateButtons();
        else destroyButtons();
    } else {
        // Start to record new audio
        console.log("recorded items",recordedItems);
        if (recordedItems.length) {
            console.log("Hello destroy");
            destroyButtons();
        }
        selectedButton.style.backgroundColor = RECORDING_COLOR;
        startTime = new Date().getTime();
        // create new recorder
        record = WaveSurfer.Record.create({
            bufferSize: 4096, numberOfChannels: 1,
        });
        record.on('record-end', (blob) => {
            console.log("");
            const recordedUrl = URL.createObjectURL(blob);
            recordedItems[selectedButton.id] = {recordedUrl, status: "pending"};  // status: pending (recording, prompt);
            console.log("")
            generateButtons();
            console.log('stopped recording of ',selectedButton.id);
            // uploadAudioFile(blob);
        })

        record.on('record-start', () => {
            console.log('Let s start recording of ', selectedButton.id);
        })

        wavesurfer = WaveSurfer.create({
            container: "#wave_wrapper",
            waveColor: "rgb(200,0,200)",
            progressColor: "rgb(100, 0, 100)",
            plugins: [record],
        });
        record.startRecording();
    }
}

function stopRecording(e) {
    e.preventDefault();
    selectedButton && (selectedButton.style.backgroundColor = RECORDED_COLOR);
    record.destroy() && (record = null);
}


button_1.onmousedown = button_2.onmousedown = button_3.onmousedown = button_4.onmousedown = startRecording;
document.body.onmouseup = button_1.onmouseup = button_2.onmouseup = button_3.onmouseup = button_4.onmouseup = stopRecording;
