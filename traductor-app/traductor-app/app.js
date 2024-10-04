const express = require('express');
const bodyParser = require('body-parser');
const {Translate} = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/traducir', async (req, res) => {
    const texto = req.body.texto;
    const idioma = req.body.idioma;

    const translate = new Translate();
    const ttsClient = new textToSpeech.TextToSpeechClient();

    try {
        let [traduccion] = await translate.translate(texto, idioma);

        const request = {
            input: { text: traduccion },
            voice: { languageCode: idioma, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile('public/pronunciacion.mp3', response.audioContent, 'binary');

        res.render('index', { traduccion, audioPath: 'public/pronunciacion.mp3' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`App funcionando en http://localhost:${port}`);
});
