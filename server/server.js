const express = require('express');
const { Configuration, OpenAIApi } = require('openai');

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
    res.header('Access-Control-Allow-Origin', 'https://github.com');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  } else {
    res.status(403).send('Not allowed');
  }
});

const testReview = async () => {
  await new Promise((r) => setTimeout(r, 3000));
  return {
    role: 'assistant',
    content: `The above code change introduces a new function called \`calculateTotal\` which takes two arguments, \`price\` and \`quantity\`. It multiplies the 'price' by the 'quantity' to calculate the total cost of an item and returns the result. This function is particularly useful in scenarios where you need to calculate the total cost of multiple items, such as in an e-commerce application.`,
  };
};

const getReviewFromOpenAI = async (messages) => {
  const openai = new OpenAIApi(configuration);

  const messagesToSend = messages;

  messagesToSend.unshift({
    role: 'system',
    content:
      'You are a AI assistant performing pull request code review. You are knowledgeable about programming and software engineering principles. Please analyze the diff, provide a description of what is changing in the code, and provide any feedback or suggestions for improvements if necessary.',
  });

  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messagesToSend,
  });

  return response.data.choices[0].message;
};

app.post('/review', async (req, res) => {
  const { messages } = req.body;

  console.log('REQUEST', messages);

  const response = testMode
    ? await testReview()
    : await getReviewFromOpenAI(messages);

  console.log('RESPONSE', response);

  res.json({
    response: response,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
