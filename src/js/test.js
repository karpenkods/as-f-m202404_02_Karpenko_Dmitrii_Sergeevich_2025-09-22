export function test() {
  const element = document.querySelector('.js-heading')

  if (!element) return

  element.style.color = 'red'
}
