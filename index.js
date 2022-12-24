require("dotenv").config();
var metlo = require("metlo")
metlo(process.env.METLO_API_KEY, "https://app.metlo.com:8081");
const axios = require("axios");
const express = require("express");
const cache = require("memory-cache");

const PORT = process.env.PORT || 3080;

//setup metlo

const app = express();
//Create .env file and set RIOT_API_KEY and METLO_API_KEY
console.log("API METLO: " + process.env.METLO_API_KEY)
const apiKey = process.env.RIOT_API_KEY;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Private-Network', '*');
  next();
});

app.use(express.static('public'));
app.use('/images', express.static('images'));

//https://na.api.riotgames.com/val/ranked/v1/leaderboards/by-act/67e373c7-48f7-b422-641b-079ace30b427?size=100&startIndex=0&api_key=RGAPI-edbc2038-07d3-442d-bfb0-a26f2cb0b977

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
//Valorant Leaderboard Query
app.get("/valorantLeaderboard", async function (req, res) {
  res.header("Accesss-Control-Allow-Origin", "*");
  const url = `https://na.api.riotgames.com/val/ranked/v1/leaderboards/by-act/67e373c7-48f7-b422-641b-079ace30b427?size=100&startIndex=0`;
  let resp = await customFetch(url)
  res.send(resp)
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
