const express = require('express');
const showdown = require('showdown');
const {
  Configuration,
  OpenAIApi
} = require("openai");

const testMode = process.env.NODE_ENV === 'test';

if (testMode) {
  console.log('Running in test mode');
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(express.json());
app.use(function (req, res, next) {
  if (req.headers.origin === 'https://github.com') {
    res.header("Access-Control-Allow-Origin", "https://github.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  } else {
    res.status(403).send('Not allowed');
  }
});

const converter = new showdown.Converter();

const testReview = async () => {
  await new Promise(r => setTimeout(r, 10000));
  return `The above code change introduces a new function called 'calculateTotal' which takes two arguments, 'price' and 'quantity'. It multiplies the 'price' by the 'quantity' to calculate the total cost of an item and returns the result. This function is particularly useful in scenarios where you need to calculate the total cost of multiple items, such as in an e-commerce application.`;
};

const getReviewFromOpenAI = async (code) => {
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

  return completion.data.choices[0].text;
};

app.post('/review', async (req, res) => {
  console.log(req);
  const {
    code
  } = req.body;

  const response = testMode ? await testReview() : await getReviewFromOpenAI(code);

  console.log(response);

  res.json({
    'review': converter.makeHtml(response)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
