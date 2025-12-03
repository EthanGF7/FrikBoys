// Módulo de carrito: gestión en localStorage y renderizado básico
const STORAGE_KEY = 'frikboys_cart_v1';

export function getCart(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Error leyendo carrito', e);
    return [];
  }
}

export function saveCart(cart){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  }catch(e){
    console.error('Error guardando carrito', e);
  }
}

export function addToCart(product){
  if(!product || !product.id) return;
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if(existing){
    existing.qty = (existing.qty || 1) + 1;
  }else{
    cart.push({
      id: product.id,
      nombre: product.nombre || product.name || 'Producto',
      precio: Number(product.precio || product.price || 0),
      imagen: product.imagen || product.image || '',
      qty: 1
    });
  }
  saveCart(cart);
}

export function removeFromCart(id){
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

export function updateQuantity(id, qty){
  const cart = getCart();
  const it = cart.find(i => i.id === id);
  if(!it) return;
  it.qty = qty > 0 ? Math.floor(qty) : 1;
  saveCart(cart);
}

export function getTotalItems(){
  return getCart().reduce((s,i)=> s + (i.qty||0), 0);
}

export function getTotalPrice(){
  return getCart().reduce((s,i)=> s + (i.precio||0) * (i.qty||0), 0);
}

export function updateCartBadge(){
  // intenta encontrar el contador en el header
  const badge = document.querySelector('#cart-count');
  if(badge){
    badge.textContent = getTotalItems();
  }
}

function createItemRow(item){
  return `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/80'">
      <div class="cart-meta">
        <h4>${item.nombre}</h4>
        <p class="precio">${(item.precio||0).toFixed(2)} €</p>
      </div>
      <div class="cart-controls">
        <input class="qty-input" type="number" min="1" value="${item.qty}">
        <button class="btn-remove">Eliminar</button>
      </div>
    </div>
  `;
}

export function renderCart(containerId){
  const container = document.getElementById(containerId);
  if(!container) return;
  const cart = getCart();
  if(cart.length === 0){
    container.innerHTML = '<p>Tu carrito está vacío.</p>';
    updateCartBadge();
    return;
  }
  const itemsHtml = cart.map(createItemRow).join('');
  const total = getTotalPrice();
  container.innerHTML = `
    <div class="cart-list">${itemsHtml}</div>
    <div class="cart-summary">
      <p>Total: <strong>${total.toFixed(2)} €</strong></p>
      <button id="btn-checkout" class="btn-primary">Finalizar compra</button>
    </div>
  `;

  // Delegación de eventos
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', e =>{
      const row = e.target.closest('.cart-item');
      const id = row.dataset.id;
      removeFromCart(id);
      renderCart(containerId);
    });
  });

  container.querySelectorAll('.qty-input').forEach(inp => {
    inp.addEventListener('change', e =>{
      const row = e.target.closest('.cart-item');
      const id = row.dataset.id;
      const val = Number(e.target.value) || 1;
      updateQuantity(id, val);
      renderCart(containerId);
    });
  });

  const checkout = document.getElementById('btn-checkout');
  if(checkout){
    checkout.addEventListener('click', ()=>{
      alert('Funcionalidad de pago no implementada en este demo.');
    });
  }

  updateCartBadge();
}

// Actualizar badge al cargar el módulo
if(typeof window !== 'undefined'){
  // Delay para esperar a que el header esté cargado si se inserta dinámicamente
  setTimeout(updateCartBadge, 300);
}
