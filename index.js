require("dotenv").config();
var metlo = require("metlo").default
metlo(process.env.METLO_API_KEY, "https://app.metlo.com:8081");
const axios = require("axios");
const express = require("express");
const cache = require("memory-cache");

const PORT = process.env.PORT || 3080;

//setup metlo

const app = express();
//Create .env file and set RIOT_API_KEY and METLO_API_KEY

const apiKey = process.env.RIOT_API_KEY;
const riotKey = process.env.RIOT_VAL_KEY;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Private-Network', '*');
  next();
});

app.use(express.static('public'));
app.use('/images', express.static('images'));

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
            return e
          }

    }
  }


//RIOT OAUTH SIGN CALLBACK
//TODO

//REFRESH DATA
async function summonerRefresh(summoner) {
  const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summoner}`;
  var id = 0;
  const matchList = `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${id}/ids?start=0&count=10`;
  let resp = await axios.get(url, {
    params: {
      api_key: apiKey,
    }
    });
    if (resp.status === 200 && resp.data) {
      console.log("RAN REFRESH")
      id = resp.data.puuid;
    }
    cache.del(url);
    cache.del(matchList);
    console.log("REFRESH COMPLETE")
  }


app.get("/summoner-refresh", async function (req, res){
  const summonerName = req.query.user;
  summonerRefresh(summonerName)
  res.sendStatus(200)
})

//LEAGUE OF LEGENDS
//Summoner Data Query
app.get("/summonerDataQuery", async function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    const summonerName = req.query.user;
    const url = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`;
    let resp = await customFetch(url);
    console.log(resp);
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
    console.log(resp);
    res.send(resp)
})


//VALORANT Custom Fetch
async function customValFetch(url) {
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
              api_key: riotKey,
            }
          });
          if (resp.status === 200 && resp.data) {
            cache.put(url, resp.data, hours * 1000 * 60 * 60);
            console.log("RAN CALL")
            return resp.data
          }
          return null
        } catch(e) {
          return e
        }

  }
}


//Valorant Leaderboard Query
app.get("/valorantLeaderboard", async function (req, res) {
  res.header("Accesss-Control-Allow-Origin", "*");
  const url = `https://na.api.riotgames.com/val/ranked/v1/leaderboards/by-act/aca29595-40e4-01f5-3f35-b1b3d304c96e?size=200&startIndex=0`;
  let resp = await customValFetch(url)
  res.send(resp)
})


// BEGIN OF VALORANT API CALLS
//Fetch for valorant calls
/*
async function customFetch(url) {
  const cachedResponse = cache.get(url);
  const hours = 24;
  if(cachedResponse) {
      console.log("RAN VAL CACHE")
      return cachedResponse
  }
  else {
      resp = axios.get(`${url}`, {
      params: {
        api_key: process.env.RIOT_VAL_KEY
      }
    }).then(response => {
      // Extract the data you need from the response and send it back to the client
      resp.status(200).send({
        puuid: response.data.puuid,
      });
    }).catch(error => {
      // Handle any errors that may occur during the API call
      console.error(error);
      resp.status(500).send({
        error: 'Error calling the Riot API'
      });
    });
  }
}

app.get("/valorant-user", async function (req, res){
  res.header("Accesss-Control-Allow-Origin", "*");
  const url = `https://na.api.riotgames.com/val/ranked/v1/leaderboards/by-act/67e373c7-48f7-b422-641b-079ace30b427?size=100&startIndex=0`;
  let resp = await customFetch(url)
  res.send(resp)
})
*/

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
