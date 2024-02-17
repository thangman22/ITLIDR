const {onRequest} = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.summaryArticle = onRequest({cors: true, region: 'asia-southeast1' },async (request, response) => {
    const {extract} = await import("@extractus/article-extractor")
    const genAI = new GoogleGenerativeAI("AIzaSyBkE6NvM3nPGeTBjYwWxj-1ijKY6h7fvYQ");
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    let article 
    try {
        article = await extract(request.body.url, {}, {  
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        console.log(article)
    } catch (error) {
        response.status(400).send({
            status: "error",
            text: "Cannot extract article content from the given URL. Please check the URL and try again."
        });
    }

    if(article?.content) {
        const plainContent = article.content.replace(/(<([^>]+)>)/gi, "")
    
        const result = await model.generateContent(`นี่เป็นบทความจาก เว็บไซต์ ${request.body.url} ช่วยสรุปบทความนี้ให้เหลือ 500 ตัวอักษร เป็นภาษาไทย ${plainContent}`);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();
        response.send({
            status: "success",
            title: article.title,
            url: request.body.url,
            sumamry: text,
            image: article.image,
            source: article.source,
            ttr: article.ttr,
            favicon: article.favicon,
        });
        return 
    }
    response.status(400).send({
        status: "error",
        text: "Cannot extract article content from the given URL. Please check the URL and try again."
    });
});
