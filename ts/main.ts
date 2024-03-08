interface FormElements extends HTMLFormControlsCollection {
  cityInput: HTMLInputElement;
}
const apiKey =
  'PFI4az7sB4tUQKWVne-hKBAO_XQ22IouMx4zpOiFSrgEo0H6KZG6ktXa9goetNurD52ebqnYtYOffXVRYaXbITx_KAzZGPElZrHyOJnKbrfO9BKontBsKsrlOivmZXYx';

async function getRequest(targetUrl: string): Promise<any> {
  try {
    const response = await fetch(
      `https://lfz-cors.herokuapp.com/?url=${targetUrl}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    if (!response.ok) throw new Error('Yikes Error Code: ' + response.status);
    const responseJSON = await response.json();
    return responseJSON.businesses;
  } catch (error) {
    throw new Error('ThrowError: data fetch failed.');
  }
}

function createLiElement(
  tag: number,
  imageUrl: string,
  name: string,
  value: string,
): HTMLLIElement {
  const $li = document.createElement('li') as HTMLLIElement;
  const $div1 = document.createElement('div') as HTMLDivElement;
  $div1.className = 'businessEntity';
  const $div2 = document.createElement('div') as HTMLDivElement;
  $div2.className = 'column-full column-half';
  const $img = document.createElement('img') as HTMLImageElement;
  $img.src = imageUrl;
  $img.alt = 'business image';
  const $div3 = document.createElement('div') as HTMLDivElement;
  $div3.className = 'column-full column-half';
  const $h2 = document.createElement('h2');
  $h2.textContent = name;
  const $p = document.createElement('p');
  if (tag === 1) {
    $p.textContent = `rating: ${value}`;
  } else if (tag === 2) {
    $p.textContent = `viewed: ${value}`;
  }

  $li.append($div1);
  $div1.append($div2);
  $div1.append($div3);
  $div2.append($img);
  $div3.append($h2);
  $div3.append($p);
  return $li;
}

const $form = document.getElementById('searchForm') as HTMLFormElement;
if (!$form) {
  throw new Error('$form query failed');
}
const $myListView = document.getElementById('myListView') as HTMLDivElement;
if (!$myListView) {
  throw new Error('$myListView query failed');
}
const $landingPage = document.querySelector(
  'div[data-landing-page="landingPage"]',
) as HTMLDivElement;

const $entitiesView = document.querySelector(
  'div[data-top-rated="entitiesView"]',
) as HTMLDivElement;

const $businessIntro = document.querySelector(
  '.businessIntro',
) as HTMLDivElement;
if (!$landingPage || !$entitiesView || !$businessIntro) {
  throw new Error('$landingPage, $entitiesView or $businessIntro query failed');
}
const $ulElement = document.getElementById('myList') as HTMLUListElement;
if (!$ulElement) {
  throw new Error('$ulElement query failed');
}

let businessesRating: any[] = [];
let businessesCount: any[] = [];
$form.addEventListener('submit', async (event: Event) => {
  event.preventDefault();

  const $formElements = $form.elements as FormElements;
  const $input = $formElements.cityInput;
  let inputValue = $input.value;
  const ratingUrl = encodeURIComponent(
    `https://api.yelp.com/v3/businesses/search?location=${inputValue}&term=food&sort_by=rating`,
  );
  const countUrl = encodeURIComponent(
    `https://api.yelp.com/v3/businesses/search?location=${inputValue}&term=food&sort_by=review_count`,
  );
  businessesRating = await getRequest(ratingUrl);

  /*  console.log("businessRating: ", businessesRating); */
  businessesCount = await getRequest(countUrl);
  const $ulRated = document.createElement('ul') as HTMLUListElement;

  for (let i = 0; i < businessesRating.length; i++) {
    const businessEntity = businessesRating[i];
    const imageUrl = businessEntity.image_url;
    const businessName = businessEntity.name;
    const reviewCount = businessEntity.review_count;
    const $liElement = createLiElement(1, imageUrl, businessName, reviewCount);
    $ulRated.append($liElement);
  }
  $myListView.replaceChildren($ulRated);
  $form.reset();
  $landingPage.style.display = 'none';
  $entitiesView.style.display = 'block';
  inputValue =
    inputValue.charAt(0).toUpperCase() +
    inputValue.slice(1).toLocaleLowerCase();
  $businessIntro.textContent = `Restaurants in ${inputValue}`;
});

const $logo = document.querySelector('.logo') as HTMLDivElement;
if (!$logo) {
  throw new Error('$logo query failed');
}
$logo.addEventListener('click', () => {
  $landingPage.style.display = 'block';
  $entitiesView.style.display = 'none';
});

const $sortByRatedOrViewed = document.getElementById(
  'ratedOrViewed',
) as HTMLSelectElement;
if (!$sortByRatedOrViewed) {
  throw new Error('$sortByRatedOrViewed query failed');
}

/* const location1 = 'Chino'; */
$sortByRatedOrViewed.addEventListener('change', async () => {
  const sortBy = $sortByRatedOrViewed.selectedOptions[0].value;
  if (sortBy === 'topRated') {
    $landingPage.style.display = 'none';
    $entitiesView.style.display = 'block';
    const $ulRated = document.createElement('ul') as HTMLUListElement;

    for (let i = 0; i < businessesRating.length; i++) {
      const businessEntity = businessesRating[i];
      const imageUrl = businessEntity.image_url;
      const businessName = businessEntity.name;
      const reviewCount = businessEntity.review_count;
      const $liElement = createLiElement(
        1,
        imageUrl,
        businessName,
        reviewCount,
      );
      $ulRated.append($liElement);
    }
    $myListView.replaceChildren($ulRated);
  } else if (sortBy === 'topViewed') {
    $landingPage.style.display = 'none';
    $entitiesView.style.display = 'block';
    const $ulCount = document.createElement('ul') as HTMLUListElement;

    for (let i = 0; i < businessesCount.length; i++) {
      const businessEntity = businessesCount[i];
      const imageUrl = businessEntity.image_url;
      const businessName = businessEntity.name;
      const reviewCount = businessEntity.review_count;
      const $liElement = createLiElement(
        2,
        imageUrl,
        businessName,
        reviewCount,
      );
      $ulCount.append($liElement);
    }
    $myListView.replaceChildren($ulCount);
  }
});
