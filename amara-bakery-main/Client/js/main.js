const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");
const track = document.getElementById("imageTrack");
const menuOptions = document.getElementById("menu_container");
const breadbtn = document.getElementById("breadbtn");
const cookiebtn = document.getElementById("cookiebtn");

const images = [
  {
    src: "Images/products/IMG_0905.JPG",
    name: "Biscoff Stuffed Cookies",
    loadedname: "Biscoff Stuffed Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0908.JPG",
    name: "Oreo Cream Cheese Loaf",
    loadedname: "Oreo Cream Cheese Loaf",
    tag: "bread"
  },
  {
    src: "Images/products/IMG_0934.JPG",
    name: "Coconut Topped Loaf",
    loadedname: "Coconut Topped Loaf",
    tag: "bread"
  },
  {
    src: "Images/products/IMG_0939.JPG",
    name: "Classic Chocolate Chunk Cookies",
    loadedname: "Classic Chocolate Chunk Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0940.JPG",
    name: "Marshmallow & Chocolate Chunk Cookies",
    loadedname: "Marshmallow & Chocolate Chunk Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0942.JPG",
    name: "M&M Cookies",
    loadedname: `<span style="color: transparent;">~~</span>M&M <span style="color: transparent;">~~</span>Cookies`,
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0943.JPG",
    name: "Oreo Chunk Cookies",
    loadedname: "Oreo Chunk Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0946.JPG",
    name: "Variety Cookie Spread",
    loadedname: "Variety Cookie Spread",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0947.JPG",
    name: "Oreo Crumb Cookies",
    loadedname: "Oreo Crumb Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0948.JPG",
    name: "White Chocolate Chunk Cookies",
    loadedname: "White Chocolate Chunk Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0952.JPG",
    name: "Pistachio & Chocolate Cookies",
    loadedname: "Pistachio & Chocolate Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0953.JPG",
    name: "Double Chocolate Marshmallow Cookies",
    loadedname: "Double Chocolate Marshmallow Cookies",
    tag: "cookie"
  },
  {
    src: "Images/products/IMG_0958.JPG",
    name: "White Chocolate & Jam Cookies",
    loadedname: "White Chocolate & Jam Cookies",
    tag: "cookie"
  },
];

let clicked = [false,false]

userButton.addEventListener("click", () => {
  userDropdown.classList.toggle("show");
});

document.addEventListener("click", (event) => {
  if (
    !userButton.contains(event.target) &&
    !userDropdown.contains(event.target)
  ) {
    userDropdown.classList.remove("show");
  }
});








function MenuOptions() {
  menuOptions.innerHTML = "";

  images.forEach(e => {
    menuOptions.innerHTML+=`
    <div class="menu-box">
      <a href="Product details.html">
        <div class="menu-box-img">
          <img src="./${e.src}" />
        </div>
        <div class="menu-box-txt">
          <span class="menu-box-name">${e.loadedname}</span>

          <span class="menu-box-price">12kr</span>
        </div>
        <button class="menu-add-to-cart">Add to Cart</button>
      </a>
    </div>`;
  });
}

function BreadCat() {

  if (clicked[0]){
    clicked[0] = false;
    breadbtn.style.color = "#B6410F";
    breadbtn.style.background = "none";
    MenuOptions();
  }else{
    clicked[0] = true;
    breadbtn.style.color = "#F4EAE0";
    breadbtn.style.background = "#B6410F"
    cookiebtn.style.color = "#B6410F";
    cookiebtn.style.background = "none";

    menuOptions.innerHTML = "";

    images.forEach(e => {
      if(e.tag == "bread")
      {
      menuOptions.innerHTML+=`
        <div class="menu-box">
          <a href="Product details.html">
            <div class="menu-box-img">
              <img src="./${e.src}" />
            </div>
            <div class="menu-box-txt">
              <span class="menu-box-name">${e.loadedname}</span>

              <span class="menu-box-price">12kr</span>
            </div>
            <button class="menu-add-to-cart">Add to Cart</button>
          </a>
        </div>`
      }
    });
  }
}

function CookieCat() {
  if (clicked[1]){
    clicked[1] = false;
    cookiebtn.style.color = "#B6410F";
    cookiebtn.style.background = "none";
    MenuOptions();
  }else{
    clicked[1] = true;
    cookiebtn.style.color = "#F4EAE0";
    cookiebtn.style.background = "#B6410F"
    breadbtn.style.color = "#B6410F";
    breadbtn.style.background = "none";

    menuOptions.innerHTML = "";

    images.forEach(e => {
      if(e.tag == "cookie")
      {
      menuOptions.innerHTML+=`
        <div class="menu-box">
          <a href="Product details.html">
            <div class="menu-box-img">
              <img src="./${e.src}" />
            </div>
            <div class="menu-box-txt">
              <span class="menu-box-name">${e.loadedname}</span>

              <span class="menu-box-price">12kr</span>
            </div>
            <button class="menu-add-to-cart">Add to Cart</button>
          </a>
        </div>`
      }
    });
  }
}

MenuOptions();

onlinePastrys = [
  "first__.jpeg",
  "download0.jpeg",
  "download1.jpeg",
  "download2.jpeg",
  "download3.jpeg",
  "download4.jpeg",
  "download5.jpeg",
  "download6.jpeg",
  "download7.jpeg",
  "download8.jpeg",
  "download9.jpeg",
  "download10.jpeg",
];


onlinePastrysLength = onlinePastrys.length;
let index = onlinePastrysLength;

function Carousel2() {
  if(index == 0){
    index = onlinePastrysLength;
  }
  track.innerHTML = "";

  track.innerHTML += `
  <img src="Images/online_pasteries/${onlinePastrys[(index-1)%onlinePastrysLength]}" class = "img1">
  <img src="Images/online_pasteries/${onlinePastrys[index%onlinePastrysLength]}" class = "img2">
  <img src="Images/online_pasteries/${onlinePastrys[(index+1)%onlinePastrysLength]}" class = "img3">
  `;
}

function carousel_left() {
  index-=1;
  Carousel2();
}
function carousel_right() {
  index+=1;
  Carousel2();
}

/*function Carousel() {  
  track.innerHTML = "";
  
  const doubleImages = [...images,...images];
  
  doubleImages.forEach(e => {
    const img = document.createElement("img");
    img.src = e.src;
    img.alt = `Pastry ${e.src.slice(-8, -4)}`;
    track.appendChild(img);
  });
}*/

Carousel2();
