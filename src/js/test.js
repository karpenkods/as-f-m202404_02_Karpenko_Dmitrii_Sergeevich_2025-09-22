export function test() {
  const element = document.querySelector('.js-heading')
  const elements = [...document.querySelectorAll('.js-heading')]

  if (!element) return

  element.style.color = 'red'

  if (!elements.length) return

  elements.forEach((el) => {
    el.style.fontSize = '40px'
  })
}
