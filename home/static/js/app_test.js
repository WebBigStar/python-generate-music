// const container = document.querySelector('#recordings');
URL = window.URL || window.webkitURL;
var record = WaveSurfer.Record.create({});
var wavesurfer = WaveSurfer.create({
    container: "#recording",
    waveColor: "rgb(200,0,200)",
    progressColor: "rgb(100, 0, 100)",
    plugins: [record],
});

let startTime, endTime;
let selectedButton = null;


record.on('record-end',(blob) => {
    const recordedUrl = URL.createObjectURL(blob);

    var d = new Date(startTime);
    var file_name = `Recording__${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}__${d.getHours()}_${d.getMinutes()}_${d.getSeconds()}.wav`;

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
            const wavesurfer = WaveSurfer.create({
                container:"#recording",
                waveColor: 'rgb(200, 100, 0)',
                progressColor: 'rgb(100, 50, 0)',
                url: recordedUrl,
            })
            wavesurfer.play();
            console.log('Audio uploaded:', data);
        },
        error: function (error) {
            console.error('Error uploading audio:', error);
        }
    });

})
function startRecording(e) {
    e.preventDefault();
    selectedButton = this
    selectedButton.style.backgroundColor = "red";
    startTime = new Date().getTime();
    record.startRecording();
}

function stopRecording(e) {
    e.preventDefault();
    selectedButton && (selectedButton.style.backgroundColor = "yellow");e.preventDefault();
    selectedButton && (selectedButton.style.backgroundColor = "yellow");
    record.stopRecording();
    record.destroy();
}


button_1.onmousedown = button_2.onmousedown = button_3.onmousedown = button_4.onmousedown = startRecording;
// document.body.onmouseup = button_1.onmouseup = button_2.onmouseup = button_3.onmouseup = button_4.onmouseup = stopRecording;
document.body.onmouseup = button_1.onmouseup = button_2.onmouseup = button_3.onmouseup = button_4.onmouseup = stopRecording;
