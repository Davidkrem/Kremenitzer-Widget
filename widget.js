// API REQUEST:
// 1. fetching data from API
// 2. Used Stringify to convert object to string to send to API
// 3. POST BODY is the data that is sent to the API. (data info came from PDF instructions)
// 4. Method POST is the type of request
// 5. Will return placements[0].list since the 0 index in placement is the one we want to display

async function getAPIData() {
  const url =
    'https://api.taboola.com/2.0/json/apitestaccount/recommendations.get';

  try {
    const response = await fetch(url, {
      method: 'POST',
      // stringify the json object to send to the API
      body: JSON.stringify({
        placements: [
          {
            name: 'Below Article Thumbnails',
            recCount: 6,
            organicType: 'mix',
            thumbnail: {
              width: 640,
              height: 480,
            },
          },
        ],
        user: {
          session: 'init',
          realip: '24.126.139.0',
          agent:
            'Mozilla%2F5.0+(Windows+NT+10.0%3B+Win64%3B+x64%3B+ServiceUI+13)+AppleWebKit%2F537.36+(KHTML%2C+like+Gecko)+Chrome%2F64.0.3282.140+Safari%2F537.36+Edge%2F17.17134',
          device: '14A7B4BB0B5B63781A90BE1B0F5B6019',
        },
        app: {
          type: 'WEB',
          apiKey: '7be65fc78e52c11727793f68b06d782cff9ede3c',
          name: 'take-homechallenge',
          origin: 'CLIENT',
        },
        view: {
          id: 'a558e7763d614902a3689c69b23c25a7',
        },
        source: {
          type: 'TEXT',
          id: 'resources/articles',
          url: 'https://blog.taboola.com/digiday-publishing-summit',
        },
      }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log('json data response returned', data.placements[0].list);
      return data.placements[0].list;
    }
  } catch (error) {
    console.log(error, 'error messsaggggeee');
  }
}

// Used functions to create elements and append to DOM. This allows for reusability and cleaner nesting of elements
const createArticle = (data) => {
  const articleElement = document.createElement('article');
  articleElement.appendChild(createArticleAnchor(data));
  articleElement.classList.add('taboola-article');
  return articleElement;
};

// Adding image, name and branding to each article
const createArticleAnchor = (data) => {
  const articleAnchor = document.createElement('a');
  articleAnchor.target = '_blank';
  articleAnchor.href = data.url;
  articleAnchor.className = 'taboola-anchor';
  articleAnchor.appendChild(createImage(data));
  articleAnchor.appendChild(createName(data));
  articleAnchor.appendChild(createBranding(data));
  return articleAnchor;
};

// If image does not exist, default text will be displayed
const createImage = (data) => {
  const imageElement = document.createElement('img');
  imageElement.className = 'taboola-image';
  imageElement.src = data.thumbnail[0].url;
  imageElement.alt = data.name || 'News Image';
  return imageElement;
};

const createName = (data) => {
  const nameElement = document.createElement('h3');
  nameElement.className = 'taboola-name';
  nameElement.innerText = data.name || 'Loading...';
  return nameElement;
};

const createBranding = (data) => {
  const brandingElement = document.createElement('p');
  brandingElement.className = 'taboola-branding';
  if (data.catagories && data.catagories.length > 0) {
    brandingElement.innerText =
      `${data.catagories[0].name} | Ad` ||
      `${data.branding} | Ad` ||
      'Loading...';
  } else {
    brandingElement.innerText = data.branding + ' |  Ad';
  }
  return brandingElement;
};

const hyperlinkAnchor = (className, href, text) => {
  const anchor = document.createElement('a');
  anchor.className = className;
  anchor.href = href;
  anchor.innerText = text;
  return anchor;
};

const disclosureImage = (className, imgURL) => {
  const img = document.createElement('img');
  img.className = className;
  img.src = imgURL;
  return img;
};

// Reussable Utility Function to created divs
const utilityDiv = (className, text = '') => {
  const div = document.createElement('div');
  div.className = className;
  div.innerText = text;
  return div;
};

// Using IP API to find country_name by IP Address
let country;
async function findCountry() {
  const response = await fetch('https://ipapi.co/8.8.8.8/json/');
  try {
    if (response.ok) {
      const data = await response.json();
      country = data.country_name;
    }
  } catch (error) {
    console.log(error);
  }
}
findCountry();

async function buildWidget() {
  const recommendations = await getAPIData(); // targeted articles recomended by taboola
  const widgetDiv = document.createElement('widget-main-div');
  const widgetHeader = widgetDiv.appendChild(
    utilityDiv('widget-header-disclosure')
  );
  if (country === 'United States') {
    // if country is US. In addition --> including Taboola's Top Traffic Analytics Countries
    widgetHeader.appendChild(utilityDiv('likes', 'You May Like')); // US 26.8% Traffic
  } else if (country === 'Japan') {
    widgetHeader.appendChild(
      utilityDiv('Suki', 'Anata wa suki kamo shiremasen')
    ); // Japan 9% Traffic
  } else if (country === 'Germany') {
    widgetHeader.appendChild(utilityDiv('Likes', 'Vielleicht magst du')); // Germany 8.5% Traffic
  } else if (country === 'Brazil') {
    widgetHeader.appendChild(utilityDiv('Gostos', 'Você pode gostar')); // Brazil 7.5% Traffic
  } else {
    widgetHeader.appendChild(utilityDiv('Likes', 'You May Like')); // default back to English
  }
  const recommendationsContainer = widgetDiv.appendChild(
    utilityDiv('recommendations-container')
  );
  const widgetContent = document.getElementsByTagName('main')[0]; // this is the main content of the page
  recommendations.forEach((rec) => {
    // For each recommended article in the list from Taboola
    recommendationsContainer.appendChild(createArticle(rec)); // This triggers the
  });
  widgetContent.appendChild(widgetDiv);

  const disclosure = widgetHeader.appendChild(
    hyperlinkAnchor(
      'disclosure',
      'https://www.taboola.com/',
      'Sponsored Links by Taboola'
    )
  );

  disclosure.appendChild(
    disclosureImage(
      'taboola-disclosure-img',
      'https://popup.taboola.com/images/adchoice-logo.jpgommit -m"'
    )
  );
}

buildWidget(); // build and display the widget on the page
