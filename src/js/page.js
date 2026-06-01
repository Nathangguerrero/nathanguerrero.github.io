import '../../src/css/main.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ── Scroll reveals with GSAP ── */
gsap.utils.toArray('.reveal').forEach(el => {
  const delay = el.classList.contains('reveal-delay-3') ? 0.45
              : el.classList.contains('reveal-delay-2') ? 0.30
              : el.classList.contains('reveal-delay-1') ? 0.15 : 0
  gsap.fromTo(el,
    { opacity: 0, y: 70 },
    {
      opacity: 1, y: 0,
      duration: 1.1,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    }
  )
  el.classList.add('visible')
})

/* ── Background Canvas ── */
const canvas = document.getElementById('bg-canvas')
if (canvas) {
  const ctx = canvas.getContext('2d')
  let W, H
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
  resize()
  window.addEventListener('resize', resize)

  let mouseX = W * 0.5, mouseY = H * 0.4
  let lerpX = mouseX, lerpY = mouseY
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY })

  const orbs = [
    { x:0.2, y:0.3, r:0.55, color:[255,77,0],  speed:0.00018, phase:0,   mouse:true  },
    { x:0.8, y:0.7, r:0.45, color:[80,20,180],  speed:0.00013, phase:2.1, mouse:false },
    { x:0.5, y:0.1, r:0.40, color:[0,120,200],  speed:0.00020, phase:4.3, mouse:false },
    { x:0.1, y:0.8, r:0.35, color:[180,40,255], speed:0.00015, phase:1.1, mouse:false },
  ]

  function drawBg(t) {
    lerpX += (mouseX - lerpX) * 0.04
    lerpY += (mouseY - lerpY) * 0.04
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)
    orbs.forEach(o => {
      const cx = o.mouse ? lerpX + (o.x-0.5)*W*0.3 : (o.x + Math.sin(t*o.speed+o.phase)*0.12)*W
      const cy = o.mouse ? lerpY + (o.y-0.5)*H*0.3 : (o.y + Math.cos(t*o.speed*0.8+o.phase)*0.10)*H
      const radius = o.r * Math.max(W, H)
      const [r,g,b] = o.color
      const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,radius)
      grad.addColorStop(0,   `rgba(${r},${g},${b},0.13)`)
      grad.addColorStop(0.5, `rgba(${r},${g},${b},0.05)`)
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
      ctx.globalCompositeOperation = 'screen'
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI*2)
      ctx.fill()
    })
    ctx.globalCompositeOperation = 'source-over'
    requestAnimationFrame(drawBg)
  }
  requestAnimationFrame(drawBg)
}

/* ── Iframe drawer detection ── */
if (window.self !== window.top) {
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav')
    if (nav) nav.style.display = 'none'
    document.body.style.paddingTop = '0'
    const hero = document.querySelector('.project-hero, #hero, section')
    if (hero) { hero.style.paddingTop = '0'; hero.style.marginTop = '0' }
    document.querySelectorAll('.nav-back, .nav-logo').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault()
        window.parent.postMessage('closeDrawer', '*')
      })
    })
    document.addEventListener('mousemove', e => {
      window.parent.postMessage({ type: 'cursorMove', x: e.clientX, y: e.clientY }, '*')
    })
  })
}

/* ── Video player quality selector ── */
window.initVideoPlayer = function(videoId, qualitySources) {
  const video   = document.getElementById(videoId)
  if (!video) return
  const playBtn = document.getElementById('play-btn')
  const muteBtn = document.getElementById('mute-btn')
  const timeEl  = document.getElementById('video-time')
  const progressFill = document.getElementById('progress-fill')
  const progressWrap = document.getElementById('progress-wrap')
  const qualityBtns  = document.querySelectorAll('.quality-btn')
  let currentQuality = '1080'

  function formatTime(s) {
    const m = Math.floor(s/60), sec = Math.floor(s%60)
    return `${m}:${sec.toString().padStart(2,'0')}`
  }
  function updateTime() {
    if (timeEl) timeEl.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration||0)}`
    if (progressFill && video.duration) progressFill.style.width = (video.currentTime/video.duration*100)+'%'
  }
  video.addEventListener('timeupdate', updateTime)
  video.addEventListener('loadedmetadata', updateTime)

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      video.paused ? video.play() : video.pause()
      const icon = playBtn.querySelector('.play-icon, .pause-icon')
      if (icon) {
        if (video.paused) {
          icon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`
          icon.closest('svg')?.setAttribute('viewBox','0 0 24 24')
        } else {
          icon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`
        }
      }
    })
  }
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted
    })
  }
  if (progressWrap) {
    progressWrap.addEventListener('click', e => {
      const rect = progressWrap.getBoundingClientRect()
      video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration
    })
  }
  qualityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.quality
      if (q === currentQuality || !qualitySources[q]) return
      const t = video.currentTime, paused = video.paused
      currentQuality = q
      video.src = qualitySources[q]
      video.load()
      video.currentTime = t
      if (!paused) video.play()
      qualityBtns.forEach(b => b.classList.toggle('active', b.dataset.quality === q))
    })
  })
}
