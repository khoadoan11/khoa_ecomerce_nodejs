const producImageEle = document.querySelector('.product-image');
const producNameEle = document.querySelector('.product-name');
const productPriceEle = document.querySelector('.product-price');
const productDescriptionEle = document.querySelector('.product-description');

const getProduct = async () => {
     //'?i=2&.'
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const response = await fetch(`http://localhost:3000/products/${id}`);
    if(!response.ok){
        window.location.href = '/login.html';
        return;
    }
    const {data:{product}} = await response.json();

    producImageEle.setAttribute('src', product.image);
    producNameEle.textContent = product.name;
    productPriceEle.textContent = `$${product.price.toFixed(2)}`;
    productDescriptionEle.textContent = product.description;
}

getProduct();

