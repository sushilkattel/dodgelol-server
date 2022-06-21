const axios = require("axios");
const express = require("express");
const cache = require("memory-cache");

const PORT = process.env.PORT || 3080;

const app = express();
const apiKey = 'RGAPI-dda7b5d2-2104-48c0-b1e1-55755912e18c';

app.get("/api", function (req, res) {
    const user = req.query.user
    res.json({ message: "User: ", user });
  });
  //Function to run fetch for api calls
  async function customFetch(url) {
    const cachedResponse = cache.get(url);
    const hours = 24;
    if(cachedResponse) {
        console.log("RAN CACHE")
        return cachedResponse
    }
    else {
        try {
            let resp = await axios.get(url, {
              params: {
                api_key: apiKey,
              }
            });
            if (resp.status === 200 && resp.data) {
              cache.put(url, resp.data, hours * 1000 * 60 * 60);
              console.log("RAN CALL")
              return resp.data
            }
            return null
          } catch(e) {
            return null
          }
    
    }
  }
//Summoner Data Query
app.get("/summonerDataQuery", async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const summonerName = req.query.user;
    console.log(summonerName)
    const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`;
    let resp = await customFetch(url);
    res.send(resp)
});
//Summoner Ranked Query
app.get("/summonerRankedQuery", async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const id = req.query.user;
    const url = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`;
    let resp = await customFetch(url)
    res.send(resp)
    
});
//Game Query
app.get("/summonerGameQuery", async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const id = req.query.user;
    const url = `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`;
    let resp = await customFetch(url)
    res.send(resp)
})
//Matchlist Query
app.get("/summonerMatchlistQuery", async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const id = req.query.user;
    const url = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${id}/ids?start=0&count=10`;
    let resp = await customFetch(url)
    res.send(resp)
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});