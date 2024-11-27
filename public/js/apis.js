function fetchVideo() {
      const videoUrlInput = document.getElementById('videoUrl').value.trim();
      const videoContainer = document.getElementById('videoContainer');
      const fetchButton = document.getElementById('fetchButton');
      const title = document.getElementById('title');
      const loads = document.getElementById('loads');

      // Tampilkan spinner pada tombol
      fetchButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
      fetchButton.disabled = true;

      // Kosongkan kontainer video
      videoContainer.innerHTML = '';
      title.style.display = "block";
      loads.style.display = "block";
      // Mengubah URL menjadi ID
      const ids = videoUrlInput.split(',').map(url => {
        const regex = /https:\/\/[a-zA-Z0-9.-]+\/[de]\/([a-zA-Z0-9]+)/;
        const match = url.match(regex);
        return match ? match[1] : url;
      });

      // Ambil data video untuk setiap ID
      let fetchPromises = ids.map(id =>
        fetch(`https://biasa-alpha.vercel.app/api/poop?id=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': '*/*',
            'User-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.107 Mobile Safari/537.36'
          }
        })
        .then(response => response.json())
        .then(data => {
          if (data.direct_link && data.image) {
            title.style.display = "block";
            // Membuat elemen card dengan tombol Play Video
            
            loads.style.display = "none";
            const videoElement = document.createElement('div');
            videoElement.classList.add('col-md-6', 'mb-4');
            videoElement.innerHTML = `
              <div class="card position-relative rounded-5 p-3">
                <img src="${data.image}" class="card-img-top shadow-lg" alt="Thumbnail" style="height: 230px; object-fit: cover; border-radius: 20px;">
                <button class="btn btn-light position-absolute d-flex align-items-center justify-content-center f400"
                onclick="playVideo('${data.direct_link}')"
                style="top: 50%; left: 50%; transform: translate(-50%, -160%); font-size: 15px; height: 70px; width: 70px; border-radius: 300px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" style="margin-left: 5px;" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
                <p class="card-title f400 position-absolute m-2 rounded-5 py-2 px-3" style="top: 180px; right: 25px; font-size: 15px; background: rgba(225, 225, 225, 0.2); color: white;">${data.duration}</p>
                <div class="mx-2 mt-4 mb-1">
                  <h5 class="card-title f400 titles">${data.name}</h5>
                 <a href="${data.direct_link}" class="btn btn-dark mt-3 w-100 d-flex align-items-center justify-content-center p-3 rounded-4 f400 shadow-lg" download>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" class="me-1" stroke-linejoin="round"><path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5"/></svg>
                 Download Video
                 </a>
                </div>
              </div>
            `;
            videoContainer.appendChild(videoElement);
          }
        })
        .catch(error => console.error('Error:', error))
      );

      // Setelah semua selesai, kembalikan tombol ke keadaan semula
      Promise.all(fetchPromises).finally(() => {
        fetchButton.innerHTML = 'Cari Video';
        fetchButton.disabled = false;
        loads.style.display = "none";
        videoUrlInput.value = "";
      });
    }

    // Fungsi untuk memutar video di dalam modal
    function playVideo(videoUrl) {
      const modalVideo = document.getElementById('modalVideo');
      modalVideo.src = videoUrl;
      const videoModal = new bootstrap.Modal(document.getElementById('videoModal'));
      videoModal.show();
    }
    
    
    
    // api multi
    
    
    
    function fetchData() {
    const inputText = document.getElementById('videoUrl').value;
    const fetchButtons = document.getElementById('fetchButtons');
    
    // Tampilkan spinner pada tombol
    fetchButtons.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;
    fetchButtons.disabled = true;
    
    const url = `https://biasa-alpha.vercel.app/api/multi?url=${encodeURIComponent(inputText)}`;
    
    fetch(url, {
    method: 'GET',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': '*/*',
    'User-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 7 Build/QKQ1.190910.002) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.107 Mobile Safari/537.36'
    }
    })
    .then(response => response.text()) // Mengambil respons sebagai teks
    .then(data => {
    // Memasukkan respons teks ke input field
    document.getElementById('videoUrl').value = data;
    fetchButtons.innerHTML = 'Cari Video Multy';
    fetchButtons.disabled = false;
    document.getElementById('fetchButton').click();
    })
    .catch(error => {
    console.error('Error fetching data:', error);
    });
    }
    
    
    // button
    
    const fetchButtonss = document.getElementById('fetchButton');
    document.getElementById('videoUrl').addEventListener('input', function() {
    const textareaContent = this.value;
    
    // Check if the textarea contains 'kana /p/'
    if (textareaContent.includes('/top2') || 
    textareaContent.includes('/top') || 
    textareaContent.includes('/f/') || 
    textareaContent.includes('/top3')) {
    // Trigger the button click
    document.getElementById('fetchButtons').click();
    fetchButtonss.innerHTML = 'Tunggu sebentar..';
    fetchButtonss.disabled = false;
    }
    });
    