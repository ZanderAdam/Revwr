const express = require('express');

const {
    Configuration,
    OpenAIApi
} = require("openai");

const configuration = new Configuration({
    apiKey: 'sk-',
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

app.post('/review', async (req, res) => {
    console.log(req)
    const {
        code
    } = req.body;

    const openai = new OpenAIApi(configuration);
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Explain the following pull request diff. Formt output as markdown.
        Use following sections (parenthesis describe what this section is about - do not output)
        Explanation (explain the diff)
        Suggestions (provide suggestions for any improvements as a bullet list. Include things like code readability, variable naming, call out any improvements based on software engineering principles like DRY, single responsibility principle)
        Test Coverage (include what test coverage is needed as bullet list)
        ${code}
        `,
        max_tokens: 2048
    });
    console.log(completion.data.choices)

    res.json({
        'review': completion.data.choices[0]
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));