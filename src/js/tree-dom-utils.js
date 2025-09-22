// DOM утилиты для тестирования
let treeInput, renderBtn, treeOutput, errorMessage

// Функция инициализации элементов DOM
export function initializeElements() {
  treeInput = document.getElementById('tree-input')
  renderBtn = document.getElementById('render-btn')
  treeOutput = document.getElementById('tree-output')
  errorMessage = document.getElementById('error-message')
}

// Функция подключения обработчиков событий
export function attachEventListeners() {
  renderBtn.addEventListener('click', handleRenderClick)
  treeInput.addEventListener('keypress', handleKeyPress)
}

// Обработчик клика по кнопке
export function handleRenderClick() {
  renderTreeFromInput()
}

// Обработчик нажатия клавиш
export function handleKeyPress(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    renderTreeFromInput()
  }
}

// Функция отрисовки дерева из пользовательского ввода
export function renderTreeFromInput() {
  try {
    hideError()

    const input = treeInput.value.trim()
    if (!input) {
      throw new Error('Введите представление дерева')
    }

    const { parseTree } = require('./tree.js')
    const { renderTree } = require('./tree.js')

    const rootNode = parseTree(input)
    const renderedTreeText = renderTree(rootNode)

    treeOutput.textContent = renderedTreeText
  } catch (error) {
    showError(error.message)
    treeOutput.textContent = ''
  }
}

// Функция показа ошибки
export function showError(message) {
  errorMessage.textContent = `Ошибка: ${message}`
  errorMessage.classList.remove('hidden')
}

// Функция скрытия ошибки
export function hideError() {
  errorMessage.classList.add('hidden')
}

// Экспортируем переменные для тестирования
export { treeInput, renderBtn, treeOutput, errorMessage }
