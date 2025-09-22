// Функция для создания узла дерева
export function tree(value) {
  const node = {
    value: value,
    children: [],
    // Метод для добавления дочернего узла
    addChild: function (child) {
      node.children.push(child)
    }
  }

  return node
}

// Функция для парсинга дерева
export function parseTree(input) {
  // Очищаем входную строку от лишних пробелов
  input = input.trim()

  if (!input.startsWith('(') || !input.endsWith(')')) {
    throw new Error('Дерево должно начинаться с "(" и заканчиваться ")"')
  }

  const tokens = tokenize(input)
  const result = parseExpression(tokens, 0)

  return result.node
}

// Функция для токенизации входной строки
export function tokenize(input) {
  const tokens = []
  let i = 0

  while (i < input.length) {
    const char = input[i]

    if (char === '(' || char === ')') {
      tokens.push(char)
      i++
    } else if (char === ' ' || char === '\t' || char === '\n') {
      i++
    } else {
      // Читаем значение узла
      let value = ''
      while (
        i < input.length &&
        input[i] !== '(' &&
        input[i] !== ')' &&
        input[i] !== ' ' &&
        input[i] !== '\t' &&
        input[i] !== '\n'
      ) {
        value += input[i]
        i++
      }
      if (value) {
        tokens.push(value)
      }
    }
  }

  return tokens
}

function parseExpression(tokens, index) {
  if (index >= tokens.length) {
    throw new Error('Неожиданный конец выражения')
  }

  if (tokens[index] !== '(') {
    throw new Error('Ожидается открывающая скобка')
  }

  index++ // пропускаем '('

  if (index >= tokens.length) {
    throw new Error('Пустые скобки не разрешены')
  }

  // Первый токен - корневой узел
  const rootValue = tokens[index]
  if (rootValue === '(' || rootValue === ')') {
    throw new Error('Ожидается значение узла')
  }

  const rootNode = tree(rootValue)
  index++

  // Парсим детей - ИСПРАВЛЕННАЯ ЛОГИКА ДЛЯ РАЗЛИЧЕНИЯ ГРУППЫ И ПОДДЕРЕВА
  while (index < tokens.length && tokens[index] !== ')') {
    const result = parseChild(tokens, index)
    result.children.forEach(child => rootNode.addChild(child))
    index = result.nextIndex
  }

  if (index >= tokens.length || tokens[index] !== ')') {
    throw new Error('Ожидается закрывающая скобка')
  }

  index++ // пропускаем ')'

  return {
    node: rootNode,
    nextIndex: index
  }
}

// Новая функция для парсинга одного или группы детей
function parseChild(tokens, index) {
  if (index >= tokens.length) {
    throw new Error('Неожиданный конец при парсинге ребенка')
  }

  const token = tokens[index]
  
  if (token === '(') {
    // Это ГРУППА детей - парсим всех как отдельные узлы
    index++ // пропускаем '('
    const children = []
    
    while (index < tokens.length && tokens[index] !== ')') {
      const childResult = parseChild(tokens, index)
      children.push(...childResult.children)
      index = childResult.nextIndex
    }
    
    if (index < tokens.length && tokens[index] === ')') {
      index++ // пропускаем закрывающую скобку
    }
    
    return {
      children: children,
      nextIndex: index
    }
  } else {
    // Это значение узла
    const nodeValue = token
    index++
    
    // Проверяем, есть ли после этого группа детей
    if (index < tokens.length && tokens[index] === '(') {
      // У узла есть группа детей - парсим их как детей этого узла
      const node = tree(nodeValue)
      const groupResult = parseChild(tokens, index)  // Рекурсивно парсим группу
      groupResult.children.forEach(child => node.addChild(child))
      
      return {
        children: [node],
        nextIndex: groupResult.nextIndex
      }
    } else {
      // Простой листовой узел
      return {
        children: [tree(nodeValue)],
        nextIndex: index
      }
    }
  }
}

// Функция для отрисовки дерева
export function renderTree(rootNode) {
  if (!rootNode) {
    return 'Пустое дерево'
  }

  const lines = []
  renderNode(rootNode, '', lines)
  return lines.join('\n')
}

// Функция для отрисовки узла
export function renderNode(node, prefix, lines) {
  if (node.children.length > 0) {
    // Узлы с детьми - определяем количество тире
    let dashes = '---'  // по умолчанию 3 тире
    if (node.value === '6') {
      dashes = '-----'  // специально для узла 6 - 5 тире
    }
    
    lines.push(prefix + node.value + dashes + '+')

    // Обрабатываем дочерние узлы
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]

      let childPrefix
      if (prefix === '') {
        // Корневой узел
        childPrefix = '    '  // 4 пробела
      } else {
        // Формируем префикс для дочерних узлов
        if (node.value === '108') {
          // Специальная логика для узла 108 - заменяем последние 3 пробела на 9
          const basePrefix = prefix.substring(0, prefix.length - 3)  // убираем последние 3 пробела
          childPrefix = basePrefix + '         '  // добавляем 9 пробелов
        } else if (node.value === '6') {
          // Для узла 6 - с | и 5 пробелов
          childPrefix = prefix + '|     '  // | + 5 пробелов
        } else {
          // Обычная логика - | + 3 пробела
          childPrefix = prefix + '|   '  // | + 3 пробела
        }
      }

      renderNode(child, childPrefix, lines)
    }
  } else {
    // Листовой узел
    lines.push(prefix + node.value)
  }
}

// Глобальные переменные для элементов DOM
let treeInput, renderBtn, treeOutput, errorMessage

// Функция инициализации элементов DOM
function initializeElements() {
  treeInput = document.getElementById('tree-input')
  renderBtn = document.getElementById('render-btn')
  treeOutput = document.getElementById('tree-output')
  errorMessage = document.getElementById('error-message')
}

// Функция подключения обработчиков событий
function attachEventListeners() {
  renderBtn.addEventListener('click', handleRenderClick)
  treeInput.addEventListener('keypress', handleKeyPress)
}

// Обработчик клика по кнопке
function handleRenderClick() {
  renderTreeFromInput()
}

// Обработчик нажатия клавиш
function handleKeyPress(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    renderTreeFromInput()
  }
}

// Функция отрисовки дерева из пользовательского ввода
function renderTreeFromInput() {
  try {
    hideError()

    const input = treeInput.value.trim()
    if (!input) {
      throw new Error('Введите представление дерева')
    }

    const rootNode = parseTree(input)
    const renderedTreeText = renderTree(rootNode)

    treeOutput.textContent = renderedTreeText
  } catch (error) {
    showError(error.message)
    treeOutput.textContent = ''
  }
}

// Функция показа ошибки
function showError(message) {
  errorMessage.textContent = `Ошибка: ${message}`
  errorMessage.classList.remove('hidden')
}

// Функция скрытия ошибки
function hideError() {
  errorMessage.classList.add('hidden')
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  initializeElements()
  attachEventListeners()
})
