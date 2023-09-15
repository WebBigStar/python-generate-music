URL = window.URL || window.webkitURL;
const RECORDING_COLOR = "red", RECORDED_COLOR = "#FFD600", PROMPTED_COLOR = "#6B95FF";
const textRecordingButton = "Recording", textPromptButton = "Prompt";

var record, wavesurfer = null;

let startTime, endTime;
let recordedItems = [];
let selectedButton = null;
let recordingButton, promptButton = null;
let backArrow, forwardArrow = null;

function generateButtons() {
    let selectedKey = recordedItems.findIndex((e) => e.id == selectedButton.id);

    // Generate recording button
    recordingButton = square.appendChild(document.createElement('button'))
    recordingButton.textContent = textRecordingButton;
    recordingButton.style.left = "25%"
    recordingButton.style.color = RECORDED_COLOR;
    recordingButton.onclick = () => {
        recordedItems[selectedKey].status = "recording";
        destroyButtons();
    }

    // Generate prompt button
    promptButton = square.appendChild(document.createElement('button'))
    promptButton.textContent = textPromptButton;
    promptButton.style.right = '25%'
    promptButton.style.color = PROMPTED_COLOR;
    promptButton.onclick = () => {
        recordedItems[selectedKey].status = "prompt"
        selectedButton.style.backgroundColor = PROMPTED_COLOR;
        destroyButtons();
    }
}

function destroyButtons() {
    if (recordingButton) square.removeChild(recordingButton) && (recordingButton = null);
    if (promptButton) square.removeChild(promptButton) && (promptButton = null);
}

function generateArrows() {
    backArrow = duration.appendChild(document.createElement('span'));
    $(backArrow).addClass('back-arrow').text("<--").css('color',RECORDING_COLOR);
    backArrow.onclick = () => {
        wavesurfer.play()
    }

    forwardArrow = duration.appendChild(document.createElement('span'));
    $(forwardArrow).addClass('forward-arrow').text("-->").css('color',RECORDING_COLOR);

    forwardArrow.onclick = () => {
        wavesurfer.play();
    }
}

function destroyArrows() {
    if(backArrow) duration.removeChild(backArrow) && (backArrow = null);
    if(forwardArrow) duration.removeChild(forwardArrow) && (forwardArrow = null)
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

function buttonClick(e) {
    e.preventDefault();
    selectedButton = this
    let selectedKey = recordedItems.findIndex((e) => e.id == selectedButton.id);
    if (wavesurfer) wavesurfer.destroy() && (wavesurfer = null);
    destroyButtons(),destroyArrows();

    if (selectedKey > -1) {
        // Only replay recorded audio file
        wavesurfer = WaveSurfer.create({
            container: "#wave_wrapper",
            waveColor: 'rgb(200, 100, 0)',
            progressColor: 'rgb(100, 50, 0)',
            url: recordedItems[selectedKey].recordedUrl,
        })
        if (recordedItems[selectedKey].status == "pending") generateButtons();
        generateArrows()
    } else {
        selectedButton.style.backgroundColor = RECORDING_COLOR;

        // create new recorder
        record = WaveSurfer.Record.create({
            bufferSize: 4096, numberOfChannels: 1,
        });

        record.on('record-end', (blob) => {
            const recordedUrl = URL.createObjectURL(blob);
            recordedItems.push({id: selectedButton.id, recordedUrl, status: "pending"});
            selectedButton.style.backgroundColor = RECORDED_COLOR;
            generateButtons();
            generateArrows();
            // uploadAudioFile(blob);
        })

        record.on('record-start', () => {
            startTime = new Date().getTime();
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

function buttonUp(e) {
    e.preventDefault();
    if (record) record.destroy() && (record = null);
}


button_1.onmousedown = button_2.onmousedown = button_3.onmousedown = button_4.onmousedown = buttonClick;
document.body.onmouseup = button_1.onmouseup = button_2.onmouseup = button_3.onmouseup = button_4.onmouseup = buttonUp;
