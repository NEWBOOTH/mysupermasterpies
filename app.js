const { doesNotThrow } = require('assert');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.static('public'));


const apiKey = '330ae4bafef6ccb937dfb210a75f0fd8'; 

app.get('/', async (req, res) => {
    try {
        let page = req.query.page || 1;
        page = parseInt(page, 10);

        // Fetch popular movies
        const movieUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc&api_key=${apiKey}&append_to_response=videos,images`;
        const movieResponse = await fetch(movieUrl, {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        });

        if (!movieResponse.ok) {
            throw new Error(`HTTP error for movies! Status: ${movieResponse.status}`); 
        }
        const movies = await movieResponse.json();

        // Fetch popular TV shows
        const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc&api_key=${apiKey}&append_to_response=videos,images`;
        const tvResponse = await fetch(tvUrl, {
            method: 'GET',
            headers: {
                accept: 'application/json'
            }
        });

        if (!tvResponse.ok) {
            throw new Error(`HTTP error for TV shows! Status: ${tvResponse.status}`); 
        }
        const tvShows = await tvResponse.json();

        // Combine movies and TV shows
        const combinedData = [...movies.results, ...tvShows.results];

        // Sort the combined data (optional)
        combinedData.sort((a, b) => {
            return b.popularity - a.popularity; // Descending by popularity
        });

        if (combinedData.length > 0) {
            res.render('search', {
                movies: combinedData.slice(0, 20), // Limit to 20 results per page
                currentPage: page // Pass current page for pagination
            });
        } else {
            res.send('<h1>No movies or TV shows found</h1>'); 
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/', async function(req, res) {
  try {
    const searchQuery = req.body.s;
    const url = `https://api.themoviedb.org/3/search/multi?query=${searchQuery}&api_key=${apiKey}&append_to_response=videos,images`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    if (data.results.length > 0) {
        res.render('list', {
          movies: data.results.slice(0, 200)
        });
    } else {
      res.send('<h1>No movies found</h1>');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/movie/:id', async (req, res) => {
  try {
      const movieId = req.params.id;
      const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=videos,images,credits`;
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              accept: 'application/json'
          }
      });
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const movieDetails = await response.json();
      if (movieDetails) {
          res.render('movie', { movie: movieDetails });
      } else {
          res.status(404).send('<h1>Movie not found</h1>');
      }
  } catch (error) {
      console.error('Error fetching movie details:', error);
      res.status
  
  }
  })

app.get('/tv/:id', async (req, res) => {
    try {
      const tvId = req.params.id;
      const [tvShowResponse, seasonsResponse] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}&append_to_response=credits`),
        fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/1?api_key=${apiKey}`) 
      ]);
  
      const tvShow = await tvShowResponse.json();
      const seasons = await seasonsResponse.json(); 
  
      const totalSeasons = tvShow.number_of_seasons;
  
      for (let seasonNumber = 2; seasonNumber <= totalSeasons; seasonNumber++) {
        const seasonResponse = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`);
        const seasonData = await seasonResponse.json();
        seasons.episodes = seasons.episodes.concat(seasonData.episodes);
      }
  
      res.render('tv', { tvShow, seasons }); 
    } catch (error) {
      console.error('Error fetching TV show:', error);
      res.status(500).send('Error fetching TV show details.');
    }
  });

  app.get('/movies', async function(req,res){
    try {
      let page = req.query.page || 1;
      page = parseInt(page, 10);

      // Fetch popular movies
      const movieUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc&api_key=${apiKey}&append_to_response=videos,images`;
      const movieResponse = await fetch(movieUrl, {
          method: 'GET',
          headers: {
              accept: 'application/json'
          }
      });

      if (!movieResponse.ok) {
          throw new Error(`HTTP error for movies! Status: ${movieResponse.status}`); 
      }
      const movies = await movieResponse.json();

      // Fetch popular TV shows
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc&api_key=${apiKey}&append_to_response=videos,images`;
      const tvResponse = await fetch(tvUrl, {
          method: 'GET',
          headers: {
              accept: 'application/json'
          }
      });

      if (!tvResponse.ok) {
          throw new Error(`HTTP error for TV shows! Status: ${tvResponse.status}`); 
      }
      const tvShows = await tvResponse.json();

      // Combine movies and TV shows
      const combinedData = [...movies.results, ...tvShows.results];

      // Sort the combined data (optional)
      combinedData.sort((a, b) => {
          return b.popularity - a.popularity; // Descending by popularity
      });

      if (combinedData.length > 0) {
          res.render('search', {
              movies: combinedData.slice(0, 20), // Limit to 20 results per page
              currentPage: page // Pass current page for pagination
          });
      } else {
          res.send('<h1>No movies or TV shows found</h1>'); 
      }
  } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.post('/', async function(req, res) {
try {
  const searchQuery = req.body.s;
  const url = `https://api.themoviedb.org/3/search/multi?query=${searchQuery}&api_key=${apiKey}&append_to_response=videos,images`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      accept: 'application/json'
    }
  });
  if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();

  if (data.results.length > 0) {
      res.render('list', {
        movies: data.results.slice(0, 200)
      });
  } else {
    res.send('<h1>No movies found</h1>');
  }
} catch (error) {
  console.error('Error fetching data:', error);
  res.status(500).send('Internal Server Error');
}
  })

  app.get('/download/:id', async (req, res) => {
    try {
    const movieId = req.params.id;
  
    // Fetch movie details using the 'multi' endpoint
    const url = `https://api.themoviedb.org/3/multi/${movieId}?api_key=${apiKey}&append_to_response=videos,images,credits`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    });
   
    const movie = await response.json();
  
    
  
      res.render('download', {movie:movie}); 
  } catch (error) {
    console.error('Error fetching TV show:', error);
    res.status(500).send('Error fetching TV show details.');
  }
  });

  app.get('/tv-show', async (req, res) => {
    try {
      let page = req.query.page || 1;
      page = parseInt(page, 10);

      // Fetch popular TV shows (just once)
      const tvUrl = `https://api.themoviedb.org/3/discover/tv?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc&api_key=${apiKey}&append_to_response=videos,images`;
      const tvResponse = await fetch(tvUrl, {
          method: 'GET',
          headers: {
              accept: 'application/json'
          }
      });

      if (!tvResponse.ok) {
          throw new Error(`HTTP error for TV shows! Status: ${tvResponse.status}`); 
      }
      const tvShows = await tvResponse.json();

      // You don't need the movies part anymore
      // const combinedData = [...movies.results, ...tvShows.results];

      if (tvShows.results.length > 0) {
          res.render('series', {
              movies: tvShows.results.slice(0, 20), 
              currentPage: page 
          });
      } else {
          res.send('<h1>No TV shows found</h1>'); 
      }
  } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Internal Server Error');
  }
});




app.listen(3000 ,function() {
  console.log(`Server listening on port 3000`);
});
