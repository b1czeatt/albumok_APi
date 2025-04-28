
const apiUrl = 'http://localhost:3000/albums';


window.onload = function () {
  fetchAlbums();
};


function fetchAlbums() {
  fetch(apiUrl)
    .then(response => response.json())
    .then(albums => {
      const tbody = document.querySelector('#albumsTable tbody');
      tbody.innerHTML = ''; 

      albums.forEach(album => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${album.band_name}</td>
          <td>${album.album_title}</td>
          <td>${album.release_year}</td>
          <td>${album.genre}</td>
          <td>
            <button onclick="showAlbum(${album.id})">Megjelenítés</button>
            <button onclick="editAlbum(${album.id})">Módosítás</button>
            <button onclick="deleteAlbum(${album.id})">Törlés</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => console.error('Error fetching albums:', error));
}


function isDuplicate(band_name, album_title) {
  const rows = document.querySelectorAll('#albumsTable tbody tr');
  for (let row of rows) {
    const cells = row.querySelectorAll('td');
    const existingBand = cells[0]?.innerText.trim();
    const existingAlbum = cells[1]?.innerText.trim();

    if (existingBand === band_name && existingAlbum === album_title) {
      return true; 
    }
  }
  return false; 
}


document.querySelector('#addAlbumForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const band_name = document.querySelector('#band_name').value.trim();
  const album_title = document.querySelector('#album_title').value.trim();
  const release_year = document.querySelector('#release_year').value.trim();
  const genre = document.querySelector('#genre').value.trim();

  if (!band_name || !album_title || !release_year || !genre) {
    alert('Minden mezőt ki kell tölteni!');
    return;
  }

  
  if (isDuplicate(band_name, album_title)) {
    alert('Ez az album már létezik!');
    return;
  }

  const newAlbum = { band_name, album_title, release_year, genre };

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAlbum),
  })
    .then(response => {
      if (!response.ok) throw new Error('Nem sikerült hozzáadni az albumot!');
      return response.json();
    })
    .then(() => {
      fetchAlbums(); 
      document.querySelector('#addAlbumForm').reset(); 
    })
    .catch(error => console.error('Error adding album:', error));
});


function showAlbum(id) {
  fetch(`${apiUrl}/${id}`)
    .then(response => response.json())
    .then(album => {
      alert(`Zenekar: ${album.band_name}\nAlbum címe: ${album.album_title}\nKiadási év: ${album.release_year}\nMűfaj: ${album.genre}`);
    })
    .catch(error => console.error('Error fetching album:', error));
}


function editAlbum(id) {
  fetch(`${apiUrl}/${id}`)
    .then(response => response.json())
    .then(album => {
      const band_name = prompt('Zenekar:', album.band_name);
      const album_title = prompt('Album címe:', album.album_title);
      const release_year = prompt('Kiadási év:', album.release_year);
      const genre = prompt('Műfaj:', album.genre);

      if (!band_name || !album_title || !release_year || !genre) {
        alert('Minden mezőt ki kell tölteni!');
        return;
      }

      const updatedAlbum = { band_name, album_title, release_year, genre };

      fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAlbum),
      })
        .then(response => {
          if (!response.ok) throw new Error('Nem sikerült módosítani az albumot!');
          return response.json();
        })
        .then(() => {
          fetchAlbums(); 
        })
        .catch(error => console.error('Error editing album:', error));
    })
    .catch(error => console.error('Error fetching album for editing:', error));
}


function deleteAlbum(id) {
  if (!confirm('Biztosan törölni szeretnéd az albumot?')) return;

  fetch(`${apiUrl}/${id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) throw new Error('Nem sikerült törölni az albumot!');
      fetchAlbums(); 
    })
    .catch(error => console.error('Error deleting album:', error));
}
