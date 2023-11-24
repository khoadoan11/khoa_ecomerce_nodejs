const searchInputEle = document.querySelector('.search-box input')
const searchButtonEle = document.querySelector('.search-box button')
const tbodyele = document.querySelector('.product-list tbody');

const getProducts = async () => {
    let queryString = '';

    if (searchInputEle.value !== '') {
        const urlParams = new URLSearchParams({
            name: searchInputEle.value,
        });
        queryString = `?${urlParams.toString()}`;
    }

    const response = await fetch(`http://localhost:3000/products${queryString}`);

    if(!response.ok){
        window.location.href = '/login.html';
        return;
    }

    const { data: { products = [] } } = await response.json();

    tbodyele.innerHTML = '';
    products.forEach(item => {
        const trEle = document.createElement('tr');
        tbodyele.appendChild(trEle);
        trEle.innerHTML = `
            <td>${item._id}</td>
            <td>${item.name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>
            <a class="btn btn-primary btn-sm" href="./product-detail.html?id=${item._id}">
            <i class="fas fa-eye"></i>
            View
            </a>
            <a class="btn btn-info btn-sm" href="./product-edit.html?id=${item._id}">
            <i class="fas fa-pencil-alt"></i>
            Edit
            </a>
            <a class="btn btn-danger btn-sm" href="#">
            <i class="fas fa-trash"></i>
            Delete
            </a>
            </td>
        `;
    });
};


getProducts();
searchButtonEle.addEventListener('click', getProducts);


