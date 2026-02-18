/* Client-side cart interactions
   - Intercepts Add-to-Cart on vehicle detail and calls authenticated API when logged in
   - Renders DB-backed cart for authenticated users and falls back to session-based forms for guests
*/

document.addEventListener('DOMContentLoaded', () => {
  try {
    initAddToCartForms()
    initCartPage()
    updateHeaderCartCount()
  } catch (err) {
    console.error('Cart init error:', err)
  }
})

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

async function updateHeaderCartCount() {
  try {
    if (!isAuthenticated()) return
    const result = await authenticatedFetch('/cart/count')
    if (result && result.count != null) {
      const el = document.getElementById('headerCartCount')
      if (el) el.textContent = result.count
    }
  } catch (err) {
    console.error('Failed to load cart count', err)
  }
}

function initAddToCartForms() {
  const forms = document.querySelectorAll('.add-to-cart-form')
  if (!forms) return

  forms.forEach(form => {
    // qty buttons
    form.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = form.querySelector('.qty-input')
        let val = Number(input.value) || 1
        if (btn.dataset.action === 'increase') val = Math.min(99, val + 1)
        if (btn.dataset.action === 'decrease') val = Math.max(1, val - 1)
        input.value = val
      })
    })

    // intercept submit for logged-in users
    form.addEventListener('submit', async (ev) => {
      if (!isAuthenticated()) return // let the normal POST/session behaviour run for guests
      ev.preventDefault()
      const invId = form.querySelector('input[name="invId"]').value
      const qty = Number(form.querySelector('input[name="quantity"]').value) || 1
      const name = form.querySelector('input[name="name"]') ? form.querySelector('input[name="name"]').value : undefined
      const price = form.querySelector('input[name="price"]') ? form.querySelector('input[name="price"]').value : undefined
      const image = form.querySelector('input[name="image"]') ? form.querySelector('input[name="image"]').value : undefined
      try {
        const resp = await authenticatedFetch('/cart/add', {
          method: 'POST',
          body: JSON.stringify({ invId, quantity: qty, name, price, image })
        })
        if (resp && resp.success) {
          // show fallback message if provided
          if (resp.fallback && resp.message) alert(resp.message)
          updateHeaderCartCount()
          window.location.href = '/cart'
        } else {
          alert(resp.message || 'Failed to add item to cart')
        }
      } catch (err) {
        console.error(err)
        alert('Unable to add to cart. Please try again.')
      }
    })
  })
}

async function initCartPage() {
  const container = document.getElementById('cartItems')
  const checkoutBtn = document.getElementById('checkoutBtn')
  
  if (!container) return

  // Attach checkout button listener
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', processCheckout)
  }

  // If user is authenticated, render DB cart via API
  if (isAuthenticated()) {
    try {
      const data = await authenticatedFetch('/cart/items')
      if (!data || !data.items) return

      // Clear existing (session) UI and render API items
      container.innerHTML = ''
      console.log('Cart items from API:', data.items) // DEBUG
      data.items.forEach(it => {
        console.log(`Item: ${it.name}, thumbnail: ${it.thumbnail}`) // DEBUG
        const article = document.createElement('article')
        article.className = 'cart-item'
        article.dataset.invId = it.inv_id
        article.innerHTML = `
          <div class="item-thumb"><img src="${it.thumbnail || '/images/vehicles/no-image.png'}" alt="${it.name}" style="width: 140px; height: 90px;"></div>
          <div class="item-info">
            <h3 class="item-name">${it.name}</h3>
            <p class="item-price">${formatCurrency(it.cart_unit_price)}</p>
            <div class="qty-controls">
              <button class="qty-btn" data-action="decrease">−</button>
              <input class="qty-input" type="number" value="${it.cart_quantity}" min="1" max="99" />
              <button class="qty-btn" data-action="increase">+</button>
              <button class="remove-btn" data-inv-id="${it.inv_id}">Remove</button>
            </div>
          </div>
        `
        container.appendChild(article)
      })

      // update totals (server returned values)
      document.getElementById('subtotal').textContent = '$' + Number(data.subtotal).toFixed(2)
      document.getElementById('tax').textContent = '$' + Number(data.tax).toFixed(2)
      document.getElementById('total').textContent = '$' + Number(data.total).toFixed(2)

      // Attach event listeners for qty and remove
      container.querySelectorAll('.cart-item').forEach(el => {
        const invId = el.dataset.invId
        const input = el.querySelector('.qty-input')
        el.querySelectorAll('.qty-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            let val = Number(input.value) || 1
            if (btn.dataset.action === 'increase') val = Math.min(99, val + 1)
            if (btn.dataset.action === 'decrease') val = Math.max(1, val - 1)
            input.value = val
            await updateDbQuantity(invId, val)
          })
        })

        const removeBtn = el.querySelector('.remove-btn')
        removeBtn.addEventListener('click', async () => {
          await removeDbItem(invId)
        })

        // listen to manual edits
        input.addEventListener('change', async () => {
          const val = Math.max(1, Math.min(99, Number(input.value) || 1))
          input.value = val
          await updateDbQuantity(invId, val)
        })
      })

      // Enable checkout button to go to a protected checkout flow (login if not)
      const checkout = document.getElementById('checkoutBtn')
      if (checkout) {
        checkout.href = '/account/details' // could point to a checkout route when implemented
      }

    } catch (err) {
      console.error('Failed to load DB cart', err)
    }
  } else {
    // Guest: attach handlers to session forms already rendered on page
    container.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrapper = btn.closest('article')
        const input = wrapper.querySelector('.qty-input')
        let val = Number(input.value) || 1
        if (btn.dataset.action === 'increase') val = Math.min(99, val + 1)
        if (btn.dataset.action === 'decrease') val = Math.max(1, val - 1)
        input.value = val
        // submit parent form to update session
        const form = wrapper.querySelector('.qty-form')
        if (form) form.submit()
      })
    })

    container.querySelectorAll('.remove-form').forEach(form => {
      form.querySelector('button').addEventListener('click', (e) => {
        // allow form submit to remove session item
      })
    })

    // compute and display totals from server-rendered subtotal
    const serverSubtotalEl = document.getElementById('subtotal')
    const subtotalVal = Number(serverSubtotalEl.textContent.replace(/[,$]/g, '')) || 0
    const TAX_RATE = 0.08875
    const tax = +(subtotalVal * TAX_RATE).toFixed(2)
    const total = +(subtotalVal + tax).toFixed(2)
    document.getElementById('tax').textContent = '$' + tax.toFixed(2)
    document.getElementById('total').textContent = '$' + total.toFixed(2)
  }
}

async function updateDbQuantity(invId, quantity) {
  try {
    const res = await authenticatedFetch('/cart/update', {
      method: 'POST',
      body: JSON.stringify({ invId, quantity })
    })
    if (res && res.success) {
      // refresh cart items/totals
      await initCartPage()
      await updateHeaderCartCount()
    }
  } catch (err) {
    console.error('Failed to update quantity', err)
  }
}

async function removeDbItem(invId) {
  try {
    const res = await authenticatedFetch('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ invId })
    })
    if (res && res.success) {
      await initCartPage()
      await updateHeaderCartCount()
    }
  } catch (err) {
    console.error('Failed to remove item', err)
  }
}
async function processCheckout() {
  try {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      alert('Please log in to checkout')
      window.location.href = '/account/login'
      return
    }

    // Show loading state
    const checkoutBtn = document.getElementById('checkoutBtn')
    const originalText = checkoutBtn.textContent
    checkoutBtn.disabled = true
    checkoutBtn.textContent = 'Processing...'

    // Call checkout API
    const response = await authenticatedFetch('/checkout/process', {
      method: 'POST',
      body: JSON.stringify({})
    })

    if (response && response.success) {
      // Show confirmation modal
      const modal = document.getElementById('orderConfirmationModal')
      const userData = JSON.parse(localStorage.getItem('userData'))
      
      document.getElementById('confirmTotal').textContent = '$' + Number(response.orderTotal).toFixed(2)
      document.getElementById('confirmItemCount').textContent = response.itemCount + ' item(s)'
      document.getElementById('confirmEmail').textContent = userData.email
      
      modal.style.display = 'block'

      // Clear cart display after delay
      setTimeout(() => {
        initCartPage()
        updateHeaderCartCount()
      }, 1000)
    } else {
      alert(response.message || 'Checkout failed. Please try again.')
      checkoutBtn.disabled = false
      checkoutBtn.textContent = originalText
    }
  } catch (err) {
    console.error('Checkout error:', err)
    alert('An error occurred during checkout. Please try again.')
    const checkoutBtn = document.getElementById('checkoutBtn')
    checkoutBtn.disabled = false
    checkoutBtn.textContent = 'Checkout'
  }
}

// Attach checkout button listener
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkoutBtn')
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', processCheckout)
  }
})