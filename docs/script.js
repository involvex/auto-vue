// Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function () {
  // Theme toggle button
  const themeToggle = document.getElementById('theme-toggle')
  const body = document.body

  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light'
  body.setAttribute('data-theme', currentTheme)

  // Update theme toggle button text
  updateThemeToggleText(currentTheme)

  // Theme toggle event listener
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const currentTheme = body.getAttribute('data-theme')
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

      body.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
      updateThemeToggleText(newTheme)
    })
  }

  function updateThemeToggleText(theme) {
    if (themeToggle) {
      themeToggle.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark'
    }
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle')
  const navMenu = document.querySelector('.nav-menu')

  if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active')
      const isActive = navMenu.classList.contains('active')
      mobileMenuToggle.innerHTML = isActive ? '✕' : '☰'
    })

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link')
    navLinks.forEach((link) => {
      link.addEventListener('click', function () {
        navMenu.classList.remove('active')
        mobileMenuToggle.innerHTML = '☰'
      })
    })

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (event) {
      if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
        navMenu.classList.remove('active')
        mobileMenuToggle.innerHTML = '☰'
      }
    })
  }

  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault()
      const targetId = this.getAttribute('href').substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    })
  })

  // Add scroll effect to navbar
  let lastScrollTop = 0
  const navbar = document.querySelector('.navbar')

  window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Scrolling down
      navbar.style.transform = 'translateY(-100%)'
    } else {
      // Scrolling up
      navbar.style.transform = 'translateY(0)'
    }

    lastScrollTop = scrollTop
  })

  // Add loading animation
  window.addEventListener('load', function () {
    document.body.classList.add('loaded')
  })
})
