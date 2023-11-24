const inputName = document.querySelector('.input_Name');
const inputPrice = document.querySelector('.input_Price');
const inputImage = document.querySelector('.input_Image');
const inputDes = document.querySelector('.input_Des');
const btnSave = document.querySelector('.btn_save');
const product_id = document.querySelector('.product_id');

const urlParams = new URLSearchParams(window.location.search);
let id = urlParams.get('id');
if(!response.ok){
    window.location.href = '/login.html';
    return;
}
product_id.textContent = `ID: ${id}`;
const updateProduct = async () => {
    const name = inputName.value;
    const price = Number(inputPrice.value);
    const image = inputImage.value;
    const description = inputDes.value;
    const data = {
        name: name,
        price: price,
        image: image,
        description: description,
      };
    await fetch(`http://localhost:3000/products/${id}`, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), 
    });
    alert("cập nhật thành công");
}

btnSave.addEventListener('click', updateProduct);
