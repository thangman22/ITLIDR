const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineString } = require("firebase-functions/params");
const extract = require('extract-json-from-string');
const fetch = require("node-fetch");
const cld = require('cld');

const geminiKey = defineString("GEMINI_KEY");
const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

const extractFromURL = async (url) => {
  const { extract } = await import("@extractus/article-extractor");
  article = await extract(
    url,
    {},
    {
      headers: {
        "user-agent": userAgent,
      },
    }
  );
  return article;
};

const getModel = () => {
  const apiKey = geminiKey.value();
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" },{ apiVersion: "v1beta" });
};

const responseError = (response, error) => {
  console.log(error);
  return response.status(400).send({
    status: "error",
    text: "Cannot extract article content from the given URL. Please check the URL and try again.",
  });
};

exports.summaryArticle = onRequest(
  { cors: true, region: "asia-southeast1", timeoutSeconds: 300, },
  async (request, response) => {
    const model = getModel();
    let article;
    try {
      article = await extractFromURL(request.body.url);
    } catch (error) {
      return responseError(response, error);
    }

    const paragraph = request.body.paragraph || "1";

    if (article?.content) {

      const plainContent = article.content.replace(/(<([^>]+)>)/gi, "");

      let language = "Original";
      const detectedLanguages = await cld.detect(plainContent);
      if (detectedLanguages.languages.length > 0) {
        language = detectedLanguages.languages[0].name.toLowerCase();
      }

      const prompt = `This is an article or news from website ${request.body.url}. Please summary to ${paragraph} paragraph in the ${language} lanaguage.  This is full article ${plainContent}`;
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response;
      const text = geminiResponse.text();
      response.send({
        status: "success",
        title: article.title,
        url: request.body.url,
        summary: text,
        image: article.image,
        source: article.source,
        ttr: article.ttr,
        favicon: article.favicon,
        hash: Buffer.from(request.body.url).toString("base64"),
      });
      return;
    }
    return responseError(response, error);
  }
);

exports.getRelatedQuestion = onRequest(
  { cors: true, region: "asia-southeast1", timeoutSeconds: 300   },
  async (request, response) => {
    const model = getModel();
    let article;
    try {
      article = await extractFromURL(request.body.url);
    } catch (error) {
      return responseError(response, error);
    }

    const paragraph = request.body.paragraph || "1";

    if (article?.content) {

      const plainContent = article.content.replace(/(<([^>]+)>)/gi, "");

      let language = "Original";
      const detectedLanguages = await cld.detect(plainContent);
      if (detectedLanguages.languages.length > 0) {
        language = detectedLanguages.languages[0].name.toLowerCase();
      }

      const prompt = `This is an article or news from website ${request.body.url}. Please suggest me a short 3 question that will be a good prompt for Gemini in ${language}. Without header. Please provide data in a JSON format and remove all markdown syntax. This is full article ${plainContent}`;
      
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response;
      const text = geminiResponse.text();
      let jsonObject = extract(text);
      let questions = jsonObject[0]
      if(!questions) {
        return responseError(response, 'Cannot extract question from the given URL. Please check the URL and try again.');
      }
      if(Array.isArray(questions?.questions)) {
        questions = questions.questions.map((q) => {
          return { question: q }
        })
      }


      if(questions) {
        response.send({
          status: "success",
          questions: questions,
          hash: Buffer.from(request.body.url).toString("base64"),
        });
      }
      return;
    }
    return responseError(response, error);
  }
);

exports.askArticle = onRequest(
  { cors: true, region: "asia-southeast1", timeoutSeconds: 300 },
  async (request, response) => {
    const model = getModel();
    let article;
    try {
      article = await extractFromURL(request.body.url);
    } catch (error) {
      return responseError(response, error);
    }

    if (article?.content) {

      const plainContent = article.content.replace(/(<([^>]+)>)/gi, "");

      let language = "Original";
      const detectedLanguages = await cld.detect(plainContent);
      if (detectedLanguages.languages.length > 0) {
        language = detectedLanguages.languages[0].name.toLowerCase();
      }
      const prompt = `This is article or news from ${request.body.url}. Based on this is an article or news ${plainContent} please answer this question "${request.body.question}" in ${language}.`;
      const result = await model.generateContent(prompt);
      const geminiResponse = await result.response;
      const text = geminiResponse.text();
      response.send({
        status: "success",
        url: request.body.url,
        summary: text,
        hash: Buffer.from(request.body.url).toString("base64"),
      });
      return;
    }
    return responseError(response, error);
  }
);

exports.imageProxy = onRequest(
  { cors: true, region: "asia-southeast1", timeoutSeconds: 300 },
  async (request, response) => {
    try {
      const imageUrl = request.query.url;
      const imageResponse = await fetch(imageUrl);

      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.buffer();
        response.setHeader("Content-Type", imageResponse.headers.get("content-type"));
        response.send(imageBuffer);
      } else {
        response.status(response.status).send("Failed to fetch image");
      }
    } catch (error) {
      console.error("Proxy error:", error);
      response.status(500).send("Proxy error");
    }
  }
);
