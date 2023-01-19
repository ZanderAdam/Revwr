const express = require('express');
const showdown = require('showdown');
const {
    Configuration,
    OpenAIApi
} = require("openai");

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(express.json())
app.use(function (req, res, next) {
    if (req.headers.origin === 'https://github.com') {
        res.header("Access-Control-Allow-Origin", "https://github.com");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    } else {
        res.status(403).send('Not allowed');
    }
});

const converter = new showdown.Converter()

app.post('/review', async (req, res) => {
    console.log(req)
    const {
        code
    } = req.body;

    const openai = new OpenAIApi(configuration);
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `
Explain the code diff using the given sections:
##Explanation  (detailed, verbose, explanation of the diff with examples)
##Suggestions (bullet list of suggestions for any improvements. Consider things like readability, variable naming, software engineering principles like DRY, single responsibility principle. Provide explicit examples.)
##Test Coverage (bullet list of test cases with examples)

${code}

Format output as markdown
##Explanation
`,
        max_tokens: 2048
    });
    console.log(completion.data.choices[0].text)

    res.json({
        'review': converter.makeHtml(completion.data.choices[0].text)
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));