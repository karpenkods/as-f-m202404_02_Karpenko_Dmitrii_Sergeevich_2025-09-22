import { describe, it, expect } from 'vitest'
import { tree, parseTree, tokenize, renderTree, renderNode } from '../js/tree.js'

describe('Функция tree', () => {
  it('создает узел с заданным значением', () => {
    const node = tree('A')
    expect(node.value).toBe('A')
    expect(node.children).toEqual([])
  })

  it('позволяет добавлять дочерние узлы', () => {
    const parent = tree('A')
    const child1 = tree('B')
    const child2 = tree('C')

    parent.addChild(child1)
    parent.addChild(child2)

    expect(parent.children).toHaveLength(2)
    expect(parent.children[0]).toBe(child1)
    expect(parent.children[1]).toBe(child2)
  })

  it('метод addChild работает корректно', () => {
    const node = tree('root')
    const child = tree('child')

    node.addChild(child)

    expect(node.children).toContain(child)
    expect(node.children).toHaveLength(1)
  })
})

describe('Функция tokenize', () => {
  it('разбивает простое выражение на токены', () => {
    const result = tokenize('(A B C)')
    expect(result).toEqual(['(', 'A', 'B', 'C', ')'])
  })

  it('обрабатывает вложенные выражения', () => {
    const result = tokenize('(A (B C) D)')
    expect(result).toEqual(['(', 'A', '(', 'B', 'C', ')', 'D', ')'])
  })

  it('игнорирует лишние пробелы', () => {
    const result = tokenize('( A   B  C )')
    expect(result).toEqual(['(', 'A', 'B', 'C', ')'])
  })

  it('обрабатывает табы и переносы строк', () => {
    const result = tokenize('(\tA\n\tB\tC\n)')
    expect(result).toEqual(['(', 'A', 'B', 'C', ')'])
  })

  it('обрабатывает пустую строку', () => {
    const result = tokenize('')
    expect(result).toEqual([])
  })

  it('обрабатывает строки только с пробелами', () => {
    const result = tokenize('   \t\n  ')
    expect(result).toEqual([])
  })
})

describe('Функция parseTree', () => {
  it('парсит простое дерево с одним узлом', () => {
    const result = parseTree('(A)')
    expect(result.value).toBe('A')
    expect(result.children).toHaveLength(0)
  })

  it('парсит дерево с дочерними узлами', () => {
    const result = parseTree('(A B C D)')
    expect(result.value).toBe('A')
    expect(result.children).toHaveLength(3)
    expect(result.children[0].value).toBe('B')
    expect(result.children[1].value).toBe('C')
    expect(result.children[2].value).toBe('D')
  })

  it('парсит вложенное дерево', () => {
    const result = parseTree('(A (B C) D)')
    expect(result.value).toBe('A')
    expect(result.children).toHaveLength(2)

    // Проверяем поддерево
    const subtree = result.children[0]
    expect(subtree.value).toBe('B')
    expect(subtree.children).toHaveLength(1)
    expect(subtree.children[0].value).toBe('C')

    // Проверяем листовой узел
    expect(result.children[1].value).toBe('D')
  })

  it('парсит сложное дерево', () => {
    const result = parseTree('(A (B (E F) C) D)')
    expect(result.value).toBe('A')
    expect(result.children).toHaveLength(2)

    const leftSubtree = result.children[0]
    expect(leftSubtree.value).toBe('B')
    expect(leftSubtree.children).toHaveLength(2)

    const deepSubtree = leftSubtree.children[0]
    expect(deepSubtree.value).toBe('E')
    expect(deepSubtree.children).toHaveLength(1)
    expect(deepSubtree.children[0].value).toBe('F')
  })

  it('выбрасывает ошибку для строки без скобок', () => {
    expect(() => parseTree('A B C')).toThrow('Дерево должно начинаться с "(" и заканчиваться ")"')
  })

  it('выбрасывает ошибку для строки без открывающей скобки', () => {
    expect(() => parseTree('A B C)')).toThrow('Дерево должно начинаться с "(" и заканчиваться ")"')
  })

  it('выбрасывает ошибку для строки без закрывающей скобки', () => {
    expect(() => parseTree('(A B C')).toThrow('Дерево должно начинаться с "(" и заканчиваться ")"')
  })

  it('выбрасывает ошибку для пустых скобок', () => {
    expect(() => parseTree('()')).toThrow('Ожидается значение узла')
  })

  it('выбрасывает ошибку для некорректной структуры', () => {
    expect(() => parseTree('((A))')).toThrow('Ожидается значение узла')
  })

  it('обрабатывает пробелы в входной строке', () => {
    const result = parseTree(' ( A   B  C ) ')
    expect(result.value).toBe('A')
    expect(result.children).toHaveLength(2)
    expect(result.children[0].value).toBe('B')
    expect(result.children[1].value).toBe('C')
  })
})

describe('Функция renderTree', () => {
  it('отображает пустое дерево', () => {
    const result = renderTree(null)
    expect(result).toBe('Пустое дерево')
  })

  it('отображает одиночный узел', () => {
    const node = tree('A')
    const result = renderTree(node)
    expect(result).toBe('A')
  })

  it('отображает дерево с дочерними узлами', () => {
    const root = tree('A')
    const child1 = tree('B')
    const child2 = tree('C')

    root.addChild(child1)
    root.addChild(child2)

    const result = renderTree(root)
    const expected = 'A---+\n    B\n    C'
    expect(result).toBe(expected)
  })

  it('отображает вложенное дерево', () => {
    const root = tree('A')
    const child1 = tree('B')
    const grandchild = tree('E')
    const child2 = tree('C')

    child1.addChild(grandchild)
    root.addChild(child1)
    root.addChild(child2)

    const result = renderTree(root)
    const expected = 'A---+\n    B---+\n    |   E\n    C'
    expect(result).toBe(expected)
  })

  it('отображает сложное дерево', () => {
    // Создаем дерево: A(B(E, F), C, D)
    const root = tree('A')
    const b = tree('B')
    const c = tree('C')
    const d = tree('D')
    const e = tree('E')
    const f = tree('F')

    b.addChild(e)
    b.addChild(f)
    root.addChild(b)
    root.addChild(c)
    root.addChild(d)

    const result = renderTree(root)
    const expected = 'A---+\n    B---+\n    |   E\n    |   F\n    C\n    D'
    expect(result).toBe(expected)
  })
})

describe('Функция renderNode', () => {
  it('отображает листовой узел', () => {
    const node = tree('A')
    const lines = []
    renderNode(node, '', lines)
    expect(lines).toEqual(['A'])
  })

  it('отображает узел с дочерними элементами', () => {
    const root = tree('A')
    const child = tree('B')
    root.addChild(child)

    const lines = []
    renderNode(root, '', lines)
    expect(lines).toEqual(['A---+', '    B'])
  })

  it('отображает узел с префиксом', () => {
    const node = tree('A')
    const lines = []
    renderNode(node, '|   ', lines)
    expect(lines).toEqual(['|   A'])
  })
})

describe('Интеграционные тесты', () => {
  it('полный цикл: от строки до отрисовки', () => {
    const input = '(A (B C) D)'
    const parsedTree = parseTree(input)
    const rendered = renderTree(parsedTree)

    const expected = 'A---+\n    B---+\n    |   C\n    D'
    expect(rendered).toBe(expected)
  })

  it('полный цикл для сложного дерева', () => {
    const input = '(ROOT (BRANCH1 LEAF1 LEAF2) (BRANCH2 (SUBBRANCH SUBLEAF) LEAF3) LEAF4)'
    const parsedTree = parseTree(input)
    const rendered = renderTree(parsedTree)

    expect(parsedTree.value).toBe('ROOT')
    expect(parsedTree.children).toHaveLength(3)
    expect(rendered).toContain('ROOT---+')
    expect(rendered).toContain('BRANCH1---+')
    expect(rendered).toContain('BRANCH2---+')
    expect(rendered).toContain('SUBBRANCH---+')
  })

  it('обработка ошибок во время парсинга', () => {
    const invalidInputs = ['', '   ', 'A B C', '()', '((A))', '(A B', 'A B)', '(A (B) C']

    invalidInputs.forEach((input) => {
      expect(() => parseTree(input)).toThrow()
    })
  })
})
