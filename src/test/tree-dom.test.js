import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('DOM функции (моки)', () => {
  let mockTreeInput, mockRenderBtn, mockTreeOutput, mockErrorMessage

  beforeEach(() => {
    // Создаем моки DOM элементов
    mockTreeInput = {
      value: '',
      addEventListener: vi.fn()
    }

    mockRenderBtn = {
      addEventListener: vi.fn()
    }

    mockTreeOutput = {
      textContent: ''
    }

    mockErrorMessage = {
      textContent: '',
      classList: {
        add: vi.fn(),
        remove: vi.fn()
      }
    }

    // Мокаем document.getElementById
    global.document = {
      getElementById: vi.fn((id) => {
        switch (id) {
          case 'tree-input':
            return mockTreeInput
          case 'render-btn':
            return mockRenderBtn
          case 'tree-output':
            return mockTreeOutput
          case 'error-message':
            return mockErrorMessage
          default:
            return null
        }
      }),
      addEventListener: vi.fn()
    }
  })

  it('должен инициализировать элементы DOM', () => {
    // Импортируем функции DOM после установки моков
    const { initializeElements, treeInput, renderBtn, treeOutput, errorMessage } = require('../js/tree-dom-utils.js')

    initializeElements()

    expect(document.getElementById).toHaveBeenCalledWith('tree-input')
    expect(document.getElementById).toHaveBeenCalledWith('render-btn')
    expect(document.getElementById).toHaveBeenCalledWith('tree-output')
    expect(document.getElementById).toHaveBeenCalledWith('error-message')
  })

  it('должен подключать обработчики событий', () => {
    const { initializeElements, attachEventListeners } = require('../js/tree-dom-utils.js')

    initializeElements()
    attachEventListeners()

    expect(mockRenderBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(mockTreeInput.addEventListener).toHaveBeenCalledWith('keypress', expect.any(Function))
  })

  it('должен показывать ошибки', () => {
    const { initializeElements, showError } = require('../js/tree-dom-utils.js')

    initializeElements()
    showError('Тест ошибки')

    expect(mockErrorMessage.textContent).toBe('Ошибка: Тест ошибки')
    expect(mockErrorMessage.classList.remove).toHaveBeenCalledWith('hidden')
  })

  it('должен скрывать ошибки', () => {
    const { initializeElements, hideError } = require('../js/tree-dom-utils.js')

    initializeElements()
    hideError()

    expect(mockErrorMessage.classList.add).toHaveBeenCalledWith('hidden')
  })
})
