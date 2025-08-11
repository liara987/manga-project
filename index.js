// api/scrape.ts (serverless ou Express)

import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { data } = await axios.get("https://animesdigital.org/");
    const $ = cheerio.load(data);

    const animes = [];

    $(".post-home h2 a").each((_, element) => {
      animes.push({
        title: $(element).text(),
        link: $(element).attr("href"),
      });
    });

    res.status(200).json(animes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer scraping" });
  }
}
